import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useChatRoom } from "@/src/hooks/useChatRoom";
import type { ChatGroup } from "@/src/lib/api/schemas";
import { paths } from "@/src/routes/mainRoutes";
import { useAuthStore } from "@/src/store/useAuthStore";
import { groupDisplayName } from "../constants";
import InviteCode from "./InviteCode";
import MessageComposer from "./MessageComposer";
import MessageList from "./MessageList";

interface ChatRoomProps {
  groupId: string;
  group?: ChatGroup;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ groupId, group }) => {
  const userId = useAuthStore((s) => s.user?.id);
  const room = useChatRoom(groupId);

  return (
    <section className="chat-room">
      <header className="chat-room__header">
        <Link to={paths.chat} className="chat-room__back" aria-label="Back to groups">
          <ArrowLeft size={18} />
        </Link>
        <h2>{group ? groupDisplayName(group) : "Chat"}</h2>
        {group && <InviteCode code={group.inviteCode} />}
      </header>

      {room.isLoadingHistory ? (
        <p className="chat-room__placeholder">Loading messages…</p>
      ) : (
        <MessageList
          messages={room.messages}
          currentUserId={userId}
          hasMore={room.hasMore}
          isLoadingOlder={room.isLoadingOlder}
          onLoadOlder={room.loadOlder}
        />
      )}

      {room.error && (
        <p className="chat-error" role="alert">
          {room.error}
        </p>
      )}

      <MessageComposer onSend={room.sendMessage} />
    </section>
  );
};

export default ChatRoom;
