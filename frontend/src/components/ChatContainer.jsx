import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import CallHistoryItem from "./CallHistoryItem";
import TypingIndicator from "./ui/TypingIndicator";
import { Check, CheckCheck, X, Download } from "lucide-react";

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
  const messageFeedRef = useRef(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const isPartnerTyping = Boolean(selectedUser?._id && typingUsers[selectedUser._id]);

  useEffect(() => {
    if (!selectedUser) return;
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();
    return () => { unsubscribeFromMessages(); };
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  const scrollToBottom = (behavior = "smooth") => {
    if (messageFeedRef.current) {
      messageFeedRef.current.scrollTo({
        top: messageFeedRef.current.scrollHeight,
        behavior,
      });
    }
  };

  // Scroll to bottom immediately on switching chat partner without affecting page/container position
  useEffect(() => {
    scrollToBottom("instant");
  }, [selectedUser?._id]);

  // Smooth scroll when new messages arrive or partner types
  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, isPartnerTyping]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* Fixed Header */}
      <ChatHeader />

      {/* Scrollable Message Feed */}
      <div
        ref={messageFeedRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 sm:px-5 py-4 sm:py-6"
      >
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-2">
            {messages.map((msg, index) => {
              // Call history items
              if (msg.type === "call") {
                return <CallHistoryItem key={msg._id || index} call={msg} />;
              }

              const isMine =
                msg.senderId === authUser._id ||
                msg.senderId?._id === authUser._id ||
                msg.senderId?.toString() === authUser._id?.toString();

              const isSelected = selectedMessages.includes(msg._id);

              return (
                <div
                  key={msg._id || index}
                  className={`flex flex-col ${isMine ? "items-end" : "items-start"} animate-slide-up group`}
                >
                  <div className={`relative max-w-[82%] sm:max-w-[72%] md:max-w-[62%] ${isMine ? "" : "ml-0"}`}>
                    {/* Bubble */}
                    <div
                      onClick={() => toggleMessageSelection(msg._id)}
                      className={`
                        msg-bubble
                        ${isMine ? "msg-bubble-sender" : "msg-bubble-receiver"}
                        ${isSelected
                          ? "ring-2 ring-rose-400 ring-offset-1 ring-offset-slate-900 scale-[0.99]"
                          : "hover:brightness-[1.06] active:scale-[0.99]"
                        }
                      `}
                    >
                      {/* Selection Check Badge */}
                      {isSelected && (
                        <span className="absolute -top-2 -right-2 bg-rose-500 text-white
                                         rounded-full p-[3px] shadow-md animate-scale-in z-10">
                          <Check className="size-3 stroke-[3]" />
                        </span>
                      )}

                      {/* Image Attachment */}
                      {msg.image && (
                        <div className="overflow-hidden rounded-xl mb-2 -mx-1 border border-black/20">
                          <img
                            src={msg.image}
                            alt="Attached media"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxImage(msg.image);
                            }}
                            className="max-h-64 sm:max-h-80 w-full object-cover rounded-xl
                                       cursor-zoom-in hover:opacity-95 transition-opacity duration-150"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Text */}
                      {msg.text && (
                        <p className="text-sm sm:text-[14.5px] leading-relaxed break-words whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      )}

                      {/* Timestamp + Read Receipt */}
                      <div
                        className={`flex items-center justify-end gap-1 mt-1.5 text-[10px]
                          ${isMine ? "text-cyan-100/70" : "text-slate-500"}`}
                      >
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMine && (
                          <CheckCheck className="h-3 w-3 text-cyan-200/80" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isPartnerTyping && (
              <div className="flex items-end gap-2 animate-fade-in">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt={selectedUser.fullName}
                  className="w-6 h-6 rounded-full object-cover border border-cyan-500/30 shadow-sm mb-0.5"
                />
                <div className="bg-slate-800/90 border border-slate-700/50 rounded-2xl rounded-bl-sm
                                px-4 py-3 flex items-center gap-1 shadow-sm">
                  <TypingIndicator />
                </div>
              </div>
            )}

            <div className="h-1" />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <div className="h-full flex flex-col justify-center">
            <NoChatHistoryPlaceholder name={selectedUser?.fullName} />

            {/* Typing when no messages yet */}
            {isPartnerTyping && (
              <div className="max-w-3xl mx-auto mt-4 flex items-center gap-2 animate-fade-in">
                <div className="bg-slate-800/90 border border-slate-700/50 rounded-2xl
                                px-4 py-3 flex items-center gap-1">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div className="h-1" />
          </div>
        )}
      </div>

      {/* Fixed Input Bar */}
      <div className="shrink-0">
        <MessageInput />
      </div>

      {/* Image Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center
                     bg-black/92 backdrop-blur-lg p-4 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90dvh] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button (top-right) */}
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-3 -right-3 z-10 h-8 w-8 flex items-center justify-center
                         rounded-full bg-slate-800 border border-slate-700
                         text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shadow-lg"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <img
              src={lightboxImage}
              alt="Full size view"
              className="max-h-[78dvh] max-w-full rounded-2xl object-contain shadow-2xl"
            />

            <a
              href={lightboxImage}
              download="image.png"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl bg-slate-800/90 border border-slate-700
                         px-4 py-2 text-xs font-semibold text-white
                         hover:bg-slate-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatContainer;