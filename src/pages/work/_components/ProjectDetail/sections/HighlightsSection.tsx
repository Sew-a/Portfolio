import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { Project } from "@/src/data/portfolioData";
import ContentSection from "./ContentSection";
import { SECTION_HEADINGS } from "@/src/pages/work/_components/ProjectDetail/constants";

interface HighlightsSectionProps {
  project: Project;
}

const itemMotion = {
  initial: { opacity: 0, x: -18 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: "-40px" },
};

export default function HighlightsSection({
  project,
}: HighlightsSectionProps) {
  return (
    <ContentSection
      heading={SECTION_HEADINGS.highlights}
      className="project-detail__highlights"
    >
      <ul className="project-detail__highlight-list">
        {project.highlights.map((item, index) => (
          <motion.li
            key={item}
            {...itemMotion}
            transition={{ duration: 0.5, delay: index * 0.07 }}
          >
            <CheckCircle2 size={17} className="project-detail__check" />
            {item}
          </motion.li>
        ))}
      </ul>
    </ContentSection>
  );
}