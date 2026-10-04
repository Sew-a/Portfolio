import { NavLink } from "react-router-dom";
import Avatar from "@/src/components/UI/Avatar";
import type { ChatGroup } from "@/src/lib/api/schemas";
import { chatGroupPath } from "@/src/routes/mainRoutes";
import { groupDisplayName } from "../constants";

interface ChatSidebarProps {
  groups: ChatGroup[];
  isLoading: boolean;
}

/** Every group the user belongs to, for switching chats without going back to the lobby. */
const ChatSidebar: React.FC<ChatSidebarProps> = ({ groups, isLoading }) => (
  <aside className="chat-sidebar" aria-label="Your chats">
    <div className="chat-sidebar__head">
      <h2>Chats</h2>
    </div>

    {isLoading ? (
      <p className="chat-sidebar__placeholder">Loading…</p>
    ) : (
      <ul className="chat-sidebar__list">
        {groups.map((group) => {
          const name = groupDisplayName(group);
          return (
            <li key={group.id}>
              <NavLink
                to={chatGroupPath(group.id)}
                className={({ isActive }) =>
                  `chat-sidebar__item ${isActive ? "chat-sidebar__item--active" : ""}`
                }
                title={name}
              >
                <Avatar name={name} size="sm" />
                <span className="chat-sidebar__name">{name}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    )}
  </aside>
);

export default ChatSidebar;
