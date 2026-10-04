import {
  HeroSection,
  FeaturedWorkSection,
  ExperienceSection,
  SkillsSection,
} from "@/src/components/HomeSections";
import ApproachSection from "@/src/components/ApproachSection";
import Seo from "@/src/components/Seo";
import "../../styles.scss";

export default function Homepage() {
  return (
    <main className="portfolio-home">
      <Seo
        title="Sevak Avetisyan — Frontend Engineer"
        description="Frontend Engineer with 5+ years building web apps at scale at Picsart (150M+ users). React, TypeScript, micro-frontends, plus full-stack NestJS and PostgreSQL."
      />
      <HeroSection />
      <FeaturedWorkSection />
      <ExperienceSection />
      <ApproachSection />
      <SkillsSection />
    </main>
  );
}
