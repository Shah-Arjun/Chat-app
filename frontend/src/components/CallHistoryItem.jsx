import { Phone, PhoneCall, PhoneIncoming, PhoneMissed, PhoneOff, Video, VideoOff } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";
import { useChatStore } from "../store/useChatStore";

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CallHistoryItem({ call }) {
  const { authUser, onlineUsers } = useAuthStore();
  const { startCall, callStatus } = useCallStore();
  const { selectedUser } = useChatStore();

  const isAudio = call.callType === "audio";
  const isOutgoing = call.callerId?.toString() === authUser?._id?.toString();
  const duration = call.status === "completed" ? formatDuration(call.duration) : null;
  const timestamp = formatTime(call.createdAt || call.startedAt);

  let label = isAudio ? "Audio call" : "Video call";
  let IconComponent = isAudio ? (isOutgoing ? PhoneCall : PhoneIncoming) : Video;
  let color = "text-emerald-400";
  let bg = "bg-emerald-500/10 border-emerald-500/20";

  if (call.status === "missed") {
    label = isOutgoing ? `Unanswered ${isAudio ? "audio call" : "video call"}` : `Missed ${isAudio ? "audio call" : "video call"}`;
    IconComponent = PhoneMissed;
    color = "text-amber-400";
    bg = "bg-amber-500/10 border-amber-500/20";
  } else if (call.status === "rejected") {
    label = `Declined ${isAudio ? "audio call" : "video call"}`;
    IconComponent = PhoneOff;
    color = "text-rose-400";
    bg = "bg-rose-500/10 border-rose-500/20";
  } else if (call.status === "cancelled") {
    label = `Cancelled ${isAudio ? "audio call" : "video call"}`;
    IconComponent = isAudio ? PhoneOff : VideoOff;
    color = "text-slate-400";
    bg = "bg-slate-800/40 border-slate-700/30";
  } else if (call.status === "pending") {
    label = `${isAudio ? "Audio" : "Video"} call`;
    IconComponent = isAudio ? Phone : Video;
    color = "text-cyan-400";
    bg = "bg-cyan-500/10 border-cyan-500/20";
  }

  const isPartnerOnline = selectedUser ? onlineUsers.includes(selectedUser._id) : false;

  const handleCallBack = () => {
    if (!selectedUser || !isPartnerOnline || callStatus !== "idle") return;
    startCall(selectedUser, isAudio ? "audio" : "video");
  };

  return (
    <div className="flex justify-center my-3 group">
      <div
        className={`inline-flex items-center gap-3 rounded-2xl border px-4 py-2.5 text-sm ${bg} transition-all shadow-sm`}
      >
        {/* Direction indicator */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900/60 ${color}`}
        >
          <IconComponent size={15} />
        </div>

        <div className="flex flex-col leading-tight">
          <span className={`font-semibold text-xs sm:text-sm ${color}`}>{label}</span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            {duration ? `Duration: ${duration} · ` : null}
            {timestamp}
          </span>
        </div>

        {/* Callback Button */}
        {selectedUser && (
          <button
            onClick={handleCallBack}
            disabled={!isPartnerOnline || callStatus !== "idle"}
            title={isPartnerOnline ? `Call back (${isAudio ? "Audio" : "Video"})` : "User is offline"}
            aria-label={`Call back ${isAudio ? "Audio" : "Video"}`}
            className="ml-2 rounded-lg bg-slate-800/80 p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isAudio ? <Phone size={13} /> : <Video size={13} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default CallHistoryItem;
