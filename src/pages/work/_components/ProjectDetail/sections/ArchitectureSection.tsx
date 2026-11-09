import { motion } from "framer-motion";
import type { Project } from "@/src/data/portfolioData";
import ContentSection from "./ContentSection";
import { SECTION_HEADINGS } from "@/src/pages/work/_components/ProjectDetail/constants";

interface ArchitectureSectionProps {
  project: Project;
}

const cardMotion = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

export default function ArchitectureSection({
  project,
}: ArchitectureSectionProps) {
  return (
    <ContentSection
      heading={SECTION_HEADINGS.architecture}
      className="project-detail__architecture"
    >
      <div className="project-detail__arch-grid">
        {project.architecture.map((item, index) => (
          <motion.div
            key={item.title}
            className="project-detail__arch-card"
            {...cardMotion}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <span className="project-detail__arch-num">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </ContentSection>
  );
}