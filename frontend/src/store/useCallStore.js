import toast from "react-hot-toast";
import { create } from "zustand";

// Dynamically construct STUN/TURN configuration from environment variables or defaults
const getRtcConfiguration = () => {
  const envStun = import.meta.env.VITE_STUN_SERVERS;
  const stunList = envStun
    ? envStun.split(",").map((s) => ({ urls: s.trim() })).filter((s) => Boolean(s.urls))
    : [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun.relay.metered.ca:80" },
      ];

  const iceServers = [...stunList];

  const turnServer = import.meta.env.VITE_TURN_SERVER;
  if (turnServer) {
    const turnConfig = {
      urls: turnServer.split(",").map((s) => s.trim()).filter(Boolean),
    };
    if (import.meta.env.VITE_TURN_USERNAME) {
      turnConfig.username = import.meta.env.VITE_TURN_USERNAME;
    }
    if (import.meta.env.VITE_TURN_CREDENTIAL) {
      turnConfig.credential = import.meta.env.VITE_TURN_CREDENTIAL;
    }
    iceServers.push(turnConfig);
  }

  return {
    iceServers,
    iceCandidatePoolSize: 10,
  };
};

const getAudioConstraints = (deviceId) => {
  const base = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
    channelCount: 1,
  };
  if (deviceId) {
    return { ...base, deviceId: { exact: deviceId } };
  }
  return base;
};

const preferOpusCodec = (peerConnection) => {
  if (typeof RTCRtpSender === "undefined" || !RTCRtpSender.getCapabilities) return;
  try {
    const capabilities = RTCRtpSender.getCapabilities("audio");
    if (!capabilities?.codecs) return;

    const opusCodecs = capabilities.codecs.filter(
      (c) => c.mimeType.toLowerCase() === "audio/opus"
    );
    const otherCodecs = capabilities.codecs.filter(
      (c) => c.mimeType.toLowerCase() !== "audio/opus"
    );
    const preferred = [...opusCodecs, ...otherCodecs];

    peerConnection.getTransceivers?.().forEach((transceiver) => {
      if (transceiver.sender?.track?.kind === "audio" && transceiver.setCodecPreferences) {
        try {
          transceiver.setCodecPreferences(preferred);
        } catch (_) {}
      }
    });
  } catch (e) {
    console.warn("Could not set audio codec preference:", e);
  }
};

const optimizeSdpAudio = (sdp) => {
  if (!sdp) return sdp;
  return sdp
    .replace(/a=fmtp:(\d+) minptime=\d+;useinbandfec=\d+/g, (match, pt) => {
      return `a=fmtp:${pt} minptime=10;useinbandfec=1;usedtx=1;stereo=0;sprop-stereo=0;maxaveragebitrate=64000`;
    })
    .replace(/(a=rtpmap:(\d+) opus\/48000\/2)/gi, (match, full, pt) => {
      if (!sdp.includes(`a=fmtp:${pt}`)) {
        return `${full}\r\na=fmtp:${pt} minptime=10;useinbandfec=1;usedtx=1;stereo=0;sprop-stereo=0;maxaveragebitrate=64000`;
      }
      return full;
    });
};

const stopCallMedia = (state) => {
  state.localStream?.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch (e) {
      console.warn("Error stopping local track:", e);
    }
  });
  state.remoteStream?.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch (e) {
      console.warn("Error stopping remote track:", e);
    }
  });
  if (state.peerConnection) {
    state.peerConnection.ontrack = null;
    state.peerConnection.onicecandidate = null;
    state.peerConnection.onconnectionstatechange = null;
    try {
      state.peerConnection.close();
    } catch (e) {
      console.warn("Error closing peerConnection:", e);
    }
  }
};

