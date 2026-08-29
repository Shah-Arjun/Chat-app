import { useEffect, useRef, useCallback } from "react";
import { MicOff, Phone, Video, WifiOff, Volume2 } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import CallControls from "./CallControls";

const STATUSES = ["outgoing", "connecting", "connected"];

// Audio Call Screen or Calling Indicator
function AudioCallView({ user, statusText, isConnected, isMuted, remoteStream }) {
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream || null;
      if (remoteStream) {
        const playPromise = remoteAudioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => console.warn("Audio play error:", err));
        }
      }
    }
    return () => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = null;
      }
    };
  }, [remoteStream]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-slate-900 via-[#0a1527] to-slate-950 p-6">
      {/* Hidden audio element to play remote audio */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Pulsing Avatar */}
      <div className="relative flex items-center justify-center">
        {isConnected ? (
          <>
            <span className="absolute inline-flex h-36 w-36 animate-ping rounded-full bg-emerald-500/20 duration-1000" />
            <span className="absolute inline-flex h-28 w-28 rounded-full bg-emerald-500/10" />
          </>
        ) : (
          <>
            <span className="absolute inline-flex h-36 w-36 animate-ping rounded-full bg-cyan-400/20" />
            <span className="absolute inline-flex h-28 w-28 animate-ping rounded-full bg-cyan-400/30 [animation-delay:300ms]" />
          </>
        )}
        <img
          src={user?.profilePic || "/avatar.png"}
          alt={user?.fullName || "User"}
          className={`relative h-24 w-24 rounded-full object-cover border-4 shadow-2xl ${
            isConnected ? "border-emerald-400/60 shadow-emerald-500/20" : "border-cyan-400/50 shadow-cyan-500/20"
          }`}
        />
        {/* Status icon badge */}
        <div
          className={`absolute bottom-0 right-0 rounded-full p-2 border-2 border-slate-900 shadow-md ${
            isConnected ? "bg-emerald-500 text-white" : "bg-cyan-500 text-white"
          }`}
        >
          {isConnected ? <Volume2 size={16} /> : <Phone size={16} />}
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-2xl font-bold text-white tracking-tight">{user?.fullName}</h3>
        <p className={`mt-1 text-sm font-medium ${isConnected ? "text-emerald-400" : "text-cyan-400 animate-pulse"}`}>
          {isConnected ? "Audio call in progress" : statusText || "Calling…"}
        </p>
      </div>

      {/* Muted local indicator */}
      {isMuted && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 px-3 py-1 text-xs text-rose-400">
          <MicOff size={13} />
          <span>Microphone is muted</span>
        </div>
      )}
    </div>
  );
}

// Pulsing avatar ring for outgoing/connecting state in video calls
function CallingIndicator({ user, statusText }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-slate-950/95 z-10">
      <div className="relative flex items-center justify-center">
        <span className="absolute inline-flex h-28 w-28 animate-ping rounded-full bg-cyan-400/20" />
        <span className="absolute inline-flex h-20 w-20 animate-ping rounded-full bg-cyan-400/30 [animation-delay:300ms]" />
        <img
          src={user?.profilePic || "/avatar.png"}
          alt={user?.fullName || "User"}
          className="relative h-20 w-20 rounded-full object-cover border-2 border-cyan-400/50"
        />
      </div>
      <div className="text-center">
        <p className="text-xl font-semibold text-white">{user?.fullName}</p>
        <p className="mt-1 text-sm text-cyan-300 animate-pulse">{statusText}</p>
      </div>
    </div>
  );
}

// Error overlay
function ErrorOverlay({ message, onClose }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-slate-950/95 px-6 text-center">
      <div className="rounded-full bg-rose-500/20 p-4">
        <WifiOff className="h-8 w-8 text-rose-400" />
      </div>
      <div>
        <p className="text-base font-semibold text-white">Connection Error</p>
        <p className="mt-2 text-sm text-slate-400">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="mt-2 rounded-lg bg-rose-600 px-6 py-2 text-sm font-medium text-white hover:bg-rose-500 transition-colors"
      >
        Close
      </button>
    </div>
  );
}

