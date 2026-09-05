import { useChatStore } from "../store/useChatStore";
import { MessageSquare, Users, Search, X } from "lucide-react";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab, chats, allContacts, searchQuery, setSearchQuery } = useChatStore();

  return (
    <div className="shrink-0 px-2 sm:px-3 py-2.5 space-y-2.5 border-b border-slate-800 bg-[#0e1628]">

      {/* ── Search Bar ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={activeTab === "chats" ? "Search conversations..." : "Search contacts..."}
          className="w-full rounded-xl bg-[#141e34] border border-slate-700/60
                     pl-9 pr-8 py-2.5
                     text-xs sm:text-sm text-slate-100 placeholder:text-slate-500
                     focus:outline-none focus:border-cyan-500 focus:bg-[#18233c]
                     focus:ring-2 focus:ring-cyan-500/20
                     transition-all duration-200"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400
                       hover:text-white p-0.5 rounded-md transition-colors duration-150"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── Segmented Tab Pill ── */}
      <div role="tablist" className="flex rounded-xl bg-[#141e34] p-1 border border-slate-700/60 gap-1">
        {/* Chats Tab */}
        <button
          role="tab"
          onClick={() => setActiveTab("chats")}
          className={`
            flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 px-2
            text-xs sm:text-sm font-medium transition-all duration-200
            ${activeTab === "chats"
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
            }
          `}
          aria-label="Conversations tab"
          aria-selected={activeTab === "chats"}
        >
          <MessageSquare className="h-3.5 w-3.5 shrink-0" />
          <span>Chats</span>
          {chats.length > 0 && (
            <span className={`
              rounded-full px-1.5 py-px text-[10px] font-semibold leading-none
              transition-all duration-200
              ${activeTab === "chats"
                ? "bg-white/20 text-white"
                : "bg-slate-700 text-slate-300"
              }
            `}>
              {chats.length > 99 ? "99+" : chats.length}
            </span>
          )}
        </button>

        {/* Contacts Tab */}
        <button
          role="tab"
          onClick={() => setActiveTab("contacts")}
          className={`
            flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 px-2
            text-xs sm:text-sm font-medium transition-all duration-200
            ${activeTab === "contacts"
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
            }
          `}
          aria-label="Contacts tab"
          aria-selected={activeTab === "contacts"}
        >
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span>Contacts</span>
          {allContacts.length > 0 && (
            <span className={`
              rounded-full px-1.5 py-px text-[10px] font-semibold leading-none
              transition-all duration-200
              ${activeTab === "contacts"
                ? "bg-white/20 text-white"
                : "bg-slate-700 text-slate-300"
              }
            `}>
              {allContacts.length > 99 ? "99+" : allContacts.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export default ActiveTabSwitch;