export const useCallStore = create((set, get) => ({
  socket: null,
  socketHandlers: null,
  callStatus: "idle", // idle | outgoing | connecting | ringing | connected
  callType: "video", // video | audio
  caller: null,
  receiver: null,
  callId: null,
  offer: null,
  peerConnection: null,
  localStream: null,
  remoteStream: null,
  isMuted: false,
  isCameraOff: false,
  error: null,
  pendingCandidates: [],
  ringTimer: null,
  callStartTime: null, // timestamp (ms) when call connected

  // Available devices
  audioDevices: [],
  videoDevices: [],
  selectedAudioDeviceId: "",
  selectedVideoDeviceId: "",

  loadDevices: async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInput = devices.filter((d) => d.kind === "audioinput");
      const videoInput = devices.filter((d) => d.kind === "videoinput");
      set({
        audioDevices: audioInput,
        videoDevices: videoInput,
        selectedAudioDeviceId: get().selectedAudioDeviceId || audioInput[0]?.deviceId || "",
        selectedVideoDeviceId: get().selectedVideoDeviceId || videoInput[0]?.deviceId || "",
      });
    } catch (err) {
      console.warn("Could not enumerate media devices:", err);
    }
  },

  initializeSocket: (socket) => {
    if (!socket) return;
    if (get().socket === socket && get().socketHandlers) return;

    // Remove any previous socket handlers
    get().socketHandlers?.forEach(([event, handler]) => get().socket?.off(event, handler));

    const handleIncomingCall = ({ callId, offer, caller, callType = "video" }) => {
      if (get().callStatus !== "idle") {
        // Already in a call — auto-reject the new incoming call
        socket.emit("call-rejected", { to: caller._id, callId, status: "rejected" });
        return;
      }
      // Ring timeout: auto-miss after 30s
      const ringTimer = setTimeout(() => get().rejectCall("missed"), 30000);
      set({
        callStatus: "ringing",
        callType: callType === "audio" ? "audio" : "video",
        callId,
        offer,
        caller,
        receiver: null,
        error: null,
        ringTimer,
      });
    };

    const handleAccepted = async ({ answer, callType }) => {
      const { peerConnection, ringTimer } = get();
      if (!peerConnection) return;
      if (ringTimer) clearTimeout(ringTimer);

      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        await get().flushCandidates();
        set({
          callStatus: "connected",
          callType: callType || get().callType,
          callStartTime: Date.now(),
        });
      } catch (err) {
        console.error("Error setting remote description on accept:", err);
        toast.error("Connection error. Please try again.");
        get().cleanupCall(false);
      }
    };

    const handleRejected = ({ reason } = {}) => {
      const { ringTimer } = get();
      if (ringTimer) clearTimeout(ringTimer);

      let message = "Call was declined.";
      if (reason === "offline") message = "User is offline.";
      else if (reason === "busy") message = "User is currently busy on another call.";
      else if (reason === "missed") message = "No answer.";

      toast.error(message);
      get().cleanupCall(false);
    };

    const handleCandidate = async ({ candidate }) => {
      if (!candidate) return;
      const { peerConnection } = get();
      if (!peerConnection || !peerConnection.remoteDescription || !peerConnection.remoteDescription.type) {
        // Buffer candidate until remote description is set
        set((state) => ({ pendingCandidates: [...state.pendingCandidates, candidate] }));
        return;
      }
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn("addIceCandidate error:", err);
      }
    };

    const handleEnded = () => {
      const { ringTimer } = get();
      if (ringTimer) clearTimeout(ringTimer);
      toast("Call ended", { icon: "📵" });
      get().cleanupCall(false);
    };

    const handleSocketDisconnect = () => {
      get().cleanupCall(false);
    };

    const socketHandlers = [
      ["incoming-call", handleIncomingCall],
      ["call-accepted", handleAccepted],
      ["call-rejected", handleRejected],
      ["ice-candidate", handleCandidate],
      ["call-ended", handleEnded],
      ["disconnect", handleSocketDisconnect],
    ];

    socketHandlers.forEach(([event, handler]) => socket.on(event, handler));
    set({ socket, socketHandlers });
  },

  createPeerConnection: (otherUserId) => {
    const rtcConfig = getRtcConfiguration();
    const peerConnection = new RTCPeerConnection(rtcConfig);
    const remoteStream = new MediaStream();

    peerConnection.ontrack = (event) => {
      const { remoteStream: currentRemote } = get();
      const stream = currentRemote || remoteStream;

      const incomingTracks = event.streams?.[0]?.getTracks() || (event.track ? [event.track] : []);

      incomingTracks.forEach((track) => {
        // If an old track of the same kind exists or has ended, remove it to prevent duplicate audio playback
        stream.getTracks().forEach((existingTrack) => {
          if (existingTrack.kind === track.kind && (existingTrack.id === track.id || existingTrack.readyState === "ended")) {
            stream.removeTrack(existingTrack);
          }
        });

        // Ensure only one active track per kind exists in remoteStream to prevent phase cancellation/comb filtering
        const sameKind = stream.getTracks().filter((t) => t.kind === track.kind);
        if (sameKind.length > 0 && !sameKind.some((t) => t.id === track.id)) {
          sameKind.forEach((old) => {
            stream.removeTrack(old);
            try { old.stop(); } catch (_) {}
          });
        }

        if (!stream.getTracks().some((t) => t.id === track.id)) {
          stream.addTrack(track);
        }
      });

      // Filter out any ended tracks
      stream.getTracks().forEach((t) => {
        if (t.readyState === "ended") {
          stream.removeTrack(t);
        }
      });

      set({ remoteStream: new MediaStream(stream.getTracks()) });
    };

    peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate) {
        get().socket?.emit("ice-candidate", { to: otherUserId, candidate });
      }
    };

    let cleanupScheduled = false;
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      console.log("PeerConnection state:", state);
      if (state === "failed" && !cleanupScheduled) {
        cleanupScheduled = true;
        setTimeout(() => get().cleanupCall(true), 1500);
      }
    };

    set({ peerConnection, remoteStream });
    return peerConnection;
  },

  getLocalStream: async (type = "video") => {
    const { selectedAudioDeviceId, selectedVideoDeviceId, localStream: existingLocal } = get();
    const isAudioOnly = type === "audio";

    // Clean up any existing local tracks before acquiring a new stream to prevent duplicate microphone streams
    if (existingLocal) {
      existingLocal.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (_) {}
      });
    }

    const audioConstraints = getAudioConstraints(selectedAudioDeviceId);

    const videoConstraints = isAudioOnly
      ? false
      : selectedVideoDeviceId
      ? { deviceId: { exact: selectedVideoDeviceId } }
      : true;

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
        video: videoConstraints,
      });

      set({ localStream, error: null, isCameraOff: isAudioOnly, isMuted: false });
      get().loadDevices();
      return localStream;
    } catch (error) {
      console.error("getUserMedia error:", error);
      // Fallback: If video request fails in video mode, attempt audio-only fallback
      if (!isAudioOnly && (error.name === "NotFoundError" || error.name === "NotReadableError")) {
        try {
          const fallbackAudioStream = await navigator.mediaDevices.getUserMedia({
            audio: audioConstraints,
            video: false,
          });
          set({
            localStream: fallbackAudioStream,
            error: null,
            isCameraOff: true,
            isMuted: false,
            callType: "audio",
          });
          toast("Camera unavailable. Proceeding with audio only.", { icon: "🎤" });
          get().loadDevices();
          return fallbackAudioStream;
        } catch (fallbackError) {
          console.error("Fallback audio-only error:", fallbackError);
        }
      }

      let message;
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        message = "Microphone/Camera permission was denied. Please allow access in your browser.";
      } else if (error.name === "NotFoundError") {
        message = "No microphone or camera device found.";
      } else if (error.name === "NotReadableError") {
        message = "Microphone/Camera is in use by another application.";
      } else {
        message = "Unable to access your media devices. Please check device settings.";
      }

      set({ error: message });
      toast.error(message, { duration: 5000 });
      return null;
    }
  },

  startCall: async (receiver, callType = "video") => {
    const { socket, getLocalStream, createPeerConnection } = get();
    if (!socket?.connected) {
      toast.error("Not connected to server.");
      return;
    }
    if (get().callStatus !== "idle") return;

    set({
      callStatus: "outgoing",
      callType: callType === "audio" ? "audio" : "video",
      receiver,
      caller: null,
      error: null,
    });

    const localStream = await getLocalStream(callType);
    if (!localStream) {
      set({ callStatus: "idle" });
      return;
    }

    const peerConnection = createPeerConnection(receiver._id);
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
    preferOpusCodec(peerConnection);

    try {
      const offer = await peerConnection.createOffer();
      if (offer.sdp) {
        offer.sdp = optimizeSdpAudio(offer.sdp);
      }
      await peerConnection.setLocalDescription(offer);
      set({ callStatus: "connecting" });
      socket.emit("call-user", {
        to: receiver._id,
        offer,
        callType: callType === "audio" ? "audio" : "video",
      });
    } catch (err) {
      console.error("Error creating offer:", err);
      toast.error("Failed to start call. Please try again.");
      get().cleanupCall(false);
    }
  },

  acceptCall: async () => {
    const { caller, offer, callId, callType, socket, getLocalStream, createPeerConnection } = get();
    if (!caller || !offer) return;

    const { ringTimer } = get();
    if (ringTimer) {
      clearTimeout(ringTimer);
      set({ ringTimer: null });
    }

    set({ error: null });

    const localStream = await getLocalStream(callType);
    if (!localStream) {
      get().cleanupCall(false);
      return;
    }

    const peerConnection = createPeerConnection(caller._id);
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
    preferOpusCodec(peerConnection);

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      await get().flushCandidates();
      const answer = await peerConnection.createAnswer();
      if (answer.sdp) {
        answer.sdp = optimizeSdpAudio(answer.sdp);
      }
      await peerConnection.setLocalDescription(answer);
      set({
        callStatus: "connected",
        receiver: caller,
        offer: null,
        callStartTime: Date.now(),
      });
      socket.emit("call-accepted", {
        to: caller._id,
        answer,
        callId,
        callType,
      });
    } catch (err) {
      console.error("Error accepting call:", err);
      toast.error("Failed to accept call.");
      get().cleanupCall(false);
    }
  },

  rejectCall: (status = "rejected") => {
    const { caller, callId, socket, ringTimer } = get();
    if (ringTimer) clearTimeout(ringTimer);
    if (caller && socket?.connected) {
      socket.emit("call-rejected", { to: caller._id, callId, status });
    }
    get().cleanupCall(false);
  },

  flushCandidates: async () => {
    const { peerConnection, pendingCandidates } = get();
    if (!peerConnection?.remoteDescription?.type || !pendingCandidates.length) return;
    const candidates = [...pendingCandidates];
    set({ pendingCandidates: [] });
    for (const candidate of candidates) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn("flushCandidates error:", err);
      }
    }
  },

  toggleMute: () => {
    const { localStream, isMuted } = get();
    if (!localStream) return;
    const nextMuted = !isMuted;
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    set({ isMuted: nextMuted });
  },

  toggleCamera: () => {
    const { localStream, isCameraOff } = get();
    if (!localStream) return;
    const nextCameraOff = !isCameraOff;
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !nextCameraOff;
    });
    set({ isCameraOff: nextCameraOff });
  },

  switchAudioDevice: async (deviceId) => {
    const { peerConnection, localStream } = get();
    try {
      const audioConstraints = getAudioConstraints(deviceId);
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
      });
      const newTrack = newStream.getAudioTracks()[0];
      if (!newTrack) return;

      const oldTrack = localStream?.getAudioTracks()[0];
      if (oldTrack && localStream) {
        localStream.removeTrack(oldTrack);
        try {
          oldTrack.stop();
        } catch (_) {}
        localStream.addTrack(newTrack);
      }

      if (peerConnection) {
        const sender = peerConnection.getSenders().find((s) => s.track?.kind === "audio");
        if (sender) {
          await sender.replaceTrack(newTrack);
        }
      }

      set({
        selectedAudioDeviceId: deviceId,
        localStream: localStream ? new MediaStream(localStream.getTracks()) : localStream,
      });
    } catch (err) {
      console.error("Error switching microphone:", err);
      toast.error("Could not switch microphone.");
    }
  },

  switchVideoDevice: async (deviceId) => {
    const { peerConnection, localStream } = get();
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });
      const newTrack = newStream.getVideoTracks()[0];
      if (!newTrack) return;

      const oldTrack = localStream?.getVideoTracks()[0];
      if (oldTrack && localStream) {
        localStream.removeTrack(oldTrack);
        try {
          oldTrack.stop();
        } catch (_) {}
        localStream.addTrack(newTrack);
      }

      if (peerConnection) {
        const sender = peerConnection.getSenders().find((s) => s.track?.kind === "video");
        if (sender) {
          await sender.replaceTrack(newTrack);
        }
      }

      set({
        selectedVideoDeviceId: deviceId,
        localStream: localStream ? new MediaStream(localStream.getTracks()) : localStream,
      });
    } catch (err) {
      console.error("Error switching camera:", err);
      toast.error("Could not switch camera.");
    }
  },

  getAudioStats: async () => {
    const { peerConnection } = get();
    if (!peerConnection) return null;
    try {
      const stats = await peerConnection.getStats();
      let inboundAudio = null;
      let outboundAudio = null;

      stats.forEach((report) => {
        if (report.type === "inbound-rtp" && report.kind === "audio") {
          inboundAudio = {
            packetsLost: report.packetsLost || 0,
            jitter: report.jitter || 0,
            bytesReceived: report.bytesReceived || 0,
            audioLevel: report.audioLevel ?? null,
            totalAudioEnergy: report.totalAudioEnergy ?? null,
          };
        } else if (report.type === "outbound-rtp" && report.kind === "audio") {
          outboundAudio = {
            bytesSent: report.bytesSent || 0,
            packetsSent: report.packetsSent || 0,
          };
        }
      });
      return { inboundAudio, outboundAudio };
    } catch (err) {
      console.warn("Error getting audio stats:", err);
      return null;
    }
  },

  endCall: () => {
    const { caller, receiver, callId, socket, callStatus } = get();
    const otherUserId = receiver?._id || caller?._id;
    if (otherUserId && socket?.connected) {
      socket.emit("call-ended", {
        to: otherUserId,
        callId,
        accepted: callStatus === "connected",
      });
    }
    get().cleanupCall(false);
  },

  cleanupCall: (notifyPeer) => {
    const state = get();
    if (notifyPeer && state.socket?.connected) {
      const otherUserId = state.receiver?._id || state.caller?._id;
      if (otherUserId) {
        state.socket.emit("call-ended", {
          to: otherUserId,
          callId: state.callId,
          accepted: state.callStatus === "connected",
        });
      }
    }
    if (state.ringTimer) clearTimeout(state.ringTimer);
    stopCallMedia(state);

    set({
      callStatus: "idle",
      callType: "video",
      caller: null,
      receiver: null,
      callId: null,
      offer: null,
      peerConnection: null,
      localStream: null,
      remoteStream: null,
      isMuted: false,
      isCameraOff: false,
      pendingCandidates: [],
      ringTimer: null,
      error: null,
      callStartTime: null,
    });
  },
}));
