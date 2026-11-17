import type { RustyClip, RustyMood } from "@/src/lib/rusty/types";

/** Body yaw while walking (radians); keeps his face visible. Same as the desktop app. */
export const WALK_FACING = 0.55;

/** Left click: one of Rusty's Blender clips, with a matching face. */
export const CLICK_REACTIONS: { clip: RustyClip; mood: RustyMood }[] = [
  { clip: "Wave", mood: "greet" },
  { clip: "Hop", mood: "happy" },
  { clip: "Cheer", mood: "happy" },
];

/** Little things he does when left alone (seconds each). */
export const IDLE_MOMENTS: { mood: RustyMood; seconds: number }[] = [
  { mood: "sipping", seconds: 5 },
  { mood: "tired", seconds: 3.2 },
  { mood: "thinking", seconds: 4 },
  { mood: "browsing", seconds: 3 },
];

/** Seconds of standing still before an idle moment. */
export const IDLE_MOMENT_DELAY = { min: 12, max: 22 };
