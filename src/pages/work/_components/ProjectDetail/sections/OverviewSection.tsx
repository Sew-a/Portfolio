import { motion } from "framer-motion";
import type { Project } from "@/src/data/portfolioData";
import ContentSection from "./ContentSection";
import { SECTION_HEADINGS } from "@/src/pages/work/_components/ProjectDetail/constants";

interface OverviewSectionProps {
  project: Project;
}

export default function OverviewSection({ project }: OverviewSectionProps) {
  return (
    <ContentSection
      heading={SECTION_HEADINGS.overview}
      className="project-detail__overview"
    >
      <motion.p
        className="project-detail__desc"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
      >
        {project.description}
      </motion.p>
    </ContentSection>
  );
}