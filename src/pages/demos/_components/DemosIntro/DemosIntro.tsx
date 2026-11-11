import { motion } from "framer-motion";
import { CANVAS_TECHNOLOGIES, DEMOS_INTRO } from "@/src/pages/demos/constants";

interface DemosIntroProps {
  onOpen: () => void;
}

export default function DemosIntro({ onOpen }: DemosIntroProps) {
  return (
    <div className="demos-page__banner-wrap">
      <motion.div
        className="demos-page__banner-copy"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <span className="demos-page__label">{DEMOS_INTRO.label}</span>
        <h2 className="demos-page__title">{DEMOS_INTRO.title}</h2>
        <p className="demos-page__lead">
          {DEMOS_INTRO.leadOne}
          <br />
          <br />
          {DEMOS_INTRO.leadTwo}
        </p>

        <div className="demos-page__tech">
          <span className="demos-page__tech-label">{DEMOS_INTRO.techLabel}</span>
          <div className="demos-page__tech-tags">
            {CANVAS_TECHNOLOGIES.map((tech) => (
              <span key={tech} className="demos-page__tech-tag">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <button
          className="demos-page__open"
          type="button"
          onClick={onOpen}
        >
          {DEMOS_INTRO.openLabel}
        </button>
      </motion.div>

      <div className="demos-page__canvas-art" aria-hidden="true">
        <div className="canvas-art__window">
          <div className="canvas-art__bar">
            <span className="canvas-art__title">canvas.miniapp</span>
          </div>
          <div className="canvas-art__body">
            <div className="canvas-art__toolbar" />
            <div className="canvas-art__stage">
              <div className="canvas-art__shape canvas-art__shape--circle" />
              <div className="canvas-art__shape canvas-art__shape--square" />
              <div className="canvas-art__shape canvas-art__shape--line" />
            </div>
            <div className="canvas-art__panel" />
          </div>
        </div>
      </div>
    </div>
  );
}