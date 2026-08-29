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

const stopCallMedia = (state) => {
  state.localStream?.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch (e) {
      console.warn("Error stopping track:", e);
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

      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach((track) => {
          if (!stream.getTracks().some((t) => t.id === track.id)) {
            stream.addTrack(track);
          }
        });
      } else if (event.track) {
        if (!stream.getTracks().some((t) => t.id === event.track.id)) {
          stream.addTrack(event.track);
        }
      }

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
    const { selectedAudioDeviceId, selectedVideoDeviceId } = get();
    const isAudioOnly = type === "audio";

    const audioConstraints = selectedAudioDeviceId
      ? { deviceId: { exact: selectedAudioDeviceId } }
      : true;

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

    try {
      const offer = await peerConnection.createOffer();
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

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      await get().flushCandidates();
      const answer = await peerConnection.createAnswer();
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
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = isMuted;
    });
    set({ isMuted: !isMuted });
  },

  toggleCamera: () => {
    const { localStream, isCameraOff } = get();
    if (!localStream) return;
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = isCameraOff;
    });
    set({ isCameraOff: !isCameraOff });
  },

  switchAudioDevice: async (deviceId) => {
    const { peerConnection, localStream } = get();
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
      });
      const newTrack = newStream.getAudioTracks()[0];
      if (!newTrack) return;

      const oldTrack = localStream?.getAudioTracks()[0];
      if (oldTrack && localStream) {
        localStream.removeTrack(oldTrack);
        oldTrack.stop();
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
        oldTrack.stop();
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
