import { Camera, CameraOff, Mic, MicOff, PhoneOff, Settings2 } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { useState, useEffect } from "react";

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * CallControls – rendered inside the Call modal bottom bar.
 * @param {number|null} callStartTime - Date.now() when call connected
 * @param {boolean} isConnected
 */
function CallControls({ callStartTime, isConnected }) {
  const {
    callType,
    isMuted,
    isCameraOff,
    toggleMute,
    toggleCamera,
    endCall,
    audioDevices,
    videoDevices,
    selectedAudioDeviceId,
    selectedVideoDeviceId,
    switchAudioDevice,
    switchVideoDevice,
  } = useCallStore();

  const [elapsed, setElapsed] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Live call duration timer without synchronous setState in effect body
  useEffect(() => {
    if (!isConnected || !callStartTime) {
      return;
    }
    const updateElapsed = () => setElapsed(Date.now() - callStartTime);
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isConnected, callStartTime]);

  const isVideo = callType === "video";
  const hasMultipleDevices = audioDevices.length > 1 || (isVideo && videoDevices.length > 1);

  return (
    <div className="relative flex flex-col items-center">
      {/* Device selector popover */}
      {showSettings && (
        <div
          className="absolute bottom-full mb-3 w-72 rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md z-30 animate-fade-in text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Device Settings
            </span>
            <button
              onClick={() => setShowSettings(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          {/* Microphone selector */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-slate-300 mb-1">Microphone</label>
            <select
              value={selectedAudioDeviceId}
              onChange={(e) => switchAudioDevice(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {audioDevices.length > 0 ? (
                audioDevices.map((dev, idx) => (
                  <option key={dev.deviceId || idx} value={dev.deviceId}>
                    {dev.label || `Microphone ${idx + 1}`}
                  </option>
                ))
              ) : (
                <option value="">Default Microphone</option>
              )}
            </select>
          </div>

          {/* Camera selector (for video calls) */}
          {isVideo && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Camera</label>
              <select
                value={selectedVideoDeviceId}
                onChange={(e) => switchVideoDevice(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {videoDevices.length > 0 ? (
                  videoDevices.map((dev, idx) => (
                    <option key={dev.deviceId || idx} value={dev.deviceId}>
                      {dev.label || `Camera ${idx + 1}`}
                    </option>
                  ))
                ) : (
                  <option value="">Default Camera</option>
                )}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3 sm:gap-6">
        {/* Duration */}
        <div className="w-16 text-center">
          {isConnected && callStartTime ? (
            <span className="text-xs font-mono text-slate-300 bg-slate-800/80 px-2 py-1 rounded-md">
              {formatDuration(elapsed)}
            </span>
          ) : (
            <span className="text-xs text-slate-500">—</span>
          )}
        </div>

        {/* Mute */}
        <button
          onClick={toggleMute}
          title={isMuted ? "Unmute (Space)" : "Mute (Space)"}
          aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
          className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-cyan-400
            ${
              isMuted
                ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 ring-1 ring-rose-500/50"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
            }`}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* End Call */}
        <button
          onClick={endCall}
          title="End call (Esc)"
          aria-label="End call"
          className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-900/50 hover:bg-rose-500 transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-rose-400"
        >
          <PhoneOff size={22} />
        </button>

        {/* Camera (Video Calls only) */}
        {isVideo && (
          <button
            onClick={toggleCamera}
            title={isCameraOff ? "Enable camera (C)" : "Disable camera (C)"}
            aria-label={isCameraOff ? "Enable camera" : "Disable camera"}
            className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-cyan-400
              ${
                isCameraOff
                  ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 ring-1 ring-rose-500/50"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
              }`}
          >
            {isCameraOff ? <CameraOff size={20} /> : <Camera size={20} />}
          </button>
        )}

        {/* Device Switcher Settings */}
        {hasMultipleDevices && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Audio & Video Devices"
            aria-label="Audio & Video Devices"
            className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all active:scale-95 ${
              showSettings
                ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/50"
                : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
            }`}
          >
            <Settings2 size={18} />
          </button>
        )}

        {/* Spacer to balance */}
        {!hasMultipleDevices && <div className="w-16" />}
      </div>
    </div>
  );
}

export default CallControls;
