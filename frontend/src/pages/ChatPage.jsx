import { useChatStore } from "../store/useChatStore";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatList from "../components/ChatList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

import React from "react";

class ChatErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Chat error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <p className="text-rose-400 font-semibold mb-2">Something went wrong in this chat</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 text-xs font-medium rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();

  return (
    <div className="relative w-full h-full min-h-0 flex flex-row overflow-hidden bg-[#070c18]">

      {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
      {/* Desktop/Tablet (md+): Always visible on left (w-80 lg:w-96)
          Mobile (<md): Full screen when no active chat is selected */}
      <aside
        className={`
          flex flex-col min-h-0 shrink-0 h-full select-none
          bg-[#0e1628] border-r border-slate-800/80
          w-full md:w-80 lg:w-96
          ${selectedUser ? "hidden md:flex" : "flex"}
        `}
        aria-label="Sidebar navigation"
      >
        <ProfileHeader />
        <ActiveTabSwitch />
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2 sm:p-3 space-y-1">
          {activeTab === "chats" ? <ChatList /> : <ContactList />}
        </div>
      </aside>

      {/* ── RIGHT CHAT AREA ───────────────────────────────────────────── */}
      {/* Desktop/Tablet (md+): Always visible on right (flex-1)
          Mobile (<md): Full screen when a chat partner is selected */}
      <main
        className={`
          flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col
          bg-[#070c18]
          h-full w-full
          ${selectedUser ? "flex" : "hidden md:flex"}
        `}
        aria-label="Chat conversation"
      >
        {selectedUser ? (
          <ChatErrorBoundary key={selectedUser._id}>
            <ChatContainer />
          </ChatErrorBoundary>
        ) : (
          <NoConversationPlaceholder />
        )}
      </main>

    </div>
  );
}

export default ChatPage;