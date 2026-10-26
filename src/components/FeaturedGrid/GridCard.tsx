import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Code2 } from "lucide-react";
import Image from "@/src/components/Image";
import LiveLink from "@/src/components/ProjectCard/LiveLink";
import { liveLabel } from "@/src/components/ProjectCard/liveLabel";
import type { FeaturedItem } from "@/src/data/portfolioData";
import "./styles.scss";

const reveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const },
};

export default function GridCard({ item }: { item: FeaturedItem }) {
  const { links } = item;

  const preview = (
    <div className="window">
      <div className="window__bar">
        <span className="window__dot window__dot--red" />
        <span className="window__dot window__dot--yellow" />
        <span className="window__dot window__dot--green" />
        <span className="window__title">
          <Code2 size={12} /> {links ? liveLabel(links.live) : "Picsart · internal"}
        </span>
      </div>
      <div className="window__body">
        <Image
          src={item.image}
          alt={item.title}
          width={720}
          height={450}
          className="window__shot"
        />
        <div className="window__glow" />
      </div>
    </div>
  );

  const style = { "--project-accent": item.accent } as React.CSSProperties;

  return (
    <motion.div
      className={`grid-card ${item.href ? "" : "grid-card--soon"}`}
      style={style}
      {...reveal}
    >
      {item.href ? (
        <Link to={item.href} className="grid-card-link" tabIndex={-1} aria-hidden="true">
          {preview}
        </Link>
      ) : (
        preview
      )}
      <div className="grid-card__caption">
        <h4>
          {item.href ? (
            <Link to={item.href} className="grid-card-link">
              {item.title}
            </Link>
          ) : (
            item.title
          )}
        </h4>
        <p>{item.result}</p>
        <ul className="grid-card__tags">
          {item.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        {links && (
          <div className="grid-card__links">
            {links.live && (
              <LiveLink href={links.live} className="grid-card__link">
                Live demo <ArrowUpRight size={14} />
              </LiveLink>
            )}
            {links.repo && (
              <a href={links.repo} target="_blank" rel="noreferrer" className="grid-card__link">
                GitHub <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
