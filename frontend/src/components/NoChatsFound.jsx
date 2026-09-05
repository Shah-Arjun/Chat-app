import { useChatStore } from "../store/useChatStore";
import EmptyState from "./ui/EmptyState";
import { MessageCircleIcon } from "lucide-react";

function NoChatsFound() {
  const { setActiveTab } = useChatStore();

  return (
    <EmptyState
      icon={<MessageCircleIcon className="w-8 h-8 text-cyan-400" />}
      title="No conversations yet"
      description="Start a new chat by selecting a contact from the contacts tab."
      ctaLabel="Browse Contacts"
      onCta={() => setActiveTab("contacts")}
    />
  );
}

export default NoChatsFound;