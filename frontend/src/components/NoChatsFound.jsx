import { MessageCircleIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function NoChatsFound() {
  const { setActiveTab } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      {/* Icon container */}
      <div className="relative mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/15 to-blue-500/10
                        border border-cyan-500/20 rounded-3xl
                        flex items-center justify-center shadow-lg shadow-cyan-500/5">
          <MessageCircleIcon className="w-8 h-8 text-cyan-400" />
        </div>
        {/* Decorative ring */}
        <div className="absolute inset-0 rounded-3xl border border-cyan-500/10 scale-110 opacity-50" />
      </div>

      <h4 className="text-slate-200 font-semibold text-[15px] mb-1.5">No conversations yet</h4>
      <p className="text-slate-500 text-xs sm:text-sm max-w-[200px] mb-5 leading-relaxed">
        Start a new chat by selecting a contact from the contacts tab
      </p>

      <button
        onClick={() => setActiveTab("contacts")}
        className="px-4 py-2 text-xs font-semibold text-cyan-300
                   bg-cyan-500/10 hover:bg-cyan-500/20
                   border border-cyan-500/20 hover:border-cyan-500/35
                   rounded-xl transition-all duration-200 active:scale-95
                   shadow-sm"
      >
        Browse Contacts
      </button>
    </div>
  );
}
export default NoChatsFound;