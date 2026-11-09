import { motion } from "framer-motion";
import type { Project } from "@/src/data/portfolioData";
import ContentSection from "./ContentSection";
import { FEATURE_ICONS, SECTION_HEADINGS } from "@/src/pages/work/_components/ProjectDetail/constants";

interface FeaturesSectionProps {
  project: Project;
}

const cardMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
};

export default function FeaturesSection({ project }: FeaturesSectionProps) {
  return (
    <ContentSection
      heading={SECTION_HEADINGS.features}
      className="project-detail__features"
    >
      <div className="project-detail__feature-grid">
        {project.features.map((feature, index) => {
          const FeatureIcon = FEATURE_ICONS[index % FEATURE_ICONS.length];
          return (
            <motion.div
              key={feature.title}
              className="project-detail__feature-card"
              {...cardMotion}
              transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
            >
              <div className="project-detail__feature-icon">
                <FeatureIcon size={20} strokeWidth={1.6} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </ContentSection>
  );
}