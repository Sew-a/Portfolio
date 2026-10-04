import ProjectDetail from "../_components/ProjectDetail/ProjectDetail";
import { PROJECTS } from "@/src/data/portfolioData";
import Seo from "@/src/components/Seo";
import "../../../styles.scss";

const project = PROJECTS.find((p) => p.slug === "chat-app");

export default function ChatApp() {
  return (
    <div className="pages-spacing">
      <Seo
        title="Real-time Group Chat — Sevak Avetisyan"
        description="Case study of a full-stack group chat — React client with a NestJS, Socket.io, PostgreSQL and Prisma backend."
      />
      <ProjectDetail slug={project?.slug ?? "chat-app"} />
    </div>
  );
}
