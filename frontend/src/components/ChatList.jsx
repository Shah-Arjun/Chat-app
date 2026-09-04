import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import { MessageSquareDashed } from "lucide-react";

function ChatList() {
  const {
    getMyChatPartners,
    chats,
    isUsersLoading,
    setSelectedUser,
    selectedUser,
    searchQuery,
    typingUsers,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    return (
      chat.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (filteredChats.length === 0) {
    return (
      <div className="py-10 text-center px-4 animate-fade-in">
        <MessageSquareDashed className="h-8 w-8 text-slate-600 mx-auto mb-2.5" />
        <p className="text-slate-400 text-xs sm:text-sm">
          No chats matching{" "}
          <span className="text-slate-300 font-medium">"{searchQuery}"</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {filteredChats.map((chat) => {
        const isSelected = selectedUser?._id === chat._id;
        const isOnline   = onlineUsers.includes(chat._id?.toString());
        const isTyping   = Boolean(typingUsers[chat._id]);

        return (
          <button
            key={chat._id}
            type="button"
            onClick={() => setSelectedUser(chat)}
            className={`
              sidebar-item p-2.5 sm:p-3 group
              ${isSelected ? "sidebar-item-active" : "sidebar-item-inactive"}
            `}
            aria-label={`Chat with ${chat.fullName}`}
            aria-current={isSelected ? "true" : undefined}
          >
            {/* ── Active Left Bar ── */}
            {isSelected && (
              <span
                className="absolute left-0 top-2.5 bottom-2.5 w-[3px]
                           bg-cyan-400 rounded-r-full shadow-glow-bar"
              />
            )}

            {/* ── Avatar + Status Badge ── */}
            <div className="relative shrink-0">
              <img
                src={chat.profilePic || "/avatar.png"}
                alt={chat.fullName}
                className={`
                  h-11 w-11 sm:h-12 sm:w-12 rounded-full object-cover
                  border-2 shadow-sm transition-all duration-200
                  ${isSelected
                    ? "border-cyan-500/50"
                    : "border-slate-700/60 group-hover:border-slate-600/80"
                  }
                `}
              />
              {/* Online / Offline dot */}
              <span
                className={`
                  absolute bottom-0 right-0 h-3 w-3 rounded-full
                  border-2 border-slate-900 shadow-sm
                  ${isOnline ? "bg-emerald-500 animate-pulse-dot" : "bg-slate-600"}
                `}
                title={isOnline ? "Online" : "Offline"}
              />
            </div>

            {/* ── Name + Status ── */}
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <h3 className={`
                  font-semibold text-sm truncate leading-tight
                  ${isSelected ? "text-cyan-200" : "text-slate-100"}
                `}>
                  {chat.fullName}
                </h3>
                {/* Online badge pill */}
                {isOnline ? (
                  <span className="shrink-0 text-[10px] font-semibold text-emerald-400
                                   bg-emerald-500/10 border border-emerald-500/20
                                   rounded-full px-1.5 py-px leading-none">
                    Active
                  </span>
                ) : (
                  <span className="shrink-0 text-[10px] font-medium text-slate-500">
                    Offline
                  </span>
                )}
              </div>

              {/* Sub-text: typing indicator or hint */}
              <div className="text-xs text-slate-400 truncate">
                {isTyping ? (
                  <span className="text-cyan-400 font-medium flex items-center gap-1.5">
                    <span className="flex gap-0.5">
                      <span className="typing-dot" style={{ animationDelay: "0ms" }} />
                      <span className="typing-dot" style={{ animationDelay: "160ms" }} />
                      <span className="typing-dot" style={{ animationDelay: "320ms" }} />
                    </span>
                    typing
                  </span>
                ) : (
                  <span className="opacity-60">Click to open conversation</span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ChatList;