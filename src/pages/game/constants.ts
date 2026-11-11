export const GAME_SEO = {
  title: "The Trip — Sevak Avetisyan",
  description:
    "A top-down neon action game built from scratch in TypeScript and Canvas 2D: a house party that turns into a trip: corridors of shadows, a boss fight, a maze with no way out, and a quiet ending at home. Low-poly sprites rendered in Blender.",
};

export const GAME_COPY = {
  title: "THE TRIP",
  noticeTag: "Content notice",
  notice: "Based on true events. Contains drug use, violence, and suicide (implied, not shown). Intended for fans of surreal narrative games.",
  start: "Start simulation",
  continue: (act: number) => `Continue from act ${act}`,
  mobile: "This game needs a keyboard and mouse. Open it on a desktop to play.",
  paused: "Paused",
  resume: "Resume",
  restartAct: "Restart checkpoint",
  quit: "Quit to menu",
  gameOverTitle: "BAD TRIP",
  retry: "Try again (R)",
  completeTitle: "THE END",
  completeText: "The trip is over.",
  help: "If any of this feels close to home, you don't have to carry it alone.",
  helpLink: { label: "Find a helpline near you", href: "https://findahelpline.com" },
  replay: "Replay simulation",
  continueResult: "Continue",
  satisfaction: "Friends satisfaction",
  health: "Mind integrity",
  boss: "Giant Chaynik",
  tasks: "Tasks",
  dialogueHint: "Click or press 1–3",
};

export const CONTROLS: { keys: string; action: string }[] = [
  { keys: "WASD / arrows", action: "Move" },
  { keys: "Mouse", action: "Aim" },
  { keys: "E", action: "Interact / talk (hold to pee)" },
  { keys: "Left click", action: "Stab with the knife" },
  { keys: "Space", action: "Dash" },
  { keys: "Esc", action: "Pause" },
];
