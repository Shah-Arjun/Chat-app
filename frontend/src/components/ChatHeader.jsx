import { ArrowLeft, Loader2, Phone, Trash2, Video, XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";

function ChatHeader() {
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
  const isUserOnline = selectedUser?._id ? onlineUsers.includes(selectedUser._id.toString()) : false;
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
      if (isDeleteModalOpen) {
        setIsDeleteModalOpen(false);
        return;
      }
      setSelectedUser(null);
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [isDeleteModalOpen, setSelectedUser]);

  return (
    <div className="shrink-0 flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 min-h-[68px] px-3 sm:px-6 gap-2">
      {/* Left: Back button (mobile) + Avatar + Name */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Back button — only visible on mobile */}
        <button
          onClick={() => setSelectedUser(null)}
          className="sm:hidden flex items-center justify-center h-8 w-8 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors shrink-0"
          aria-label="Back to chat list"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Avatar with online indicator */}
        <div className={`avatar shrink-0 ${isUserOnline ? "online" : "offline"}`}>
          <div className="w-10 sm:w-12 rounded-full">
            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
          </div>
        </div>

        {/* Name + status */}
        <div className="min-w-0">
          <h3 className="text-slate-200 font-medium truncate text-sm sm:text-base">
            {selectedUser.fullName}
          </h3>
          <div className="flex items-center gap-1.5 min-h-[16px]">
            {isTyping ? (
              <span className="text-cyan-400 text-xs font-medium flex items-center gap-1 animate-pulse">
                typing...
              </span>
            ) : (
              <p className="text-slate-400 text-xs">
                {isUserOnline ? "Online" : "Offline"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Audio call button */}
        <button
          onClick={() => startCall(selectedUser, "audio")}
          disabled={!isUserOnline || callStatus !== "idle"}
          className="rounded-lg p-2 text-emerald-400 transition-colors hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Start audio call"
          title={isUserOnline ? "Start audio call" : "User is offline"}
        >
          <Phone className="h-5 w-5" />
        </button>

        {/* Video call button */}
        <button
          onClick={() => startCall(selectedUser, "video")}
          disabled={!isUserOnline || callStatus !== "idle"}
          className="rounded-lg p-2 text-cyan-300 transition-colors hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Start video call"
          title={isUserOnline ? "Start video call" : "User is offline"}
        >
          <Video className="h-5 w-5" />
        </button>

        {/* Selection controls */}
        {selectedMessages.length > 0 && (
          <>
            <button
              onClick={clearSelectedMessages}
              className="text-xs px-2 py-1 rounded-md text-slate-300 bg-slate-700/70 hover:bg-slate-700 transition-colors"
              title="Clear selection"
            >
              Clear ({selectedMessages.length})
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isDeletingSelectedMessages}
              className="p-2 rounded-md text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Delete selected messages"
              title="Delete selected messages"
            >
              {isDeletingSelectedMessages
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <Trash2 className="w-5 h-5" />
              }
            </button>
          </>
        )}

        {/* Close — hidden on mobile (use back button instead) */}
        <button
          onClick={() => setSelectedUser(null)}
          className="hidden sm:flex items-center justify-center p-1 rounded"
          aria-label="Close chat"
        >
          <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
        </button>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => !isDeletingSelectedMessages && setIsDeleteModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold text-slate-100">Delete selected messages?</h4>
            <p className="mt-2 text-sm text-slate-300">
              You are about to permanently delete {selectedMessages.length} message
              {selectedMessages.length > 1 ? "s" : ""}. This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeletingSelectedMessages}
                className="px-4 py-2 rounded-md bg-slate-700 text-slate-100 hover:bg-slate-600 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSelectedMessages}
                disabled={isDeletingSelectedMessages || selectedMessages.length === 0}
                className="px-4 py-2 rounded-md bg-rose-600 text-white hover:bg-rose-500 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {isDeletingSelectedMessages && <Loader2 className="size-4 animate-spin" />}
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