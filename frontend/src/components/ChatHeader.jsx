import {
  ArrowLeft, Loader2, Menu, Phone, Search,
  Trash2, Video, XIcon, CheckCircle2, MoreVertical,
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";
import TypingIndicator from "./ui/TypingIndicator";

function ChatHeader({ onMenuOpen }) {
  const {
    selectedUser,
    setSelectedUser,
    selectedMessages,
    deleteSelectedMessages,
    clearSelectedMessages,
    isDeletingSelectedMessages,
    typingUsers,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { callStatus, startCall } = useCallStore();

  const isUserOnline = selectedUser?._id
    ? onlineUsers.includes(selectedUser._id.toString())
    : false;
  const isTyping = Boolean(selectedUser?._id && typingUsers[selectedUser._id]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteSelectedMessages = async () => {
    if (selectedMessages.length === 0) return;
    await deleteSelectedMessages();
    setIsDeleteModalOpen(false);
  };

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key !== "Escape") return;
      if (isDeleteModalOpen) { setIsDeleteModalOpen(false); return; }
      setSelectedUser(null);
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [isDeleteModalOpen, setSelectedUser]);

  return (
    <div className="shrink-0 flex justify-between items-center
                    bg-[#0e1628]
                    border-b border-slate-800
                    min-h-[60px] sm:min-h-[66px]
                    px-3 sm:px-4 gap-2 z-20 overflow-hidden">

      {/* ── Left: Back (mobile) + Avatar + Name ── */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Back button (mobile) — returns to sidebar conversation list */}
        <button
          onClick={() => setSelectedUser(null)}
          className="md:hidden icon-btn h-9 w-9 text-slate-400 hover:text-white
                     hover:bg-slate-800 border border-slate-700/60 -ml-1"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Partner Avatar */}
        <div className="relative shrink-0">
          <img
            src={selectedUser?.profilePic || "/avatar.png"}
            alt={selectedUser?.fullName || "User"}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover
                       border-2 border-slate-700/60 shadow-sm"
          />
          <span
            className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full
                        border-2 border-slate-900 shadow-sm
                        ${isUserOnline ? "bg-emerald-500 animate-pulse-dot" : "bg-slate-600"}`}
          />
        </div>

        {/* Name + Status */}
        <div className="min-w-0">
          <h2 className="text-slate-100 font-semibold text-sm sm:text-[15px] leading-tight truncate">
            {selectedUser?.fullName}
          </h2>
          <div className="flex items-center gap-1.5 min-h-[15px] mt-px">
            {isTyping ? (
              <span className="text-cyan-400 text-[11px] font-medium flex items-center gap-1.5">
                <TypingIndicator />
                typing…
              </span>
            ) : (
              <p className={`text-[11px] font-medium ${isUserOnline ? "text-emerald-400" : "text-slate-500"}`}>
                {isUserOnline ? "● Online" : "Offline"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Right: Selection Controls or Call Actions ── */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {selectedMessages.length > 0 ? (
          /* Selection mode */
          <div className="flex items-center gap-1.5 animate-fade-in
                          bg-slate-800/90 rounded-xl p-1
                          border border-slate-700/60 shadow-lg">
            <span className="text-xs font-semibold text-slate-300 px-2 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
              {selectedMessages.length}
            </span>
            <button
              onClick={clearSelectedMessages}
              className="text-xs px-2.5 py-1 rounded-lg text-slate-400
                         hover:text-white hover:bg-slate-700 transition-colors"
              title="Clear selection"
            >
              Clear
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isDeletingSelectedMessages}
              className="icon-btn h-7 w-7 text-rose-400 hover:text-white
                         hover:bg-rose-500 border border-transparent
                         hover:border-rose-400/40 disabled:opacity-50"
              aria-label="Delete selected messages"
            >
              {isDeletingSelectedMessages
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Trash2 className="w-3.5 h-3.5" />
              }
            </button>
          </div>
        ) : (
          <>
            {/* Search (decorative for now) --> TODO */}
            <button
              className="icon-btn h-9 w-9 text-slate-400 hover:text-slate-200
                         hover:bg-slate-800 border border-transparent hover:border-slate-700/50
                         hidden sm:flex"
              aria-label="Search messages"
              title="Search messages"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Audio Call */}
            <button
              onClick={() => startCall(selectedUser, "audio")}
              disabled={!isUserOnline || callStatus !== "idle"}
              className="icon-btn h-9 w-9
                         text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20
                         border border-emerald-500/20 hover:border-emerald-500/35
                         disabled:opacity-35 disabled:cursor-not-allowed
                         disabled:hover:bg-emerald-500/10"
              aria-label="Start audio call"
              title={isUserOnline ? "Audio call" : "User is offline"}
            >
              <Phone className="h-4 w-4" />
            </button>

            {/* Video Call */}
            <button
              onClick={() => startCall(selectedUser, "video")}
              disabled={!isUserOnline || callStatus !== "idle"}
              className="icon-btn h-9 w-9
                         text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20
                         border border-cyan-500/20 hover:border-cyan-500/35
                         disabled:opacity-35 disabled:cursor-not-allowed
                         disabled:hover:bg-cyan-500/10"
              aria-label="Start video call"
              title={isUserOnline ? "Video call" : "User is offline"}
            >
              <Video className="h-4 w-4" />
            </button>

            {/* Close (desktop) */}
            <button
              onClick={() => setSelectedUser(null)}
              className="icon-btn h-9 w-9 text-slate-500 hover:text-white
                         hover:bg-slate-800 border border-transparent
                         hover:border-slate-700/50 hidden sm:flex"
              aria-label="Close conversation"
              title="Close chat"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center
                     bg-black/70 backdrop-blur-sm px-4"
          onClick={() => !isDeletingSelectedMessages && setIsDeleteModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-700/80
                        bg-slate-900/97 p-6 shadow-2xl shadow-black/60 animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-100">Delete messages?</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              You're about to permanently delete{" "}
              <span className="text-slate-200 font-semibold">
                {selectedMessages.length} message{selectedMessages.length > 1 ? "s" : ""}
              </span>
              . This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeletingSelectedMessages}
                className="px-4 py-2 text-sm font-medium rounded-xl
                           bg-slate-800 text-slate-200
                           hover:bg-slate-700 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSelectedMessages}
                disabled={isDeletingSelectedMessages || selectedMessages.length === 0}
                className="px-4 py-2 text-sm font-semibold rounded-xl
                           bg-rose-600 text-white hover:bg-rose-500
                           transition-colors disabled:opacity-60
                           flex items-center gap-2 shadow-lg shadow-rose-900/30"
              >
                {isDeletingSelectedMessages && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatHeader;