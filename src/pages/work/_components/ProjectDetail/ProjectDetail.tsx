import type { CSSProperties } from "react";
import { PROJECTS } from "@/src/data/portfolioData";
import MissingProject from "./sections/MissingProject";
import ProjectHero from "./sections/ProjectHero";
import ProjectScreenshot from "./sections/ProjectScreenshot";
import OverviewSection from "./sections/OverviewSection";
import ArchitectureSection from "./sections/ArchitectureSection";
import FeaturesSection from "./sections/FeaturesSection";
import HighlightsSection from "./sections/HighlightsSection";
import type { ProjectDetailProps } from "./types";
import "./styles.scss";

export default function ProjectDetail({ slug }: ProjectDetailProps) {
  const project = PROJECTS.find((p) => p.slug === slug);

  if (!project) {
    return <MissingProject />;
  }

  return (
    <section
      className="project-detail"
      style={{ "--project-accent": project.accent } as CSSProperties}
    >
      <ProjectHero project={project} />
      <ProjectScreenshot project={project} />
      <OverviewSection project={project} />
      <ArchitectureSection project={project} />
      <FeaturesSection project={project} />
      <HighlightsSection project={project} />
    </section>
  );
}