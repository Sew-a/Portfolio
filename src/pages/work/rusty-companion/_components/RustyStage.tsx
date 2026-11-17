import { AnimatePresence, motion } from "framer-motion";
import Rusty from "@/src/components/Rusty";
import { RUSTY_HERO_COPY, STAGE_ACTIONS } from "@/src/pages/work/rusty-companion/constants";
import type { RustyStageState } from "@/src/pages/work/rusty-companion/useRustyStage";

interface RustyStageProps {
  stage: RustyStageState;
}

/** A desktop-window frame with the live 3D Rusty, his speech bubble and buttons that make him act. */
export default function RustyStage({ stage }: RustyStageProps) {
  return (
    <div className="rusty-stage" id="rusty-stage">
      <div className="rusty-stage__window">
        <div className="rusty-stage__titlebar">
          <span className="rusty-stage__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="rusty-stage__title">{RUSTY_HERO_COPY.stageTitle}</span>
          <span className="rusty-stage__live">LIVE</span>
        </div>

        <div className="rusty-stage__scene">
          <AnimatePresence mode="wait">
            <motion.p
              key={stage.line}
              className="rusty-stage__bubble"
              role="status"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              {stage.line}
            </motion.p>
          </AnimatePresence>
          <Rusty
            className="rusty-stage__canvas"
            mood={stage.mood}
            clip={stage.clip}
            facing={stage.facing}
            viewHeight={2.4}
          />
          <div className="rusty-stage__taskbar" aria-hidden="true" />
        </div>
      </div>

      <p className="rusty-stage__hint">{RUSTY_HERO_COPY.stageHint}</p>
      <div className="rusty-stage__controls">
        {STAGE_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            className={`rusty-stage__control ${stage.activeId === action.id ? "rusty-stage__control--active" : ""}`}
            aria-pressed={stage.activeId === action.id}
            onClick={() => stage.play(action.id)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
