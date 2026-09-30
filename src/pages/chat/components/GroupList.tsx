import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { ChatGroup } from "@/src/lib/api/schemas";
import { chatGroupPath } from "@/src/routes/mainRoutes";
import { groupDisplayName } from "../constants";

const GroupList: React.FC<{ groups: ChatGroup[] }> = ({ groups }) => (
  <ul className="chat-groups">
    {groups.map((group) => (
      <li key={group.id}>
        <Link to={chatGroupPath(group.id)} className="chat-groups__item">
          <span className="chat-groups__name">{groupDisplayName(group)}</span>
          <span className="chat-groups__meta">
            {group.members ? `${group.members.length} members · ` : ""}
            {group.inviteCode}
          </span>
          <ChevronRight size={16} />
        </Link>
      </li>
    ))}
  </ul>
);

export default GroupList;
