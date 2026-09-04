import { MessageCircle } from "lucide-react";

const NoConversationPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-8 animate-fade-in select-none">
      {/* Decorative chat icon container */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl
                        bg-[#0e1628]
                        border border-slate-800
                        flex items-center justify-center
                        shadow-xl shadow-black/40">
          <MessageCircle className="w-10 h-10 text-cyan-400" />
        </div>

        {/* Typing dots below icon */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          <span className="typing-dot" style={{ animationDelay: "0ms" }} />
          <span className="typing-dot" style={{ animationDelay: "200ms" }} />
          <span className="typing-dot" style={{ animationDelay: "400ms" }} />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-2">
        Select a conversation
      </h3>
      <p className="text-slate-400 text-sm max-w-[280px] leading-relaxed">
        Choose a contact from the sidebar to start chatting or view message history.
      </p>
    </div>
  );
};

export default NoConversationPlaceholder;