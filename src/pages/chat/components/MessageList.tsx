import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/src/lib/api/schemas";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId?: string;
  hasMore: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  hasMore,
  isLoadingOlder,
  onLoadOlder,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const lastId = messages[messages.length - 1]?.id;

  // Stick to the bottom when a newer message arrives (not when older pages are prepended).
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lastId]);

  return (
    <div className="chat-room__messages" ref={listRef}>
      {hasMore && (
        <button className="chat-room__older" onClick={onLoadOlder} disabled={isLoadingOlder}>
          {isLoadingOlder ? "Loading…" : "Load older messages"}
        </button>
      )}
      {messages.length === 0 ? (
        <p className="chat-room__placeholder">No messages yet — say hi 👋</p>
      ) : (
        <ul>
          {messages.map((m) => (
            <MessageItem key={m.id} message={m} isOwn={m.userId === currentUserId} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default MessageList;
