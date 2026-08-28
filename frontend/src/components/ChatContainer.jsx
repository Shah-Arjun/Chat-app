import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import CallHistoryItem from "./CallHistoryItem";
import { Check } from "lucide-react";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    selectedMessages,
    toggleMessageSelection,
    typingUsers,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesContainerRef = useRef(null);

  const isPartnerTyping = Boolean(selectedUser?._id && typingUsers[selectedUser._id]);

  useEffect(() => {
    if (!selectedUser) return;
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();
    return () => { unsubscribeFromMessages(); };
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  // Auto-scroll to bottom on new messages or typing state change
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isPartnerTyping]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ChatHeader />
      <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-6">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => {
              // Call history items are always centered
              if (msg.type === "call") {
                return <CallHistoryItem key={msg._id} call={msg} />;
              }

              // Regular messages – left/right aligned
              const isMine = msg.senderId === authUser._id ||
                msg.senderId?._id === authUser._id ||
                msg.senderId?.toString() === authUser._id?.toString();

              return (
                <div key={msg._id} className={`chat ${isMine ? "chat-end" : "chat-start"}`}>
                  <div
                    onClick={() => toggleMessageSelection(msg._id)}
                    className={`chat-bubble relative ${
                      isMine ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-200"
                    } ${selectedMessages.includes(msg._id) ? "ring-2 ring-rose-400" : ""} cursor-pointer transition-all`}
                  >
                    {selectedMessages.includes(msg._id) && (
                      <span className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1">
                        <Check className="size-3" />
                      </span>
                    )}
                    {msg.image && (
                      <img src={msg.image} alt="Shared" className="rounded-lg max-h-48 object-cover" />
                    )}
                    {msg.text && <p className={msg.image ? "mt-2" : ""}>{msg.text}</p>}
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Real-time typing indicator inside message feed */}
            {isPartnerTyping && (
              <div className="chat chat-start animate-fade-in">
                <div className="chat-image avatar">
                  <div className="w-8 rounded-full border border-cyan-500/30">
                    <img
                      src={selectedUser.profilePic || "/avatar.png"}
                      alt={selectedUser.fullName}
                    />
                  </div>
                </div>
                <div className="chat-bubble bg-slate-800/80 text-slate-300 flex items-center gap-1.5 py-3 px-4 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
                  <span className="ml-2 text-xs text-slate-400">{selectedUser.fullName} is typing...</span>
                </div>
              </div>
            )}
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <div>
            <NoChatHistoryPlaceholder name={selectedUser?.fullName} />
            {isPartnerTyping && (
              <div className="max-w-3xl mx-auto mt-4 chat chat-start animate-fade-in">
                <div className="chat-bubble bg-slate-800/80 text-slate-300 flex items-center gap-1.5 py-3 px-4 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
                  <span className="ml-2 text-xs text-slate-400">{selectedUser.fullName} is typing...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0">
        <MessageInput />
      </div>
    </div>
  );
}

export default ChatContainer;