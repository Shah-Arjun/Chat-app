import { useChatStore } from "../store/useChatStore"
import BorderAnimatedContainer from "../components/BorderAnimatedContainer"
import ProfileHeader from "../components/ProfileHeader"
import ActiveTabSwitch from "../components/ActiveTabSwitch"
import ChatList from "../components/ChatList"
import ContactList from "../components/ContactList"
import ChatContainer from "../components/ChatContainer"
import NoConversationPlaceholder from "../components/NoConversationPlaceholder"

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore()

  return (
    // Use h-[100dvh] on mobile for proper viewport height (accounts for browser chrome)
    <div className="relative w-full max-w-6xl h-[calc(100dvh-2rem)] sm:h-[calc(100vh-4rem)]">
      <BorderAnimatedContainer>
        {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
        {/* On mobile: show sidebar only when no chat is selected */}
        <div className={`
          flex flex-col min-h-0
          bg-slate-800/50 backdrop-blur-sm
          w-full sm:w-72 md:w-80
          ${selectedUser ? "hidden sm:flex" : "flex"}
          shrink-0
        `}>
          <ProfileHeader />
          <ActiveTabSwitch />
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
            {activeTab === "chats" ? <ChatList /> : <ContactList />}
          </div>
        </div>

        {/* ── RIGHT CHAT AREA ───────────────────────────────────────────── */}
        {/* On mobile: show chat area only when a user is selected */}
        <div className={`
          flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col
          bg-slate-900/50 backdrop-blur-sm
          ${selectedUser ? "flex" : "hidden sm:flex"}
        `}>
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  )
}

export default ChatPage