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

export const DEMOS_SEO = {
  title: "Demos — Sevak Avetisyan",
  description: "Live demos: a Konva whiteboard micro-frontend loaded at runtime via Module Federation, and a real-time group chat.",
};