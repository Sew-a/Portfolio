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
        description="Selected work of Sevak Avetisyan — collaborative form builder, AI agents platform, micro-frontends, and more."
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
