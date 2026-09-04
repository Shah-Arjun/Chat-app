import { useEffect, useRef, useState, useCallback } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { ImagePlus, Send, X, Smile } from "lucide-react";

const QUICK_EMOJIS = ["❤️", "👍", "🔥", "😂", "😮", "🎉", "🙏", "💯", "😍", "✨", "🤝", "👏"];

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingEmittedRef = useRef(false);

  const { sendMessage, isSoundEnabled, selectedUser } = useChatStore();
  const { socket } = useAuthStore();

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (isTypingEmittedRef.current && socket?.connected && selectedUser?._id) {
      socket.emit("typing:stop", { to: selectedUser._id });
      isTypingEmittedRef.current = false;
    }
  }, [socket, selectedUser]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setText(val);
    if (isSoundEnabled) playRandomKeyStrokeSound();

    if (!selectedUser?._id || !socket?.connected) return;

    if (val.trim()) {
      if (!isTypingEmittedRef.current) {
        socket.emit("typing:start", { to: selectedUser._id });
        isTypingEmittedRef.current = true;
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => { stopTyping(); }, 900);
    } else {
      stopTyping();
    }
  };

  useEffect(() => {
    return () => { stopTyping(); };
  }, [selectedUser?._id, stopTyping]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    stopTyping();
    sendMessage({ text: text.trim(), image: imagePreview });
    setText("");
    setImagePreview(null);
    setShowEmojiPicker(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const canSend = text.trim() || imagePreview;

  return (
    <div className="shrink-0 px-3 sm:px-5 py-3 sm:py-4
                    border-t border-slate-800 bg-[#0e1628] pb-safe">

      {/* ── Quick Emoji Bar ── */}
      {showEmojiPicker && (
        <div className="max-w-3xl mx-auto mb-3 animate-slide-in">
          <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none
                          p-1.5 rounded-2xl bg-slate-800/90 border border-slate-700/50 shadow-lg">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="flex-shrink-0 h-9 w-9 rounded-xl
                           hover:bg-slate-700/80 flex items-center justify-center
                           text-lg active:scale-90 transition-transform duration-100"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Image Preview Chip ── */}
      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-3 animate-slide-in">
          <div className="relative inline-block group">
            <img
              src={imagePreview}
              alt="Attachment preview"
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl
                         border-2 border-cyan-500/40 shadow-lg"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full
                         bg-rose-600 hover:bg-rose-500 flex items-center justify-center
                         text-white shadow-md transition-transform duration-150 active:scale-90"
              type="button"
              aria-label="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Composer Form ── */}
      <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-center gap-2">
        {/* Emoji Toggle */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`icon-btn h-10 w-10 shrink-0 transition-all duration-200
            ${showEmojiPicker
              ? "text-cyan-400 bg-cyan-500/15 border border-cyan-500/25"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700/50"
            }`}
          title="Emoji"
          aria-label="Toggle emoji picker"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Text Input */}
        <div className="relative flex-1 min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full bg-slate-800/80 border border-slate-700/50 rounded-2xl
                       py-2.5 px-4
                       text-sm sm:text-[14.5px] text-slate-100 placeholder:text-slate-500
                       focus:outline-none focus:border-cyan-500/60
                       focus:ring-2 focus:ring-cyan-500/15
                       transition-all duration-200 shadow-inner"
            placeholder="Type a message…"
            autoComplete="off"
          />
        </div>

        {/* Attach Image */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`icon-btn h-10 w-10 shrink-0 transition-all duration-200
            ${imagePreview
              ? "text-cyan-400 bg-cyan-500/15 border border-cyan-500/25"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700/50"
            }`}
          title="Attach image"
          aria-label="Attach image"
        >
          <ImagePlus className="w-5 h-5" />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!canSend}
          className={`
            icon-btn h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-2xl
            bg-gradient-to-br from-cyan-500 to-blue-600 text-white
            shadow-md shadow-cyan-500/25
            hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/35
            active:scale-95 transition-all duration-200
            disabled:opacity-35 disabled:cursor-not-allowed
            disabled:hover:from-cyan-500 disabled:hover:to-blue-600 disabled:hover:shadow-md
          `}
          aria-label="Send message"
        >
          <Send className="w-4 h-4 sm:w-[18px] sm:h-[18px] ml-0.5" />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;