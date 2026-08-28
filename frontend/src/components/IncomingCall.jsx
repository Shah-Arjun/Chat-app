import { Phone, PhoneOff, Video } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { useState } from "react";

function IncomingCall() {
  const { callStatus, caller, callType, acceptCall, rejectCall } = useCallStore();
  const [isAccepting, setIsAccepting] = useState(false);

  if (callStatus !== "ringing") return null;

  const isAudio = callType === "audio";

  const handleAccept = async () => {
    setIsAccepting(true);
    await acceptCall();
    setIsAccepting(false);
  };

  return (
    <div
      role="dialog"
      aria-label={`Incoming ${isAudio ? "audio" : "video"} call`}
      className="fixed right-4 top-4 z-[60] w-72 sm:w-80 animate-slide-in"
    >
      {/* Card */}
      <div className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-900/95 backdrop-blur-md shadow-2xl shadow-black/50">
        {/* Animated top bar */}
        <div
          className={`h-0.5 w-full bg-gradient-to-r from-transparent ${
            isAudio ? "via-emerald-400" : "via-cyan-400"
          } to-transparent animate-pulse`}
        />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full ${
                isAudio ? "bg-emerald-500/20" : "bg-cyan-500/20"
              }`}
            >
              {isAudio ? (
                <Phone className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Video className="h-3.5 w-3.5 text-cyan-400" />
              )}
            </div>
            <p className={`text-sm font-medium ${isAudio ? "text-emerald-300" : "text-cyan-300"}`}>
              {isAudio ? "Incoming audio call" : "Incoming video call"}
            </p>
            {/* Pulse indicator */}
            <span className="ml-auto flex gap-0.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isAudio ? "bg-emerald-400" : "bg-cyan-400"
                } animate-bounce [animation-delay:0ms]`}
              />
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isAudio ? "bg-emerald-400" : "bg-cyan-400"
                } animate-bounce [animation-delay:150ms]`}
              />
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isAudio ? "bg-emerald-400" : "bg-cyan-400"
                } animate-bounce [animation-delay:300ms]`}
              />
            </span>
          </div>

          {/* Caller info */}
          <div className="flex items-center gap-3 mb-5">
            {/* Avatar with ring */}
            <div className="relative shrink-0">
              <div
                className={`absolute inset-0 rounded-full ${
                  isAudio ? "bg-emerald-400/30" : "bg-cyan-400/30"
                } animate-ping`}
              />
              <img
                src={caller?.profilePic || "/avatar.png"}
                alt={caller?.fullName || "Caller"}
                className={`relative h-14 w-14 rounded-full object-cover border-2 ${
                  isAudio ? "border-emerald-400/40" : "border-cyan-400/40"
                }`}
              />
            </div>
            <div>
              <p className="font-semibold text-white text-base leading-tight">{caller?.fullName}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAudio ? "wants to audio call" : "wants to video call"}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => rejectCall("rejected")}
              disabled={isAccepting}
              aria-label="Decline call"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600/20 border border-rose-500/30 px-3 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <PhoneOff size={16} />
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              aria-label="Accept call"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-medium text-white hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-70 shadow-lg shadow-emerald-900/40"
            >
              {isAccepting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Connecting…
                </>
              ) : (
                <>
                  <Phone size={16} />
                  Accept
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncomingCall;
