import { motion } from "framer-motion";
import { HERO_DATA } from "@/src/data/portfolioData";
import { ActionButton, FadeIn } from "@/src/components/UI";
import { ACTION_BUTTON_TYPE } from "@/src/components/types";
import { paths } from "@/src/routes/mainRoutes";
import Parallax from "@/src/components/Parallax";
import { HERO_ANIMATIONS } from "./constants";

export function HeroSection() {
  return (
    <FadeIn>
      <section className="hero">
        <div className="hero__grid-dots" aria-hidden="true" />
        <Parallax speed={-34} className="hero__parallax">
          <div className="hero__content hero__content--centered">
            <motion.h1 className="hero__heading" {...HERO_ANIMATIONS.heading}>
              {HERO_DATA.name}
              <br />
              {HERO_DATA.title}{" "}
              <span className="hero__accent">{HERO_DATA.accent}</span>
            </motion.h1>
            <motion.p className="hero__sub" {...HERO_ANIMATIONS.sub}>
              {HERO_DATA.summary}
            </motion.p>
            <motion.div className="hero__cta" {...HERO_ANIMATIONS.cta}>
              <ActionButton
                title="My Experience"
                link="#experience"
                buttonType={ACTION_BUTTON_TYPE.PRIMARY}
              />
              <ActionButton
                title="My work"
                link={paths.work}
                buttonType={ACTION_BUTTON_TYPE.GHOST}
              />
              <ActionButton
                title="Demos"
                link={paths.demos}
                buttonType={ACTION_BUTTON_TYPE.GHOST}
              />
            </motion.div>
          </div>
        </Parallax>
      </section>
    </FadeIn>
  );
}