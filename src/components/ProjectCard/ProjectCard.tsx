import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, Code2 } from "lucide-react";
import Image from "@/src/components/Image";
import { paths } from "@/src/routes/mainRoutes";
import { getProjectIcon } from "@/src/constants/projectIcons";
import type { Project } from "@/src/data/portfolioData";
import LiveLink from "./LiveLink";
import "./styles.scss";

interface ProjectCardProps {
  project: Project;
  reverse?: boolean;
  detailed?: boolean;
}

export default function ProjectCard({
  project,
  reverse = false,
  detailed = false,
}: ProjectCardProps) {
  const Icon = getProjectIcon(project.icon);

  return (
    <motion.article
      className={`featured-project ${reverse ? "featured-project--reverse" : ""} ${detailed ? "featured-project--detailed" : ""}`}
      style={{ "--project-accent": project.accent } as React.CSSProperties}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <div className="featured-project__media">
        <div className="window">
          <div className="window__bar">
            <span className="window__dot window__dot--red" />
            <span className="window__dot window__dot--yellow" />
            <span className="window__dot window__dot--green" />
            <span className="window__title">
              <Code2 size={12} /> {project.slug}.dev
            </span>
          </div>
          <div className="window__body">
            <Image
              src={project.image}
              alt={project.imageAlt}
              width={720}
              height={450}
              className="window__shot"
            />
            <div className="window__glow" />
          </div>
        </div>
      </div>

      <div className="featured-project__body">
        <div className="featured-project__icon" aria-hidden="true">
          <Icon size={26} strokeWidth={1.6} />
        </div>
        <span className="featured-project__tagline">{project.tagline}</span>
        <h3 className="featured-project__title">{project.title}</h3>
        <p className="featured-project__summary">{project.summary}</p>

        <ul className="featured-project__highlights">
          {project.highlights.slice(0, detailed ? 5 : 4).map((item) => (
            <li key={item}>
              <CheckCircle2 size={15} className="featured-project__check" />
              {item}
            </li>
          ))}
        </ul>

        <div className="featured-project__tech">
          {project.techStack.slice(0, detailed ? 12 : 7).map((tech) => (
            <span key={tech} className="featured-project__chip">
              {tech}
            </span>
          ))}
        </div>

        <div className="featured-project__links">
          <Link
            to={`${paths.work}/${project.slug}`}
            className="featured-project__link featured-project__link--primary"
          >
            Case study <ArrowUpRight size={16} />
          </Link>
          {project.links.live && (
            <LiveLink href={project.links.live} className="featured-project__link">
              Live site <ArrowUpRight size={16} />
            </LiveLink>
          )}
          <a
            href={project.links.repo}
            target="_blank"
            rel="noreferrer"
            className="featured-project__link"
          >
            Source <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
