import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Image from "@/src/components/Image";
import { paths } from "@/src/routes/mainRoutes";
import { CHAT_DEMO, CHAT_TECHNOLOGIES } from "../../constants";

export default function ChatDemo() {
  return (
    <div className="demos-page__banner-wrap">
      <motion.div
        className="demos-page__banner-copy"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <span className="demos-page__label">{CHAT_DEMO.label}</span>
        <h2 className="demos-page__title">{CHAT_DEMO.title}</h2>
        <p className="demos-page__lead">
          {CHAT_DEMO.leadOne}
          <br />
          <br />
          {CHAT_DEMO.leadTwo}
        </p>

        <div className="demos-page__tech">
          <span className="demos-page__tech-label">{CHAT_DEMO.techLabel}</span>
          <div className="demos-page__tech-tags">
            {CHAT_TECHNOLOGIES.map((tech) => (
              <span key={tech} className="demos-page__tech-tag">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <Link to={paths.chat} className="demos-page__open demos-page__open--link">
          {CHAT_DEMO.openLabel}
        </Link>
      </motion.div>

      <div className="demos-page__canvas-art">
        <div className="canvas-art__window">
          <div className="canvas-art__bar">
            <span className="canvas-art__title">{CHAT_DEMO.barTitle}</span>
          </div>
          <Image
            src={CHAT_DEMO.image}
            alt={CHAT_DEMO.imageAlt}
            width={840}
            className="demos-page__shot"
          />
        </div>
      </div>
    </div>
  );
}
