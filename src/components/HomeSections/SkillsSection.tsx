import { HeadingText, FadeIn } from "@/src/components/UI";
import { TECH_ICONS } from "./constants";

export function SkillsSection() {
  return (
    <FadeIn delay={0.2}>
      <section className="skills">
        <HeadingText title="Technologies I work with" label="// SKILLS" />
        <ul className="skills__list">
          {TECH_ICONS.map(({ name, Icon }) => (
            <li key={name} className="tech-item">
              <span className="tech-item__icon" aria-hidden="true">
                <Icon size={20} />
              </span>
              <span>{name}</span>
            </li>
          ))}
        </ul>
      </section>
    </FadeIn>
  );
}