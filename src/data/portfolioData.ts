export const HERO_DATA = {
  name: "I'm Sevak",
  accent: "Frontend Engineer",
 summary:
    "5+ years of building web applications at scale, most recently at Picsart, an AI-powered creative platform serving 150M+ users. Focused on frontend architecture, micro-frontends (Module Federation), reusable component libraries, performance, and testing.",
  email: "sevavetisyan97@gmail.com",
  phone: "+374 41 080497",
  linkedin: "https://www.linkedin.com/in/sevak-avetisyan-arm/",
};

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  description: string;
  role: string;
  year: string;
  status: string;
  image: string;
  imageAlt: string;
  accent: string;
  icon: string;
  links: { live?: string; repo: string };
  techStack: string[];
  highlights: string[];
  architecture: { title: string; desc: string }[];
  features: { title: string; desc: string }[];
  screenshots?: { src: string; title: string }[];
};

export const PROJECTS: Project[] = [
  {
    slug: "micro-canvas",
    title: "Micro Canvas",
    tagline: "Miro-like whiteboard shipped as a Module Federation remote",
    summary:
      "An infinite-canvas whiteboard built with React, Konva, and Zustand, deployed on its own and loaded into this portfolio at runtime through Module Federation. Draw, add shapes, text and sticky notes, zoom and pan, then export the board to PNG or JSON.",
    description:
      "Micro Canvas is a standalone Vite app that exposes a single ./DemosApp entry through @module-federation/vite. This portfolio acts as the host: it fetches remoteEntry.js at runtime and mounts the board into its own React root, so the canvas builds and deploys independently from the site. The board is rendered with Konva via react-konva, all state (elements, selection, camera) lives in one Zustand store, and every interaction (pointer, keyboard, zoom, resize, colorize, export) sits in its own single-purpose module, so components only wire handlers up.",
    role: "Creator · Frontend Engineer",
    year: "2026",
    status: "In progress",
    image:
      "https://res.cloudinary.com/dlggumsot/image/upload/v1791109632/Screenshot_2026-10-04_142652_z1ocpl.webp",
    imageAlt: "Micro Canvas whiteboard with shapes, text, a sticky note and freehand arrows",
    accent: "#00f0ff",
    icon: "PenTool",
    links: {
      live: "/demos",
      repo: "https://github.com/Sew-a/micro-canvas-app",
    },
    techStack: [
      "React",
      "TypeScript",
      "Vite",
      "Module Federation",
      "Konva",
      "react-konva",
      "Zustand",
    ],
    highlights: [
      "Ships as a Module Federation remote and loads into this portfolio at runtime",
      "Infinite dark grid with cursor-anchored zoom and Space / drag-to-pan",
      "Squares, freehand drawing, inline-edited text, and sticky notes",
      "Contextual color panel and resize handles for the selected element",
      "Export the board as a PNG image or as JSON state",
    ],
    architecture: [
      {
        title: "Runtime composition",
        desc: "The remote exposes ./DemosApp via @module-federation/vite. The host loads remoteEntry.js with @module-federation/runtime and mounts the board in its own React root, so each side builds and deploys on its own schedule.",
      },
      {
        title: "Single Zustand store",
        desc: "Elements, selection, active tool, and camera all live in one store. The board stays decoupled from host routing and data, and is ready for persistence or sync later.",
      },
      {
        title: "Interaction modules, not inline handlers",
        desc: "Pointer, keyboard, wheel, transform, colorize, text-edit, export, and zoom logic each live in their own module under lib/interactions. CanvasStage is a thin shell that spreads handlers returned by hooks.",
      },
      {
        title: "Camera-aware rendering",
        desc: "A screen-fixed grid follows the camera, and all placement and drawing math converts screen coordinates to board coordinates, so tools behave the same at any zoom level.",
      },
    ],
    features: [
      {
        title: "Shapes & drawing",
        desc: "Click to drop a square or drag to draw a custom one; drag freehand to draw lines.",
      },
      {
        title: "Text & stickers",
        desc: "The inline editor opens on click and captures the first keystroke. Enter commits, Esc cancels, and double-click re-edits a sticker.",
      },
      {
        title: "Select, move & resize",
        desc: "Click to select, drag to move, resize squares with handles, and Del / Backspace to remove.",
      },
      {
        title: "Color panel",
        desc: "Recolors the border of squares, the stroke of drawings, the text of text nodes, and the fill of stickers.",
      },
      {
        title: "Zoom & pan",
        desc: "Wheel zoom around the cursor, pan with drag, Space or the middle button, plus − / + / Reset controls.",
      },
      {
        title: "Export",
        desc: "Download the board as a PNG image or save its state as a JSON file.",
      },
    ],
  },
  {
    slug: "chat-app",
    title: "Real-time Group Chat",
    tagline: "React client + NestJS / Socket.io backend with invite-code groups",
    summary:
      "A full-stack group chat: sign up, create a group to get an invite code or join one, then message everyone in the room in real time. The React client lives in this portfolio at /chat, and the NestJS backend runs on Railway with PostgreSQL.",
    description:
      "The backend is a NestJS app split into one module per concern (auth, user, group, chat), with Prisma on PostgreSQL, Passport JWT auth with argon2 hashing, and a Socket.io gateway on the /chat namespace. Group membership is checked on every REST call and every WebSocket event. The frontend in this portfolio validates every response with Zod, keeps auth and chat state in Zustand stores, shares one socket connection per token, rejoins rooms after reconnects, and pages through history with a cursor.",
    role: "Creator · Full-stack Engineer",
    year: "2026",
    status: "Live",
    image:
      "https://res.cloudinary.com/dlggumsot/image/upload/v1791109631/Screenshot_2026-10-04_141901_kuedn4.webp",
    imageAlt: "Group chat room with messages and a copyable invite code",
    accent: "#ff2d95",
    icon: "MessagesSquare",
    links: {
      live: "/chat",
      repo: "https://github.com/Sew-a/Chat-app",
    },
    techStack: [
      "React",
      "TypeScript",
      "NestJS",
      "Socket.io",
      "PostgreSQL",
      "Prisma",
      "Zustand",
      "Zod",
      "Passport JWT",
      "Railway Buckets",
      "Railway",
    ],
    highlights: [
      "Real-time messaging over a Socket.io gateway with JWT-authenticated handshakes",
      "Invite-code groups: create a room or join one with an 8-character code",
      "Membership enforced on every REST and WebSocket operation",
      "Cursor-based message history, 30 messages per page",
      "Zod-validated API layer and Zustand stores on the React side",
    ],
    architecture: [
      {
        title: "Modular NestJS backend",
        desc: "Auth, user, group, and chat modules with global Prisma and storage modules. A global ValidationPipe with class-validator DTOs checks every input.",
      },
      {
        title: "REST + WebSockets",
        desc: "REST handles auth, groups, history, and uploads. The /chat Socket.io namespace handles join_group and send_message, broadcasts new_message to the room, and reports rejected events through a structured exception event.",
      },
      {
        title: "Typed client contract",
        desc: "Zod schemas validate every response. A shared fetch layer attaches the Bearer token, surfaces backend messages, and signs the user out on a 401.",
      },
      {
        title: "Socket lifecycle",
        desc: "One shared socket per token. Rooms are rejoined after reconnects, and signing out disconnects the socket and clears chat state.",
      },
    ],
    features: [
      {
        title: "Auth",
        desc: "Email and password sign-up and sign-in with argon2 hashing and a 7-day JWT, plus an optional avatar URL.",
      },
      {
        title: "Groups",
        desc: "Create a group to get a unique invite code, or join with one. Your groups are listed with their codes.",
      },
      {
        title: "Live chat",
        desc: "Messages appear instantly for everyone in the room, with avatars, timestamps, and auto-scroll.",
      },
      {
        title: "History",
        desc: "Load older messages with cursor pagination, 30 messages per page.",
      },
      {
        title: "Image uploads (backend)",
        desc: "Multipart upload to a private Railway Bucket, served back through the API, with a MIME whitelist, a 10 MB cap, and server-side file extensions.",
      },
      {
        title: "Deployment",
        desc: "NestJS and Socket.io on Railway with PostgreSQL and committed Prisma migrations. The client deploys with this portfolio.",
      },
    ],
    screenshots: [
      {
        src: "https://res.cloudinary.com/dlggumsot/image/upload/v1791109632/Screenshot_2026-10-04_141830_fgergl.webp",
        title: "Group list: create a group or join with an invite code",
      },
    ],
  },
  {
    slug: "ai-agents",
    title: "AI Agents & Prompt Engineering Hub",
    tagline: "A practical LLM knowledge platform — prompts, agents & RAG made copyable",
    summary:
      "A curated educational platform teaching prompt engineering, AI agents, RAG, and reusable agent workflows — with copyable examples for ChatGPT, Claude, Gemini, and more. Served statically to thousands, built with Next.js 16 + React Compiler.",
    description:
      "A knowledge hub built around the idea of 'using LLMs like a daily thinking system, not just a chat box.' It covers 9 prompt techniques, the three pillars of AI agents, a deep RAG explainer, 24 copyable library prompts across 8 categories, free-agent tool comparisons, and reusable workflow patterns. The repo is also an experimentation lab: multi-agent skill prompt files, agent-orchestration workflows, and a browser game built by AI agents.",
    role: "Creator · Writer · Engineer",
    year: "2026",
    status: "Live",
    image:
      "https://res.cloudinary.com/dlggumsot/image/upload/v1783354442/Screenshot_2026-07-06_193842_qqp0jb.webp",
    imageAlt: "AI Agents Hub prompts page",
    accent: "#a855f7",
    icon: "Bot",
    links: {
      live: "https://ai-agents.sevavetisyan97.workers.dev",
      repo: "https://github.com/Sew-a/AI-Agents",
    },
    techStack: [
      "Next.js",
      "React",
      "TypeScript",
      "React Compiler",
      "CSS Modules",
      "Cloudflare Pages/Workers",
      "OpenNext",
    ],
    highlights: [
      "9 prompt techniques with copyable examples, from zero-shot to Reflexion",
      "AI agents deep-dive: planning, tools, memory, workflows vs agents",
      "RAG & grounding pipeline explained end-to-end (chunking → embeddings → retrieval)",
      "24-prompt library across 8 categories with one-click copy",
      "Static, server-rendered, zero runtime fetching — deployable anywhere",
    ],
    architecture: [
      {
        title: "Typed data modules instead of a CMS",
        desc: "All content lives in strongly typed TS data modules (Technique, AgentWorkflow, LibraryItem…) rendered by server components. The whole site is static and trivially deployable.",
      },
      {
        title: "Server components by default",
        desc: "Only two client components carry real interactivity — library tabs and copy-to-clipboard. Everything else is rendered on the server.",
      },
      {
        title: "Edge deployment",
        desc: "Next.js 16 App Router compiled to Cloudflare Workers via OpenNext + wrangler, with immutable static cache headers and a self-referencing service binding.",
      },
      {
        title: "Token-driven design system",
        desc: "CSS custom properties define the entire dark purple/indigo theme; monospace for prompt blocks, gradient accent headings, staggered entrance animations.",
      },
    ],
    features: [
      {
        title: "Learning guides",
        desc: "Basics, 9 techniques, agents, RAG, and a 6-step learning path — each with how-to steps and a copyable example.",
      },
      {
        title: "Prompt library",
        desc: "24 prompts in 8 categories (Design, Dev, Marketing, Education, Analytics, Reasoning, Agents, Study) with use-case notes.",
      },
      {
        title: "Agent workflows",
        desc: "Prompt contracts, planner→builder→reviewer, agent chatrooms, stochastic consensus, and self-modifying rules engines.",
      },
      {
        title: "Tool comparisons",
        desc: "9 free open-source AI coding tools compared by type, license, self-host capability, and stars, with copyable install commands.",
      },
      {
        title: "Copy-to-clipboard everywhere",
        desc: "Robust Clipboard API with a hidden-textarea execCommand fallback and instant 'Copied!' feedback on every prompt.",
      },
      {
        title: "Experimentation lab",
        desc: "Repo also contains multi-agent skill prompt files, orchestration docs (Claude planner + Codex builder + Gemini researcher), and a browser game.",
      },
    ],
  },
];

