import { HeadingText } from "@/src/components/UI";
import ExpertiseCard from "./ExpertiseCard";
import { EXPERTISE_DATA, EXPERTISE_HEADING } from "./constants";
import "./styles.scss";

const ExpertiseSection = () => {
  return (
    <div className="grid-wrapper">
      <div className="expertise-section">
        <HeadingText title={EXPERTISE_HEADING.title} label={EXPERTISE_HEADING.label} />
        <div className="expertise-grid">
          {EXPERTISE_DATA.map((expertise) => (
            <ExpertiseCard key={expertise.variant} expertise={expertise} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpertiseSection;