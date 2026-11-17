import { motion } from "framer-motion";
import { ArrowDown, ArrowLeft } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { Link } from "react-router-dom";
import { paths } from "@/src/routes/mainRoutes";
import type { Project } from "@/src/data/portfolioData";
import { PROJECT_HERO_COPY } from "@/src/pages/work/_components/ProjectDetail/constants";
import { RUSTY_HERO_COPY } from "@/src/pages/work/rusty-companion/constants";
import type { RustyStageState } from "@/src/pages/work/rusty-companion/useRustyStage";
import RustyStage from "./RustyStage";

interface RustyHeroProps {
  project: Project;
  stage: RustyStageState;
}

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] as const },
});

export default function RustyHero({ project, stage }: RustyHeroProps) {
  const [first, ...rest] = project.title.split(" ");

  return (
    <header className="rusty-hero">
      <div className="rusty-hero__glow" aria-hidden="true" />
      <div className="rusty-hero__inner">
        <div className="rusty-hero__text">
          <Link to={paths.work} className="rusty-hero__back">
            <ArrowLeft size={16} /> {PROJECT_HERO_COPY.allWork}
          </Link>

          <motion.span className="rusty-hero__eyebrow" {...rise(0)}>
            {RUSTY_HERO_COPY.eyebrow}
          </motion.span>

          <motion.h1 className="rusty-hero__title" {...rise(0.05)}>
            {first}
            <span className="rusty-hero__title-outline">{rest.join(" ")}</span>
          </motion.h1>

          <motion.p className="rusty-hero__tagline" {...rise(0.1)}>
            {project.tagline}
          </motion.p>

          <motion.div className="rusty-hero__badges" {...rise(0.15)}>
            <span className="rusty-hero__badge rusty-hero__badge--accent">{RUSTY_HERO_COPY.freeBadge}</span>
            <span className="rusty-hero__badge">{RUSTY_HERO_COPY.platformBadge}</span>
            <span className="rusty-hero__badge">{project.role}</span>
            <span className="rusty-hero__badge">{project.year}</span>
          </motion.div>

          <motion.p className="rusty-hero__summary" {...rise(0.2)}>
            {project.summary}
          </motion.p>

          <motion.div className="rusty-hero__actions" {...rise(0.25)}>
            <a
              href={project.links.repo}
              target="_blank"
              rel="noreferrer"
              className="rusty-hero__btn rusty-hero__btn--primary"
            >
              <FaGithub size={18} /> {RUSTY_HERO_COPY.download}
            </a>
            <a href="#install" className="rusty-hero__btn">
              {RUSTY_HERO_COPY.install} <ArrowDown size={16} />
            </a>
          </motion.div>

          <motion.ul className="rusty-hero__tech" {...rise(0.3)}>
            {project.techStack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          className="rusty-hero__stage"
          initial={{ opacity: 0, scale: 0.94, rotate: 1.5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <RustyStage stage={stage} />
        </motion.div>
      </div>
    </header>
  );
}
