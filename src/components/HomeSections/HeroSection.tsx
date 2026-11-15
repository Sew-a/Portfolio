import { motion } from "framer-motion";
import { HERO_DATA } from "@/src/data/portfolioData";
import { ActionButton, FadeIn } from "@/src/components/UI";
import { ACTION_BUTTON_TYPE } from "@/src/components/types";
import { paths } from "@/src/routes/mainRoutes";
import GlitchTitle from "@/src/components/GlitchTitle";
import ProjectSlider from "@/src/components/ProjectSlider";
import { HERO_ANIMATIONS } from "./constants";

export function HeroSection() {
  return (
    <FadeIn>
      <section className="hero">
        <div className="hero__grid-dots" aria-hidden="true" />
        <div className="hero__content">
          <motion.div className="hero__text" {...HERO_ANIMATIONS.text}>
            <GlitchTitle titles={HERO_DATA.titles} />
            <motion.div className="hero__cta" {...HERO_ANIMATIONS.cta}>
              <ActionButton
                title="My Experience"
                link="#experience"
                buttonType={ACTION_BUTTON_TYPE.PRIMARY}
              />
              <ActionButton
                title="Demos"
                link={paths.demos}
                buttonType={ACTION_BUTTON_TYPE.GHOST}
              />
            </motion.div>
          </motion.div>
          <motion.div className="hero__slider" {...HERO_ANIMATIONS.slider}>
            <ProjectSlider />
          </motion.div>
        </div>
      </section>
    </FadeIn>
  );
}
