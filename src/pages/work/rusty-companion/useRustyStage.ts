import { useCallback, useEffect, useRef, useState } from "react";
import type { RustyClipRequest } from "@/src/components/Rusty";
import type { RustyMood } from "@/src/lib/rusty/types";
import { STAGE_ACTIONS, STAGE_IDLE_LINE } from "./constants";

/** State of the big interactive Rusty: which action he is acting out and what he says. */
export function useRustyStage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [clip, setClip] = useState<RustyClipRequest | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clipId = useRef(0);

  const action = STAGE_ACTIONS.find((a) => a.id === activeId);

  const play = useCallback((id: string) => {
    const next = STAGE_ACTIONS.find((a) => a.id === id);
    if (!next) return;
    if (timer.current) clearTimeout(timer.current);
    setActiveId(id);
    if (next.clip) {
      clipId.current += 1;
      setClip({ name: next.clip, id: clipId.current });
    } else {
      setClip(null);
    }
    timer.current = setTimeout(() => setActiveId(null), next.seconds * 1000);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const mood: RustyMood = action?.mood ?? "idle";

  return {
    activeId,
    mood,
    clip,
    facing: action?.facing ?? 0,
    line: action?.line ?? STAGE_IDLE_LINE,
    play,
  };
}

export type RustyStageState = ReturnType<typeof useRustyStage>;
