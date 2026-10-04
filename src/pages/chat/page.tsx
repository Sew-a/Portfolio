import { useNavigate } from "react-router-dom";
import Seo from "@/src/components/Seo";
import { useGroups } from "@/src/hooks/useGroups";
import type { ChatGroup } from "@/src/lib/api/schemas";
import { chatGroupPath } from "@/src/routes/mainRoutes";
import AuthGate from "./components/AuthGate";
import CreateGroupForm from "./components/CreateGroupForm";
import GroupList from "./components/GroupList";
import JoinGroupForm from "./components/JoinGroupForm";
import "./styles.scss";

function ChatLobby() {
  const navigate = useNavigate();
  const { groups, groupsLoaded, error, isPending, createGroup, joinGroup } = useGroups();

  const openGroup = (group: ChatGroup | null) => {
    if (group) navigate(chatGroupPath(group.id));
  };

  if (!groupsLoaded && !error) {
    return <p className="chat-room__placeholder">Loading your groups…</p>;
  }

  const hasGroups = groups.length > 0;

  return (
    <>
      <p className="chat-page__lead">
        {hasGroups
          ? "Pick up a conversation, or start a new one."
          : "You're not in any group yet. Create one and share the invite code, or join with a code."}
      </p>

      {hasGroups && <GroupList groups={groups} />}

      <div className="chat-page__actions">
        <CreateGroupForm
          isPending={isPending}
          onCreate={async (name) => openGroup(await createGroup(name))}
        />
        <JoinGroupForm
          isPending={isPending}
          onJoin={async (code) => openGroup(await joinGroup(code))}
        />
      </div>

      {error && (
        <p className="chat-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}

export default function ChatPage() {
  return (
    <main className="chat-page">
      <Seo
        title="Chat — Sevak Avetisyan"
        description="Real-time group chat demo: sign up, create a group or join one with an invite code. React client with a NestJS + Socket.io backend."
      />
      <h1 className="chat-page__title">Chat</h1>
      <AuthGate>
        <ChatLobby />
      </AuthGate>
    </main>
  );
}
