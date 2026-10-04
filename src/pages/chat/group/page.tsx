import { Navigate, useParams } from "react-router-dom";
import Seo from "@/src/components/Seo";
import { useGroups } from "@/src/hooks/useGroups";
import { paths } from "@/src/routes/mainRoutes";
import AuthGate from "../components/AuthGate";
import ChatRoom from "../components/ChatRoom";
import ChatSidebar from "../components/ChatSidebar";
import "../styles.scss";

function GroupChat({ groupId }: { groupId: string }) {
  // Loads groups too, so a direct link to /chat/:groupId still gets name + invite code.
  const { groups, groupsLoaded } = useGroups();
  const group = groups.find((g) => g.id === groupId);

  return (
    <div className="chat-layout">
      <ChatSidebar groups={groups} isLoading={!groupsLoaded} />
      <ChatRoom key={groupId} groupId={groupId} group={group} />
    </div>
  );
}

export default function ChatGroupPage() {
  const { groupId } = useParams();
  if (!groupId) return <Navigate to={paths.chat} replace />;

  return (
    <main className="chat-page">
      <Seo
        title="Chat room — Sevak Avetisyan"
        description="Real-time group chat room. React client with a NestJS + Socket.io backend."
      />
      <AuthGate>
        <GroupChat groupId={groupId} />
      </AuthGate>
    </main>
  );
}
