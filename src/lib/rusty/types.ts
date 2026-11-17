/** Rusty's moods, ported from the rusty-companion desktop app (src/renderer/stateMachine.ts). */
export type RustyMood =
  | "idle"
  | "greet"
  | "thinking"
  | "working"
  | "browsing"
  | "permission"
  | "talking"
  | "happy"
  | "error"
  | "sleep"
  | "researching"
  | "walking"
  | "running"
  | "tired"
  | "resting"
  | "dancing"
  | "nudge"
  | "sipping";

/** Clip frame ranges on the Blender timeline (24 fps). Must match CLIPS in rusty-companion's build_robot.py. */
export const RUSTY_CLIPS = { Hop: [1, 17], Wave: [24, 48], Cheer: [56, 76] } as const;
export type RustyClip = keyof typeof RUSTY_CLIPS;
