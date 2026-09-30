import { motion } from "framer-motion";
import Parallax from "@/src/components/Parallax";
import { PROJECTS_HERO, PROJECTS_HERO_ANIMATIONS } from "./constants";
import "./styles.scss";

export default function ProjectsHero() {
  return (
    <section className="projects-hero">
      <div className="projects-hero__grid-dots" aria-hidden="true" />
      <div className="projects-hero__glow" aria-hidden="true" />
      <div className="projects-hero__content">
        <motion.span
          className="projects-hero__label"
          {...PROJECTS_HERO_ANIMATIONS.label}
        >
          {PROJECTS_HERO.label}
        </motion.span>
        <motion.h1
          className="projects-hero__title"
          {...PROJECTS_HERO_ANIMATIONS.title}
        >
          {PROJECTS_HERO.title}
          <span className="projects-hero__dot">{PROJECTS_HERO.dot}</span>
        </motion.h1>
        <motion.p
          className="projects-hero__lead"
          {...PROJECTS_HERO_ANIMATIONS.lead}
        >
          {PROJECTS_HERO.lead}
        </motion.p>
      </div>
    </section>
  );
}