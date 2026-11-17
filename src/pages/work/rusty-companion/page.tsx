import type { CSSProperties } from "react";
import { PROJECTS } from "@/src/data/portfolioData";
import Seo from "@/src/components/Seo";
import MissingProject from "@/src/pages/work/_components/ProjectDetail/sections/MissingProject";
import ArchitectureSection from "@/src/pages/work/_components/ProjectDetail/sections/ArchitectureSection";
import FeaturesSection from "@/src/pages/work/_components/ProjectDetail/sections/FeaturesSection";
import RustyHero from "./_components/RustyHero";
import ReactionsSection from "./_components/ReactionsSection";
import GallerySection from "./_components/GallerySection";
import InstallSection from "./_components/InstallSection";
import RustyCta from "./_components/RustyCta";
import { RUSTY_SEO, RUSTY_SLUG } from "./constants";
import { useRustyStage } from "./useRustyStage";
import "@/src/styles/sections.scss";
import "@/src/pages/work/_components/ProjectDetail/styles.scss";
import "./styles.scss";

const project = PROJECTS.find((p) => p.slug === RUSTY_SLUG);

/** Rusty's case study: a custom page with a live, interactive Rusty instead of a static screenshot. */
export default function RustyCompanion() {
  const stage = useRustyStage();

  return (
    <div className="pages-spacing">
      <Seo title={RUSTY_SEO.title} description={RUSTY_SEO.description} />
      {project ? (
        <div className="rusty-page" style={{ "--project-accent": project.accent } as CSSProperties}>
          <RustyHero project={project} stage={stage} />
          <div className="project-detail rusty-page__body">
            <ReactionsSection stage={stage} />
            <div className="project-detail__overview">
              <p className="project-detail__desc">{project.description}</p>
            </div>
            <GallerySection project={project} />
            <ArchitectureSection project={project} />
            <FeaturesSection project={project} />
            <InstallSection />
            <RustyCta repo={project.links.repo} />
          </div>
        </div>
      ) : (
        <MissingProject />
      )}
    </div>
  );
}
