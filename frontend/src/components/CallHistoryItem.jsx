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
    return `${h}h ${m}m`;
  }
  if (m > 0) {
    return `${m}m ${s}s`;
  }
  return `${s}s`;
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
  const callerIdStr = (call.callerId?._id || call.callerId || call.senderId?._id || call.senderId)?.toString();
  const myIdStr = authUser?._id?.toString();
  const isOutgoing = callerIdStr === myIdStr;

  const duration = call.status === "completed" ? formatDuration(call.duration) : null;
  const timestamp = formatTime(call.createdAt || call.startedAt);

  let label = isOutgoing
    ? (isAudio ? "Outgoing audio call" : "Outgoing video call")
    : (isAudio ? "Incoming audio call" : "Incoming video call");

  let IconComponent = isAudio ? (isOutgoing ? PhoneCall : PhoneIncoming) : Video;
  let iconColor = "text-emerald-400";
  let iconBg = "bg-emerald-500/15 border border-emerald-500/30";

  if (call.status === "missed") {
    label = isOutgoing
      ? `Unanswered ${isAudio ? "audio call" : "video call"}`
      : `Missed ${isAudio ? "audio call" : "video call"}`;
    IconComponent = isOutgoing ? PhoneOff : PhoneMissed;
    iconColor = isOutgoing ? "text-amber-400" : "text-rose-400";
    iconBg = isOutgoing
      ? "bg-amber-500/15 border border-amber-500/30"
      : "bg-rose-500/15 border border-rose-500/30";
  } else if (call.status === "rejected") {
    label = isOutgoing
      ? `Declined ${isAudio ? "audio call" : "video call"}`
      : `Declined ${isAudio ? "audio call" : "video call"}`;
    IconComponent = PhoneOff;
    iconColor = "text-rose-400";
    iconBg = "bg-rose-500/15 border border-rose-500/30";
  } else if (call.status === "cancelled") {
    label = `Cancelled ${isAudio ? "audio call" : "video call"}`;
    IconComponent = isAudio ? PhoneOff : VideoOff;
    iconColor = "text-slate-400";
    iconBg = "bg-slate-700/30 border border-slate-600/30";
  } else if (call.status === "pending") {
    label = `${isOutgoing ? "Outgoing" : "Incoming"} ${isAudio ? "audio" : "video"} call`;
    IconComponent = isAudio ? Phone : Video;
    iconColor = "text-cyan-400";
    iconBg = "bg-cyan-500/15 border border-cyan-500/30";
  }

  const isPartnerOnline = selectedUser?._id ? onlineUsers.includes(selectedUser._id.toString()) : false;

  const handleCallBack = () => {
    if (!selectedUser || !isPartnerOnline || callStatus !== "idle") return;
    startCall(selectedUser, isAudio ? "audio" : "video");
  };

  return (
    <div className={`flex my-2 animate-slide-up ${isOutgoing ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border
          max-w-[85%] sm:max-w-[75%] md:max-w-[65%] shadow-sm
          ${isOutgoing
            ? "bg-[#132238] border-slate-700/60 rounded-br-sm"
            : "bg-[#141c2e] border-slate-800 rounded-bl-sm"
          }
        `}
      >
        {/* Call Icon Badge */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
        >
          <IconComponent className="h-4 w-4" />
        </div>

        {/* Call Info */}
        <div className="flex flex-col min-w-0 leading-tight">
          <span className={`font-semibold text-xs sm:text-sm truncate ${call.status === "missed" && !isOutgoing ? "text-rose-300" : "text-slate-200"}`}>
            {label}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
            {duration && (
              <>
                <span className="font-medium text-slate-300">{duration}</span>
                <span>•</span>
              </>
            )}
            <span>{timestamp}</span>
          </span>
        </div>

        {/* Quick Call Back Button */}
        {selectedUser && (
          <button
            onClick={handleCallBack}
            disabled={!isPartnerOnline || callStatus !== "idle"}
            title={
              isPartnerOnline
                ? `Call back (${isAudio ? "Audio" : "Video"})`
                : "User is offline"
            }
            aria-label={`Call back ${isAudio ? "Audio" : "Video"}`}
            className="ml-auto shrink-0 flex items-center justify-center h-8 w-8 rounded-lg
                       bg-slate-800/90 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300
                       border border-slate-700/50 hover:border-cyan-500/40
                       transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isAudio ? <Phone className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default CallHistoryItem;
