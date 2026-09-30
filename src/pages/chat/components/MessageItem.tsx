import Avatar from "@/src/components/UI/Avatar";
import type { ChatMessage } from "@/src/lib/api/schemas";
import { formatMessageTime } from "../constants";

interface MessageItemProps {
  message: ChatMessage;
  isOwn: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn }) => (
  <li className={`chat-message ${isOwn ? "chat-message--own" : ""}`}>
    {!isOwn && (
      <Avatar name={message.user.username} src={message.user.avatarUrl} size="sm" />
    )}
    <div className="chat-message__bubble">
      <div className="chat-message__meta">
        {!isOwn && <strong>{message.user.username}</strong>}
        <time dateTime={message.createdAt}>{formatMessageTime(message.createdAt)}</time>
      </div>
      {message.imageUrl && (
        <img src={message.imageUrl} alt="" className="chat-message__image" loading="lazy" />
      )}
      {message.content && <p>{message.content}</p>}
    </div>
  </li>
);

export default MessageItem;
