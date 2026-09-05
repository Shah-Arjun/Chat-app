import EmptyState from "./ui/EmptyState";
import { MessageCircle } from "lucide-react";
import TypingIndicator from "./ui/TypingIndicator";

const NoConversationPlaceholder = () => {
  return (
    <EmptyState
      icon={<MessageCircle className="w-10 h-10 text-cyan-400" />}
      title="Select a conversation"
      description="Choose a contact from the sidebar to start chatting or view message history."
    >
      {/* Animated typing dots as a decorative sub-element */}
      <div className="flex items-center justify-center gap-1.5 -mt-2 mb-4">
        <TypingIndicator />
      </div>
    </EmptyState>
  );
};

export default NoConversationPlaceholder;