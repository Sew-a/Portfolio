import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Image from "@/src/components/Image";
import { paths } from "@/src/routes/mainRoutes";
import { GAME_DEMO, GAME_TECHNOLOGIES } from "@/src/pages/demos/constants";

export default function GameDemo() {
  return (
    <div className="demos-page__banner-wrap">
      <motion.div
        className="demos-page__banner-copy"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <span className="demos-page__label">{GAME_DEMO.label}</span>
        <h1 className="demos-page__title">{GAME_DEMO.title}</h1>
        <p className="demos-page__lead">
          {GAME_DEMO.leadOne}
          <br />
          <br />
          {GAME_DEMO.leadTwo}
        </p>

        <div className="demos-page__tech">
          <span className="demos-page__tech-label">{GAME_DEMO.techLabel}</span>
          <div className="demos-page__tech-tags">
            {GAME_TECHNOLOGIES.map((tech) => (
              <span key={tech} className="demos-page__tech-tag">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <Link to={paths.game} className="demos-page__open demos-page__open--link">
          {GAME_DEMO.openLabel}
        </Link>
      </motion.div>

      <div className="demos-page__canvas-art">
        <div className="canvas-art__window">
          <div className="canvas-art__bar">
            <span className="canvas-art__title">{GAME_DEMO.barTitle}</span>
          </div>
          <Image
            src={GAME_DEMO.image}
            alt={GAME_DEMO.imageAlt}
            width={840}
            className="demos-page__shot"
          />
        </div>
      </div>
    </div>
  );
}
