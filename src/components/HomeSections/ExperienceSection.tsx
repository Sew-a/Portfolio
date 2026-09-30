import { FadeIn } from "@/src/components/UI";
import ExperienceTimeline from "@/src/components/ExperienceTimeline";

export function ExperienceSection() {
  return (
    <section className="experience" id="experience">
      <FadeIn delay={0.1}>
        <div className="experience__header">
          <h2 className="experience__title">WORK EXPERIENCE</h2>
          <span className="experience__ornament" aria-hidden="true" />
          <p className="experience__subtitle">
            5+ years · React · TypeScript · Micro-frontends
          </p>
        </div>
        <ExperienceTimeline />
      </FadeIn>
    </section>
  );
}
