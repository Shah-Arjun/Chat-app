import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import SidebarUserItem from "./ui/SidebarUserItem";
import EmptyState from "./ui/EmptyState";
import { MessageSquareDashed } from "lucide-react";

function ChatList() {
  const {
    getMyChatPartners,
    chats,
    isUsersLoading,
    setSelectedUser,
    selectedUser,
    searchQuery,
    typingUsers,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      chat.fullName?.toLowerCase().includes(q) ||
      chat.email?.toLowerCase().includes(q)
    );
  });

  if (filteredChats.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquareDashed className="h-8 w-8 text-slate-500" />}
        title={`No results for "${searchQuery}"`}
        description="Try a different name or email address."
      />
    );
  }

  return (
    <div className="space-y-0.5">
      {filteredChats.map((chat) => (
        <SidebarUserItem
          key={chat._id}
          user={chat}
          isSelected={selectedUser?._id === chat._id}
          isOnline={onlineUsers.includes(chat._id?.toString())}
          isTyping={Boolean(typingUsers[chat._id])}
          subText="Click to open conversation"
          onClick={() => setSelectedUser(chat)}
        />
      ))}
    </div>
  );
}

export default ChatList;