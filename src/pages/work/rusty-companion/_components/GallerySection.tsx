import { motion } from "framer-motion";
import { HeadingText } from "@/src/components/UI";
import type { Project } from "@/src/data/portfolioData";
import { GALLERY_HEADING } from "@/src/pages/work/rusty-companion/constants";

interface GallerySectionProps {
  project: Project;
}

/** The two mood sheets, side by side. The cover isn't repeated: it shows the stage that is live above. */
export default function GallerySection({ project }: GallerySectionProps) {
  const shots = project.screenshots ?? [];

  return (
    <section className="rusty-gallery">
      <HeadingText title={GALLERY_HEADING.title} label={GALLERY_HEADING.label} />
      <div className="rusty-gallery__grid">
        {shots.map((shot, index) => (
          <motion.figure
            key={shot.src}
            className={`rusty-gallery__item rusty-gallery__item--${index}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: index * 0.08 }}
          >
            <img src={shot.src} alt={shot.title} loading="lazy" />
            <figcaption>{shot.title}</figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