export type FeaturedItem = {
  slug: string;
  title: string;
  tagline: string;
  image: string;
  accent: string;
  href?: string;
  comingSoon?: boolean;
};

export const FEATURED_WORK: FeaturedItem[] = [
  {
    slug: "micro-canvas",
    title: "Micro Canvas",
    tagline: "Miro-like whiteboard loaded at runtime via Module Federation",
    image: PROJECTS[0].image,
    accent: "#00f0ff",
    href: "/work/micro-canvas",
  },
  {
    slug: "chat-app",
    title: "Real-time Group Chat",
    tagline: "React + NestJS / Socket.io group chat",
    image: PROJECTS[1].image,
    accent: "#ff2d95",
    href: "/work/chat-app",
  },
  {
    slug: "ai-agents",
    title: "AI Agents & Prompt Engineering Hub",
    tagline: "Prompt engineering, agents & RAG made copyable",
    image: PROJECTS[2].image,
    accent: "#a855f7",
    href: "/work/ai-agents",
  },
  {
    slug: "Google Picker micro-frontend",
    title: "Google Picker micro-frontend",
    tagline: "Google Drive file picker embedded as micro-frontend",
    image: "https://res.cloudinary.com/dlggumsot/image/upload/v1779292516/MyProject2_dvlxy8.png",
    accent: "#00f0ff",
    comingSoon: true,
  },
  {
    slug: "file-system",
    title: "File System library",
    tagline: "File system with tree view, drag & drop, and file operations",
    image: "https://res.cloudinary.com/dlggumsot/image/upload/v1779292518/MyProject3_yzfsbw.png",
    accent: "#a855f7",
    comingSoon: true,
  },
];

