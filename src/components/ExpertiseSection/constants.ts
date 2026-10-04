import { Layers, Gamepad2, Bot } from 'lucide-react';
import type { ExpertiseItem } from './types';

export const EXPERTISE_HEADING = {
  title: "My Expertise",
  label: "// SERVICES",
};

export const EXPERTISE_DATA: ExpertiseItem[] = [
  {
    icon: Layers,
    variant: "fullstack",
    title: "Full-stack Dev",
    desc: "Frontend architecture, micro-frontends (Module Federation), reusable component libraries, performance, and testing on a platform serving 150M+ users, plus full-stack features end-to-end: React clients on NestJS, WebSocket, and PostgreSQL backends.",
    emphasis: [
      "Set up 3 production micro-frontends from scratch for a platform serving 150M+ users",
      "Built the Google Picker micro-frontend (Drive import, OAuth, analytics) reused across 4 teams",
      "Built a ~15-component library (incl. a File System) saving 20 hours per sprint",
      "Built a real-time group chat: React client + NestJS / Socket.io backend with JWT auth, PostgreSQL and Prisma"
    ],
    skills: ["React", "TypeScript", "Next.js", "NestJS", "Socket.io", "PostgreSQL", "Prisma", "GraphQL", "Redux", "Webpack", "Jest", "Storybook"]
  },
  {
    icon: Gamepad2,
    variant: "gamedev",
    title: "Game Dev",
    desc: "Practical experience in 2D game development using Unity and C#. Skilled in working with pixel art, creating smooth sprite animations, and implementing realistic game physics systems and mechanics.",
    emphasis: [
      "Developed a 2D platformer in Unity with custom physics and pixel art",
      "Currently working on a 3D first-person storytelling game"
    ],
    skills: ["C#", "Unity", "Blender"]
  },
  {
    icon: Bot,
    variant: "ai",
    title: "AI & Agentic AI",
    desc: "Built a comprehensive educational platform covering prompt engineering, AI agents, and practical LLM workflows. Experienced in designing agent architectures, prompt patterns, and self-hosted open-source AI tooling.",
    emphasis: [
      "Architected an AI Agents educational hub with prompt engineering, and agent workflow guides",
              "Implemented 9 prompt techniques from zero-shot to Reflexion with copyable examples",
      "Showcased 5 open-source AI tools including n8n, Ollama, and Whisper for self-hosted AI infrastructure"
    ],
    skills: ["Prompt Engineering", "AI Agents", "LLM Workflows", "Open Source AI"]
  }
];