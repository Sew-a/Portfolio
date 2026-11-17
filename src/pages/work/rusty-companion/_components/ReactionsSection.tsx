import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { HeadingText } from "@/src/components/UI";
import { REACTIONS, REACTIONS_HEADING, REACTIONS_PLAY } from "@/src/pages/work/rusty-companion/constants";
import type { RustyStageState } from "@/src/pages/work/rusty-companion/useRustyStage";

interface ReactionsSectionProps {
  stage: RustyStageState;
}

/** Claude Code events and Rusty's reactions; each row can be acted out on the stage above. */
export default function ReactionsSection({ stage }: ReactionsSectionProps) {
  const show = (action: string) => {
    stage.play(action);
    document.getElementById("rusty-stage")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className="rusty-reactions">
      <HeadingText title={REACTIONS_HEADING.title} label={REACTIONS_HEADING.label} />
      <ol className="rusty-reactions__list">
        {REACTIONS.map((r, index) => (
          <motion.li
            key={r.event}
            className={`rusty-reactions__row ${stage.activeId === r.action ? "rusty-reactions__row--active" : ""}`}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: (index % 5) * 0.05 }}
          >
            <code className="rusty-reactions__event">{r.event}</code>
            <span className="rusty-reactions__when">{r.when}</span>
            <span className="rusty-reactions__arrow" aria-hidden="true">→</span>
            <span className="rusty-reactions__does">{r.does}</span>
            <button type="button" className="rusty-reactions__play" onClick={() => show(r.action)}>
              <Play size={14} /> {REACTIONS_PLAY}
            </button>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
