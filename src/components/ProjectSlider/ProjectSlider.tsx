import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FEATURED_WORK } from "@/src/data/portfolioData";
import { SLIDER_AUTOPLAY_MS, SLIDE_POSE } from "./constants";
import "./styles.scss";

/** Only projects with a case-study page; "coming soon" entries stay out. */
const SLIDES = FEATURED_WORK.filter((item) => item.href);

/** Circular distance from the active slide. */
function offsetOf(index: number, active: number) {
  const half = Math.floor(SLIDES.length / 2);
  return ((index - active + SLIDES.length + half) % SLIDES.length) - half;
}

export default function ProjectSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(
      () => setActive((current) => (current + 1) % SLIDES.length),
      SLIDER_AUTOPLAY_MS,
    );
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <div
      className="project-slider"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured projects"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="project-slider__stage">
        {SLIDES.map((item, index) => {
          const offset = offsetOf(index, active);
          const isActive = offset === 0;
          const pose = SLIDE_POSE[Math.min(Math.abs(offset), 2)];
          const body = (
            <>
              <img
                className="project-slider__image"
                src={item.image}
                alt={isActive ? `${item.title} screenshot` : ""}
                loading={index === 0 ? "eager" : "lazy"}
                draggable={false}
              />
              <div className="project-slider__caption">
                <span className="project-slider__title">{item.title}</span>
                <span className="project-slider__tagline">{item.tagline}</span>
              </div>
            </>
          );

          return (
            <motion.div
              key={item.slug}
              className={`project-slider__slide${isActive ? " project-slider__slide--active" : ""}`}
              style={{ "--project-accent": item.accent } as CSSProperties}
              animate={{
                x: `${offset * 52}%`,
                scale: pose.scale,
                rotateY: -Math.sign(offset) * pose.rotate,
                opacity: pose.opacity,
                zIndex: 10 - Math.abs(offset),
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden={!isActive}
            >
              {isActive && item.href ? (
                <Link to={item.href} className="project-slider__card">
                  {body}
                </Link>
              ) : (
                <button
                  type="button"
                  className="project-slider__card"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActive(index)}
                  aria-label={`Show ${item.title}`}
                  disabled={isActive}
                >
                  {body}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="project-slider__dots">
        {SLIDES.map((item, index) => (
          <button
            key={item.slug}
            type="button"
            className={`project-slider__dot${index === active ? " project-slider__dot--active" : ""}`}
            onClick={() => setActive(index)}
            aria-label={`Go to ${item.title}`}
            aria-current={index === active}
          />
        ))}
      </div>
    </div>
  );
}
