import { useState, useEffect, useCallback, useRef } from "react";
import type { RustyClipRequest } from "@/src/components/Rusty";
import { DANCE_SECONDS } from "@/src/lib/rusty/robot";
import type { RustyMood } from "@/src/lib/rusty/types";
import { CLICK_REACTIONS, IDLE_MOMENTS, IDLE_MOMENT_DELAY, WALK_FACING } from "./constants";

/** Drives the corner Rusty: walks on scroll / A-D, reacts to clicks, slumps on Esc, idles with little moments. */
export function useCharacterLogic() {
  const [isReady, setIsReady] = useState(false);
  const [walkDir, setWalkDir] = useState(0);
  const [mood, setMood] = useState<RustyMood>("idle");
  const [clip, setClip] = useState<RustyClipRequest | null>(null);

  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moodTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keysPressed = useRef<Map<string, number>>(new Map());
  const lastScrollY = useRef(0);
  const clipId = useRef(0);

  const handleLoaded = useCallback(() => {
    setTimeout(() => setIsReady(true), 600);
  }, []);

  /** Show a mood, optionally falling back to idle after `seconds`. */
  const showMood = useCallback((next: RustyMood, seconds?: number) => {
    if (moodTimeout.current) clearTimeout(moodTimeout.current);
    setMood(next);
    if (seconds) moodTimeout.current = setTimeout(() => setMood("idle"), seconds * 1000);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (y !== lastScrollY.current) setWalkDir(y > lastScrollY.current ? 1 : -1);
      lastScrollY.current = y;
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        if (keysPressed.current.size === 0) setWalkDir(0);
      }, 250);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e?.key?.toLowerCase();
      if (key === "escape") {
        showMood("error");
        return;
      }
      if (["a", "arrowleft"].includes(key)) keysPressed.current.set(key, -1);
      else if (["d", "arrowright"].includes(key)) keysPressed.current.set(key, 1);
      else return;
      setWalkDir(keysPressed.current.get(key) ?? 0);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e?.key?.toLowerCase();
      if (!keysPressed.current.delete(key)) return;
      const remaining = [...keysPressed.current.values()];
      setWalkDir(remaining.length ? remaining[remaining.length - 1] : 0);
    };

    const handleClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const reaction = CLICK_REACTIONS[Math.floor(Math.random() * CLICK_REACTIONS.length)];
      showMood(reaction.mood);
      clipId.current += 1;
      setClip({ name: reaction.clip, id: clipId.current });
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setClip(null);
      showMood("dancing", DANCE_SECONDS);
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("click", handleClick);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("contextmenu", handleContextMenu);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      if (moodTimeout.current) clearTimeout(moodTimeout.current);
    };
  }, [showMood]);

  // While idle and standing still, now and then yawn, sip coffee or have a think.
  useEffect(() => {
    if (mood !== "idle" || walkDir !== 0) return;
    const delay = IDLE_MOMENT_DELAY.min + Math.random() * (IDLE_MOMENT_DELAY.max - IDLE_MOMENT_DELAY.min);
    const timer = setTimeout(() => {
      const moment = IDLE_MOMENTS[Math.floor(Math.random() * IDLE_MOMENTS.length)];
      showMood(moment.mood, moment.seconds);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [mood, walkDir, showMood]);

  /** After a click clip, settle the face back to idle. */
  const handleClipEnd = useCallback(() => {
    setClip(null);
    showMood("idle");
  }, [showMood]);

  const walking = walkDir !== 0 && mood !== "error";

  return {
    isReady,
    mood: walking ? ("walking" as const) : mood,
    clip,
    facing: walking ? walkDir * WALK_FACING : 0,
    handleLoaded,
    handleClipEnd,
  };
}
