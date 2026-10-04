import ProjectsHero from "./_components/ProjectsPage/ProjectsHero";
import FeaturedProjects from "./_components/ProjectsPage/FeaturedProjects";
import Grid from "@/src/components/Grid";
import Testimonials from "@/src/components/Testimonials";
import ExpertiseSection from "@/src/components/ExpertiseSection/ExpertiseSection";
import Seo from "@/src/components/Seo";
import { getGalleryImages } from "@/src/utils/gallery";
import "../../styles.scss";

export default function Work() {
  const images = getGalleryImages();

  return (
    <div className="pages-spacing">
      <Seo
        title="Work — Sevak Avetisyan"
        description="Case studies by Sevak Avetisyan: a Module Federation whiteboard, a real-time NestJS + Socket.io group chat, and an AI agents platform."
      />
      <ProjectsHero />
      <FeaturedProjects />
      <section className="slanted-band">
        <ExpertiseSection />
      </section>
      <Grid images={images} />
      <Testimonials />
    </div>
  );
}