export const EXPERIENCE = [
  {
    company: "Picsart",
    location: "Yerevan, Armenia",
    period: "May 2021 – Apr 2026",
    companySummary:
      "AI-powered creative platform for photo, video, and design, serving 150M+ users worldwide.",
    roles: [
      {
        title: "Software Engineer II",
        period: "Mar 2025 – Apr 2026",
        achievements: [
          "Architected Frontend solutions for the photo editor, File System, component library, and Micro-frontend ecosystem serving 150M+ users.",
          "Built a component library (~15 components, including a File System) with a unified interface contract for sidebar and full-screen placements, saving 20 hours per sprint.",
          "Built the Google Picker micro-frontend from scratch (Module Federation): Google Drive import, Google OAuth, APIs and analytics, reused across 4 teams.",
          "Reduced production bugs in the core photo editor by 9.3% through Datadog-driven root-cause analysis and proper error handling.",
        ],
      },
      {
        title: "Software Engineer I",
        period: "Apr 2022 – Feb 2025",
        achievements: [
          "Set up the Commenting micro-frontend from scratch, using Cursor and Claude for API integration, reducing delivery time from 6 to 3 weeks.",
          "Set up the Storage micro-frontend from scratch and delivered features and improvements on 3+ other Module Federation apps, enabling independent integration and releases.",
          "Automated landing page data migration from local storage to CDN, optimizing content delivery architecture.",
          "Increased unit test coverage across the landing and File System projects from ~0 to 50–65% within 3–5 weeks (Jest, React Testing Library).",
        ],
      },
      {
        title: "UI Engineer",
        period: "May 2021 – Apr 2022",
        achievements: [
          "Built and optimized React/Next.js landing pages for web performance.",
          "Increased the main page Lighthouse performance score to 90.",
          "Built and contributed to 20+ landing pages, maintaining Lighthouse performance scores of 75–85.",
        ],
      },
    ],
  },
  {
    company: "JoinToHire",
    location: "Yerevan, Armenia",
    period: "Nov 2020 – May 2021",
    companySummary:
      "Freelance marketplace connecting businesses with remote digital professionals.",
    roles: [
      {
        title: "Frontend Developer",
        period: "Nov 2020 – May 2021",
        achievements: [
          "Built lightweight landing pages and e-commerce interfaces with HTML, CSS/Sass, JavaScript, jQuery, and React.",
          "Migrated legacy vanilla JavaScript functionality to React, improving maintainability and extensibility.",
          "Optimized Frontend performance, achieving Lighthouse performance scores of 80–90.",
        ],
      },
    ],
  },
];