function VideoCall() {
  const {
    callStatus,
    callType,
    caller,
    receiver,
    localStream,
    remoteStream,
    error,
    endCall,
    toggleMute,
    toggleCamera,
    isMuted,
    isCameraOff,
    callStartTime,
  } = useCallStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const active = STATUSES.includes(callStatus);
  const isAudioCall = callType === "audio";

  // Wire streams to video elements
  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream || null;
      if (localStream) {
        const playPromise = localVideoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => console.warn("Local video play error:", e));
        }
      }
    }
    return () => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    };
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream || null;
      if (remoteStream) {
        const playPromise = remoteVideoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => console.warn("Remote video play error:", e));
        }
      }
    }
    return () => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    };
  }, [remoteStream]);

  // Keyboard shortcuts: Space = mute, C = camera, Escape = end
  const handleKeyDown = useCallback(
    (e) => {
      if (!active) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        toggleMute();
      }
      if (e.code === "KeyC" && !isAudioCall) {
        e.preventDefault();
        toggleCamera();
      }
      if (e.code === "Escape") {
        e.preventDefault();
        endCall();
      }
    },
    [active, isAudioCall, toggleMute, toggleCamera, endCall]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!active) return null;

  const otherUser = receiver || caller;
  const isConnected = callStatus === "connected";
  const isOutgoing = callStatus === "outgoing" || callStatus === "connecting";
  const statusText =
    callStatus === "outgoing"
      ? "Calling…"
      : callStatus === "connecting"
      ? "Connecting…"
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4">
      {/* Main call container */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-5xl sm:rounded-2xl overflow-hidden bg-slate-950 border-0 sm:border sm:border-slate-800 shadow-2xl flex flex-col">
        {/* Call View Area */}
        <div className="relative flex-1 min-h-[380px] sm:min-h-[500px] bg-slate-950 overflow-hidden">
          {isAudioCall ? (
            /* Audio Call Layout */
            <AudioCallView
              user={otherUser}
              statusText={statusText}
              isConnected={isConnected}
              isMuted={isMuted}
              remoteStream={remoteStream}
            />
          ) : (
            /* Video Call Layout */
            <>
              {/* Remote Video (Main) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`h-full w-full object-contain transition-opacity duration-500 ${
                  isConnected && remoteStream ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Calling / Connecting Overlay */}
              {(isOutgoing || (!remoteStream && isConnected)) && (
                <CallingIndicator user={otherUser} statusText={statusText || "Connecting…"} />
              )}

              {/* Caller badge in connected video view */}
              {isConnected && otherUser && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/10">
                  <img
                    src={otherUser.profilePic || "/avatar.png"}
                    alt={otherUser.fullName}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                  <span className="text-xs font-medium text-white">{otherUser.fullName}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isMuted && <MicOff size={13} className="text-rose-400 ml-1" />}
                </div>
              )}

              {/* Local Video PiP */}
              <div className="absolute bottom-6 right-4 sm:right-6 z-10 group">
                <div className="relative overflow-hidden rounded-xl border border-white/20 shadow-2xl bg-black w-28 h-20 sm:w-44 sm:h-32">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`h-full w-full object-cover transition-opacity ${
                      isCameraOff ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  {isCameraOff && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 gap-1">
                      <Video className="h-6 w-6 text-slate-500" />
                      <span className="text-[10px] text-slate-400">Camera Off</span>
                    </div>
                  )}
                  {isMuted && (
                    <div className="absolute top-1.5 right-1.5 bg-rose-600/90 rounded-full p-1 text-white">
                      <MicOff size={11} />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Error overlay */}
          {error && <ErrorOverlay message={error} onClose={endCall} />}
        </div>

        {/* Controls bar (bottom) */}
        <div className="shrink-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-4">
          <CallControls callStartTime={callStartTime} isConnected={isConnected} />
        </div>
      </div>
    </div>
  );
}

export default VideoCall;
