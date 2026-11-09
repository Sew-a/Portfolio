import { HeadingText } from "@/src/components/UI";
import ApproachCard from "./ApproachCard";
import { APPROACH_DATA } from "./constants";
import "./styles.scss";

export default function ApproachSection() {
  return (
    <section className="approach" id="approach">
      <HeadingText title="How I Approach Code" label="// APPROACH" />
      <div className="approach__grid">
        {APPROACH_DATA.map((item, index) => (
          <ApproachCard key={item.id} item={item} delay={index * 0.1} />
        ))}
      </div>
    </section>
  );
}