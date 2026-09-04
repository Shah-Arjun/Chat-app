import { MessageCircle, Sparkles } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const QUICK_PROMPTS = [
  { label: "👋 Say Hello",     text: "👋 Hey there! How are you doing?" },
  { label: "🤝 How are you?", text: "🤝 Great to connect with you here!" },
  { label: "☕ Catch up soon?",text: "☕ Are you free to catch up soon?" },
];

function NoChatHistoryPlaceholder({ name }) {
  const { sendMessage } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center
                    px-5 py-8 animate-fade-in max-w-sm mx-auto">
      {/* Icon container */}
      <div className="relative mb-5">
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 via-blue-500/15 to-violet-500/10
                        border border-cyan-500/25 rounded-[28px]
                        flex items-center justify-center
                        shadow-xl shadow-cyan-500/10">
          <MessageCircle className="w-9 h-9 text-cyan-400" />
        </div>
        {/* Sparkle accent */}
        <Sparkles className="absolute -top-2 -right-1 w-4 h-4 text-cyan-300/70 animate-pulse" />
        {/* Decorative ring */}
        <div className="absolute inset-0 rounded-[28px] border border-cyan-500/20 scale-[1.15] opacity-60" />
      </div>

      <h3 className="text-lg font-bold text-slate-100 mb-1.5">
        Start a chat with{" "}
        <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          {name}
        </span>
      </h3>
      <p className="text-slate-500 text-xs sm:text-sm mb-7 leading-relaxed max-w-[260px]">
        Send a message or pick a conversation starter below to break the ice!
      </p>

      {/* Quick prompts */}
      <div className="flex flex-wrap gap-2 justify-center">
        {QUICK_PROMPTS.map(({ label, text }) => (
          <button
            key={label}
            onClick={() => sendMessage({ text, image: null })}
            className="px-4 py-2 text-xs font-medium text-cyan-300
                       bg-slate-800/80 hover:bg-cyan-500/15
                       border border-slate-700/60 hover:border-cyan-500/35
                       rounded-full transition-all duration-200 active:scale-95
                       shadow-sm"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default NoChatHistoryPlaceholder;