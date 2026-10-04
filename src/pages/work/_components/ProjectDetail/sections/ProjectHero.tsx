import { motion } from "framer-motion";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { paths } from "@/src/routes/mainRoutes";
import type { Project } from "@/src/data/portfolioData";
import { getProjectIcon } from "@/src/constants/projectIcons";
import LiveLink from "@/src/components/ProjectCard/LiveLink";
import { PROJECT_HERO_COPY } from "../constants";

interface ProjectHeroProps {
  project: Project;
}

const heroMotion = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] as const },
};

export default function ProjectHero({ project }: ProjectHeroProps) {
  const Icon = getProjectIcon(project.icon);

  return (
    <>
      <div className="project-detail__back">
        <Link to={paths.work}>
          <ArrowLeft size={16} /> {PROJECT_HERO_COPY.allWork}
        </Link>
      </div>

      <motion.header className="project-detail__hero" {...heroMotion}>
        <div className="project-detail__icon" aria-hidden="true">
          <Icon size={34} strokeWidth={1.5} />
        </div>
        <div className="project-detail__meta">
          {[project.role, project.year, project.status].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <h1 className="project-detail__title">{project.title}</h1>
        <p className="project-detail__tagline">{project.tagline}</p>
        <p className="project-detail__summary">{project.summary}</p>

        <div className="project-detail__tech">
          {project.techStack.map((tech) => (
            <span key={tech} className="project-detail__chip">
              {tech}
            </span>
          ))}
        </div>

        <div className="project-detail__links">
          {project.links.live && (
            <LiveLink
              href={project.links.live}
              className="project-detail__link project-detail__link--primary"
            >
              {PROJECT_HERO_COPY.liveSite} <ArrowUpRight size={16} />
            </LiveLink>
          )}
          <a
            href={project.links.repo}
            target="_blank"
            rel="noreferrer"
            className="project-detail__link"
          >
            {PROJECT_HERO_COPY.sourceCode} <ArrowUpRight size={16} />
          </a>
        </div>
      </motion.header>
    </>
  );
}