import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
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
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (!selectedUser) return;
    
    getMessagesByUserId(selectedUser?._id);
    subscribeToMessages()

    //clean up function to unsubscribe from messages when the component unmounts or selectedUser changes
    return () => { unsubscribeFromMessages()}
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer) {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ChatHeader />
      <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto px-6 py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div key={msg._id} className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}>
                <div
                  onClick={() => toggleMessageSelection(msg._id)}
                  className={`chat-bubble relative ${
                    msg.senderId === authUser._id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  } ${selectedMessages.includes(msg._id) ? "ring-2 ring-rose-400" : ""} cursor-pointer transition-all`}
                >
                  {selectedMessages.includes(msg._id) && (
                    <span className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1">
                      <Check className="size-3" />
                    </span>
                  )}

                  {msg.image && (
                    <img src={msg.image} alt="Shared" className="rounded-lg h-48 object-cover" />
                  )}
                  {msg.text && <p className="mt-2">{msg.text}</p>}
                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser?.fullName} />
        )}
      </div>

      <div className="shrink-0">
        <MessageInput />
      </div>
    </div>
  );
}

export default ChatContainer;