import type { ComponentType } from "react";
import { FadeIn } from "../UI";
import { APPROACH_DATA } from "./constants";

type ApproachItem = (typeof APPROACH_DATA)[number];

type ApproachCardProps = {
  item: ApproachItem;
  delay?: number;
};

export default function ApproachCard({ item, delay = 0 }: ApproachCardProps) {
  return (
    <FadeIn delay={delay}>
      <article className={`approach-card approach-card--${item.id}`}>
        <h3 className="approach-card__title">{item.title}</h3>
        <div className="approach-card__block">
          <span className="approach-card__label">Problem</span>
          <p className="approach-card__text">{item.problem}</p>
        </div>

        <div className="approach-card__block approach-card__block--solution">
          <span className="approach-card__label approach-card__label--solution">
            Solution
          </span>
          <p className="approach-card__text">{item.solution}</p>
        </div>

        <ul className="approach-card__tags">
          {item.tags.map((tag) => (
            <li key={tag} className="approach-card__tag">
              {tag}
            </li>
          ))}
        </ul>
      </article>
    </FadeIn>
  );
}
