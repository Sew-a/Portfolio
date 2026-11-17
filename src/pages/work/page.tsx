import ProjectsHero from "./_components/ProjectsPage/ProjectsHero";
import FeaturedProjects from "./_components/ProjectsPage/FeaturedProjects";
import Testimonials from "@/src/components/Testimonials";
import ExpertiseSection from "@/src/components/ExpertiseSection/ExpertiseSection";
import Seo from "@/src/components/Seo";
import "@/src/styles/sections.scss";

export default function Work() {
  return (
    <div className="pages-spacing">
      <Seo
        title="Work — Sevak Avetisyan, Senior Frontend Engineer"
        description="Case studies by Sevak Avetisyan: a Module Federation whiteboard, a real-time NestJS + Socket.io group chat, an AI agents platform, The Trip, a browser action game, and Rusty, an open-source desktop robot for Claude Code."
      />
      <ProjectsHero />
      <FeaturedProjects />
      <section className="slanted-band">
        <ExpertiseSection />
      </section>
      <Testimonials />
    </div>
  );
}
