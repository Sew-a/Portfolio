import TimelineItem from "./TimelineItem";
import { TIMELINE_ENTRIES } from "./constants";
import "./styles.scss";

export default function ExperienceTimeline() {
  return (
    <ol className="experience-timeline">
      {TIMELINE_ENTRIES.map((entry, index) => (
        <TimelineItem
          key={`${entry.company}-${entry.title}`}
          entry={entry}
          side={index % 2 === 0 ? "right" : "left"}
        />
      ))}
    </ol>
  );
}
