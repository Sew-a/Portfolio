import ProjectDetail from "@/src/pages/work/_components/ProjectDetail/ProjectDetail";
import { PROJECTS } from "@/src/data/portfolioData";
import Seo from "@/src/components/Seo";
import "@/src/styles/sections.scss";

const project = PROJECTS.find((p) => p.slug === "the-trip");

export default function TheTrip() {
  return (
    <div className="pages-spacing">
      <Seo
        title="The Trip — Sevak Avetisyan"
        description="Case study of The Trip, a solo-built top-down neon action game in TypeScript and Canvas 2D with Blender art. A playable demo of an indie game coming to Unity and C#."
      />
      <ProjectDetail slug={project?.slug ?? "the-trip"} />
    </div>
  );
}
