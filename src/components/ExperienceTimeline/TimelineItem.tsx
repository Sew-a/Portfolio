import { Briefcase } from "lucide-react";
import type { TimelineEntry } from "./types";

type TimelineItemProps = {
  entry: TimelineEntry;
  side: "left" | "right";
};

export default function TimelineItem({ entry, side }: TimelineItemProps) {
  return (
    <li className={`timeline-item timeline-item--${side}`}>
      <span className="timeline-item__marker" aria-hidden="true">
        <Briefcase size={14} strokeWidth={2} />
      </span>

      <div className="timeline-item__content">
        <span className="timeline-item__period">{entry.period}</span>
        <h3 className="timeline-item__title">{entry.title}</h3>
        <p className="timeline-item__company">
          {entry.company} <span aria-hidden="true">·</span> {entry.location}
        </p>
        {entry.companySummary && (
          <p className="timeline-item__summary">{entry.companySummary}</p>
        )}
        <ul className="timeline-item__achievements">
          {entry.achievements.map((achievement) => (
            <li key={achievement}>{achievement}</li>
          ))}
        </ul>
      </div>
    </li>
  );
}
