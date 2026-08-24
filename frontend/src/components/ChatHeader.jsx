import { Loader2, Trash2, XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const {
    selectedUser,
    setSelectedUser,
    selectedMessages,
    deleteSelectedMessages,
    clearSelectedMessages,
    isDeletingSelectedMessages,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isUserOnline = onlineUsers.includes(selectedUser._id);
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

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [isDeleteModalOpen, setSelectedUser]);

  return (
    <div className="shrink-0 flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 max-h-[84px] px-6">
      <div className="flex items-center space-x-3">
        <div className={`avatar ${isUserOnline ? "online" : "offline"}`}>
          <div className="w-12 rounded-full">
            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
          </div>
        </div>

        <div>
          <h3 className="text-slate-200 font-medium">{selectedUser.fullName}</h3>
          <p className="text-slate-400 text-sm">{isUserOnline ? "Online" : "Offline"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {selectedMessages.length > 0 && (
          <button
            onClick={clearSelectedMessages}
            className="text-xs px-2 py-1 rounded-md text-slate-300 bg-slate-700/70 hover:bg-slate-700 transition-colors"
            title="Clear selected messages"
          >
            Clear ({selectedMessages.length})
          </button>
        )}

        {selectedMessages.length > 0 && (
          <button
          onClick={() => setIsDeleteModalOpen(true)}
          disabled={isDeletingSelectedMessages || selectedMessages.length === 0}
          className="p-2 rounded-md text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Delete selected messages"
          title={selectedMessages.length > 0 ? "Delete selected messages" : "Select messages to delete"}
        >
          {isDeletingSelectedMessages ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
        </button>
        )}

        <button onClick={() => setSelectedUser(null)}>
          <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
        </button>
      </div>

      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => !isDeletingSelectedMessages && setIsDeleteModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
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
                className="px-4 py-2 rounded-md bg-slate-700 text-slate-100 hover:bg-slate-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteSelectedMessages}
                disabled={isDeletingSelectedMessages || selectedMessages.length === 0}
                className="px-4 py-2 rounded-md bg-rose-600 text-white hover:bg-rose-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
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