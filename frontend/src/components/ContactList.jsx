import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import SidebarUserItem from "./ui/SidebarUserItem";
import EmptyState from "./ui/EmptyState";
import { UserCheck, Users } from "lucide-react";

function ContactList() {
  const {
    allContacts,
    getAllContacts,
    isUsersLoading,
    setSelectedUser,
    selectedUser,
    searchQuery,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  if (allContacts.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-7 w-7 text-slate-500" />}
        title="No contacts available"
        description="Other registered users will appear here."
      />
    );
  }

  const filteredContacts = allContacts.filter((contact) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      contact.fullName?.toLowerCase().includes(q) ||
      contact.email?.toLowerCase().includes(q)
    );
  });

  if (filteredContacts.length === 0) {
    return (
      <EmptyState
        icon={<UserCheck className="h-7 w-7 text-slate-500" />}
        title={`No results for "${searchQuery}"`}
        description="Try a different name or email address."
      />
    );
  }

  return (
    <div className="space-y-0.5">
      {filteredContacts.map((contact) => (
        <SidebarUserItem
          key={contact._id}
          user={contact}
          isSelected={selectedUser?._id === contact._id}
          isOnline={onlineUsers.includes(contact._id?.toString())}
          subText={contact.email || "Click to start chat"}
          onClick={() => setSelectedUser(contact)}
        />
      ))}
    </div>
  );
}

export default ContactList;