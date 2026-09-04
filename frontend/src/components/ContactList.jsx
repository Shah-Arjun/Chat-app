import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
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
      <div className="py-12 text-center px-4 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/70 border border-slate-700/50
                        flex items-center justify-center mx-auto mb-3">
          <Users className="h-7 w-7 text-slate-500" />
        </div>
        <p className="text-slate-300 font-medium text-sm mb-1">No contacts available</p>
        <p className="text-slate-500 text-xs">Other registered users will appear here.</p>
      </div>
    );
  }

  const filteredContacts = allContacts.filter((contact) => {
    if (!searchQuery) return true;
    return (
      contact.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (filteredContacts.length === 0) {
    return (
      <div className="py-10 text-center px-4 animate-fade-in">
        <UserCheck className="h-8 w-8 text-slate-600 mx-auto mb-2.5" />
        <p className="text-slate-400 text-xs sm:text-sm">
          No contacts matching{" "}
          <span className="text-slate-300 font-medium">"{searchQuery}"</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {filteredContacts.map((contact) => {
        const isSelected = selectedUser?._id === contact._id;
        const isOnline   = onlineUsers.includes(contact._id?.toString());

        return (
          <button
            key={contact._id}
            type="button"
            onClick={() => setSelectedUser(contact)}
            className={`
              sidebar-item p-2.5 sm:p-3 group
              ${isSelected ? "sidebar-item-active" : "sidebar-item-inactive"}
            `}
            aria-label={`Select contact ${contact.fullName}`}
            aria-current={isSelected ? "true" : undefined}
          >
            {/* Active Left Bar */}
            {isSelected && (
              <span
                className="absolute left-0 top-2.5 bottom-2.5 w-[3px]
                           bg-cyan-400 rounded-r-full shadow-glow-bar"
              />
            )}

            {/* Avatar + Badge */}
            <div className="relative shrink-0">
              <img
                src={contact.profilePic || "/avatar.png"}
                alt={contact.fullName}
                className={`
                  h-11 w-11 sm:h-12 sm:w-12 rounded-full object-cover
                  border-2 shadow-sm transition-all duration-200
                  ${isSelected
                    ? "border-cyan-500/50"
                    : "border-slate-700/60 group-hover:border-slate-600/80"
                  }
                `}
              />
              <span
                className={`
                  absolute bottom-0 right-0 h-3 w-3 rounded-full
                  border-2 border-slate-900 shadow-sm
                  ${isOnline ? "bg-emerald-500 animate-pulse-dot" : "bg-slate-600"}
                `}
                title={isOnline ? "Online" : "Offline"}
              />
            </div>

            {/* Name + Email */}
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <h3 className={`
                  font-semibold text-sm truncate leading-tight
                  ${isSelected ? "text-cyan-200" : "text-slate-100"}
                `}>
                  {contact.fullName}
                </h3>
                {isOnline ? (
                  <span className="shrink-0 text-[10px] font-semibold text-emerald-400
                                   bg-emerald-500/10 border border-emerald-500/20
                                   rounded-full px-1.5 py-px leading-none">
                    Active
                  </span>
                ) : (
                  <span className="shrink-0 text-[10px] font-medium text-slate-500">
                    Offline
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate min-w-0">
                {contact.email || "Click to start chat"}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ContactList;