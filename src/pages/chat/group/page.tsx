import { Navigate, useParams } from "react-router-dom";
import Seo from "@/src/components/Seo";
import { useGroups } from "@/src/hooks/useGroups";
import { paths } from "@/src/routes/mainRoutes";
import AuthGate from "../components/AuthGate";
import ChatRoom from "../components/ChatRoom";
import "../styles.scss";

function GroupChat({ groupId }: { groupId: string }) {
  // Loads groups too, so a direct link to /chat/:groupId still gets name + invite code.
  const { groups } = useGroups();
  const group = groups.find((g) => g.id === groupId);

  return <ChatRoom key={groupId} groupId={groupId} group={group} />;
}

export default function ChatGroupPage() {
  const { groupId } = useParams();
  if (!groupId) return <Navigate to={paths.chat} replace />;

  return (
    <main className="chat-page">
      <Seo title="Chat — Sevak Avetisyan" description="Group chat room." />
      <AuthGate>
        <GroupChat groupId={groupId} />
      </AuthGate>
    </main>
  );
}
