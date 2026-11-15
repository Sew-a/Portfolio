import { HERO_DATA } from "@/src/data/portfolioData";
import { FadeIn } from "@/src/components/UI";

export function IntroSection() {
  return (
    <section className="intro">
      <FadeIn>
        <p className="intro__text">{HERO_DATA.summary}</p>
      </FadeIn>
    </section>
  );
}
