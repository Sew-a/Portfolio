export const FEDERATION_NAME = "main_app";
export const REMOTE_NAME = "demos";
export const REMOTE_ENTRY =
  import.meta.env.VITE_REMOTE_DEMOS_URL ??
  "http://localhost:3001/remoteEntry.js";
export const REMOTE_MODULE = "demos/DemosApp";

export const FEDERATION_OPTIONS = {
  name: FEDERATION_NAME,
  remotes: [
    {
      name: REMOTE_NAME,
      type: "module" as const,
      entry: REMOTE_ENTRY,
    },
  ],
};

export const CANVAS_TECHNOLOGIES = [
  "React",
  "TypeScript",
  "Vite",
  "Module Federation",
  "Konva.js",
];

export const CANVAS_MINIAPP = {
  barTitle: "// Canvas Miniapp",
  loading: "Loading miniapp...",
  errorTitle: "Failed to load miniapp",
};

export const DEMOS_INTRO = {
  label: "// Demo projects",
  title: "Canvas Miniapp",
  leadOne:
    "Draw shapes and text on an infinite canvas rendered with Konva.js — shipped as a separate micro frontend and pulled in at runtime via Webpack Module Federation, so it builds, deploys, and scales independently from the host app.",
  leadTwo: "It's still development in progress, but you can try it out.",
  techLabel: "Technologies",
  openLabel: "Open Canvas Miniapp",
};

export const CHAT_TECHNOLOGIES = [
  "React",
  "TypeScript",
  "NestJS",
  "Socket.io",
  "PostgreSQL",
  "Prisma",
];

export const CHAT_DEMO = {
  label: "// Full-stack demo",
  title: "Group Chat",
  leadOne:
    "Real-time group chat with a React client and a NestJS backend. Sign up, create a group to get an invite code or join one, and messages reach everyone in the room instantly over Socket.io.",
  leadTwo: "Sign in and start a conversation. Share the invite code to bring someone in.",
  techLabel: "Technologies",
  openLabel: "Open Chat",
  barTitle: "chat.app",
  image:
    "https://res.cloudinary.com/dlggumsot/image/upload/v1791109631/Screenshot_2026-10-04_141901_kuedn4.webp",
  imageAlt: "Group chat room with messages and an invite code",
};

export const GAME_TECHNOLOGIES = [
  "TypeScript",
  "Canvas 2D",
  "Web Audio API",
  "Blender",
  "Claude",
];

export const GAME_DEMO = {
  label: "// Game demo",
  title: "The Trip",
  leadOne:
    "A top-down neon action game I built on my own: a house party that turns into a trip through shadow corridors, a three-phase boss and a maze generated every run, ending quietly back home. Custom TypeScript engine on Canvas 2D, low-poly characters made in Blender, and a soundtrack synthesized live in the browser. Built with Claude as an AI pair programmer.",
  leadTwo:
    "This is a demo version. The full indie game is in development in Unity and C#. Needs a keyboard and mouse; contains mature themes.",
  techLabel: "Technologies",
  openLabel: "Play The Trip",
  barTitle: "the-trip.game",
  image:
    "https://res.cloudinary.com/dlggumsot/image/upload/v1794400870/Screenshot_2026-11-11_163622_sm9ste.webp",
  imageAlt: "The Trip: neon top-down view of the house party with the player and the crew",
};

export const DEMOS_SEO = {
  title: "Demos — Sevak Avetisyan, Senior Frontend Engineer",
  description: "Live demos: a Konva whiteboard micro-frontend loaded at runtime via Module Federation, a real-time group chat, and The Trip, a browser action game.",
};