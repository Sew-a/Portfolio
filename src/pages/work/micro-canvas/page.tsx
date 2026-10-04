import ProjectDetail from "../_components/ProjectDetail/ProjectDetail";
import { PROJECTS } from "@/src/data/portfolioData";
import Seo from "@/src/components/Seo";
import "../../../styles.scss";

const project = PROJECTS.find((p) => p.slug === "micro-canvas");

export default function MicroCanvas() {
  return (
    <div className="pages-spacing">
      <Seo
        title="Micro Canvas — Sevak Avetisyan"
        description="Case study of a Miro-like whiteboard micro-frontend — React, Konva, Zustand, loaded at runtime via Module Federation."
      />
      <ProjectDetail slug={project?.slug ?? "micro-canvas"} />
    </div>
  );
}