export const SKILL_CATEGORIES = [
  { cat: "Languages & Core Web", items: ["JavaScript", "TypeScript", "HTML", "GraphQL"] },
  { cat: "Frameworks & Platforms", items: ["React", "Next.js", "Node.js"] },
  { cat: "Architecture", items: ["Micro-frontends", "Module Federation", "Design Systems",] },
  { cat: "State Management", items: ["Context", "Redux", "Zustand"] },
  { cat: "Styling & Design", items: ["CSS", "SASS", "Tailwind", "JSS", "Styled Components", "Framer Motion"] },
  { cat: "Testing & QA", items: ["Jest", "Storybook", "RTL"] },
  { cat: "DevOps & Build", items: ["Git", "Docker", "Webpack", "CI/CD", "Cloudflare"] },
  { cat: "AI-Enhanced Dev", items: ["Claude Code", "Cursor", "Claude", "Copilot", "AI Agents", "Prompt Engineering"] },
  { cat: "Game Development", items: ["Unity", "C#", "Blender", "Pixel Art"] },
];

export const RESUME = {
  name: "Sevak Avetisyan",
  title: "Frontend Engineer | React · TypeScript · Micro-Frontend Architecture",
  headline:
    "Frontend Engineer | React · TypeScript · Micro-Frontend Architecture",
  email: "sevavetisyan97@gmail.com",
  phone: "+374 41 080497",
  location: "Yerevan, Armenia",
  linkedin: "https://www.linkedin.com/in/sevak-avetisyan-arm/",
  github: "https://github.com/Sew-a",
  portfolio: "/",
  summary:
    "Frontend Engineer with 5+ years of building web applications at scale, most recently at Picsart, an AI-powered creative platform serving 150M+ users. Focused on frontend architecture, micro-frontends (Module Federation), reusable component libraries, performance, and testing. Set up 3 production micro-frontends from scratch (Google Picker, Commenting, Storage) and extended 3+ other Module Federation apps, enabling independent releases; built a ~15-component library saving 20 hours per sprint; and reduced production bugs in the core photo editor by 9.3%.",
  skillGroups: [
    {
      category: "Frontend Development",
      items: ["React", "TypeScript", "JavaScript", "Next.js", "HTML5", "CSS3/Sass", "Tailwind", "JSS", "Konva"],
    },
    {
      category: "State Management & Data",
      items: ["Redux", "Zustand", "TanStack Query", "GraphQL"],
    },
    {
      category: "Architecture",
      items: ["Micro-frontends", "Module Federation", "Frontend Architecture", "Component Architecture", "Reusable Components"],
    },
    {
      category: "Backend & Build",
      items: ["Node.js", "Express", "NestJS", "Socket.io/WebSockets", "MongoDB", "PostgreSQL/Prisma", "Webpack", "Vite", "Docker"],
    },
    {
      category: "Testing, Monitoring & Design Systems",
      items: ["Jest", "React Testing Library", "Storybook", "Datadog"],
    },
    {
      category: "AI-assisted Development",
      items: ["Claude Code", "Cursor", "Claude"],
    },
  ],
  education: {
    degree: "Bachelor's Degree in Information Technologies",
    school: "National University of Architecture and Construction of Armenia",
    year: "2016 – 2020",
  },
  languages: [
    { name: "Armenian", level: "Native" },
    { name: "Russian", level: "C1" },
    { name: "English", level: "C1" },
  ],
};
