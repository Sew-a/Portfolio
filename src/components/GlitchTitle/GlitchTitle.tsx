import { useEffect, useRef, useState } from "react";
import "./styles.scss";

type GlitchTitleProps = {
  /** Each title is a list of lines; the component cycles through them. */
  titles: string[][];
  /** How long a title stays readable before it glitches out. */
  holdMs?: number;
  className?: string;
};

type Phase = "idle" | "out" | "in";

const TICK_MS = 55;
const MAX_CHUNK = 3;

const randomInt = (max: number) => Math.floor(Math.random() * max);
const countChars = (lines: string[]) =>
  lines.reduce((sum, line) => sum + Array.from(line).length, 0);
const allSlots = (total: number) => new Set(Array.from({ length: total }, (_, i) => i));

/**
 * Cycles through titles. A title leaves in random chunks (one part drops out,
 * then another), the next one is assembled the same way, then it holds.
 */
export default function GlitchTitle({ titles, holdMs = 3600, className = "" }: GlitchTitleProps) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  // Slots (char positions across all lines) currently switched off.
  const [hidden, setHidden] = useState<Set<number>>(() => new Set());
  const hiddenRef = useRef(hidden);
  hiddenRef.current = hidden;

  const lines = titles[index];
  const total = countChars(lines);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || titles.length < 2) return;

    if (phase === "idle") {
      const timer = window.setTimeout(() => setPhase("out"), holdMs);
      return () => window.clearTimeout(timer);
    }

    if (phase === "out") {
      const timer = window.setInterval(() => {
        const next = new Set(hiddenRef.current);
        const start = randomInt(total);
        const size = 1 + randomInt(MAX_CHUNK);
        for (let i = start; i < Math.min(total, start + size); i++) next.add(i);
        if (next.size === hiddenRef.current.size) {
          // Random pick overlapped what is already hidden: still make progress.
          for (let i = 0; i < total; i++) {
            if (!next.has(i)) {
              next.add(i);
              break;
            }
          }
        }
        if (next.size >= total) {
          window.clearInterval(timer);
          const nextIndex = (index + 1) % titles.length;
          setIndex(nextIndex);
          setHidden(allSlots(countChars(titles[nextIndex])));
          setPhase("in");
          return;
        }
        setHidden(next);
      }, TICK_MS);
      return () => window.clearInterval(timer);
    }

    // phase === "in": the new title starts fully hidden, reveal it chunk by chunk.
    const timer = window.setInterval(() => {
      const next = new Set(hiddenRef.current);
      const pending = Array.from(next);
      if (pending.length === 0) {
        window.clearInterval(timer);
        setPhase("idle");
        return;
      }
      const start = pending[randomInt(pending.length)];
      const size = 1 + randomInt(MAX_CHUNK);
      for (let i = start; i < start + size; i++) next.delete(i);
      setHidden(next);
      if (next.size === 0) {
        window.clearInterval(timer);
        setPhase("idle");
      }
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [phase, holdMs, index, titles, total]);

  let slot = 0;
  return (
    <h1
      className={`glitch-title ${phase !== "idle" ? "glitch-title--active" : ""} ${className}`}
      aria-label={lines.join(" ")}
    >
      {lines.map((line, lineIndex) => (
        <span className="glitch-title__line" key={`${index}-${lineIndex}`} aria-hidden="true">
          {Array.from(line).map((char, charIndex) => {
            const id = slot++;
            return (
              <span
                key={charIndex}
                className={`glitch-title__char ${hidden.has(id) ? "glitch-title__char--off" : ""}`}
                style={{ "--glitch-dx": (id * 7) % 5 } as React.CSSProperties}
              >
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}
