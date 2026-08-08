import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="m-2 flex rounded-xl border border-white/10 bg-white/5 p-1">
      <button
        onClick={() => setActiveTab("chats")}
        className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
          activeTab === "chats"
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-slate-400 hover:text-white"
        }`}
      >
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
          activeTab === "contacts"
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-slate-400 hover:text-white"
        }`}
      >
        Contacts
      </button>
    </div>
  );
}

export default ActiveTabSwitch;