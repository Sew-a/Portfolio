export const HERO_DATA = {
  tag: "// ENGINEER",
  name: "I'm Sevak",
  title: "Software Engineer /",
  accent: "Frontend Engineer",
 summary:
    "5+ years of experience building scalable web applications with React and TypeScript. Specializes in Frontend Architecture, Micro-frontends, Module Federation, reusable component systems, performance, and testing.",
  email: "sevavetisyan97@gmail.com",
  phone: "+37441080497",
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
    slug: "form-builder",
    title: "Collaborative Form Builder",
    tagline: "Google-Forms-style builder with real-time multiplayer editing",
    summary:
      "A full-stack, real-time collaborative drag & drop form builder. Multiple users edit the same form simultaneously — presence, live field sync, nested sections — then publish to a shareable public link and review responses.",
    description:
      "Built from scratch as a single deployable application: a React + Next.js frontend, Express REST API, and a Socket.io real-time layer all running in one Node process. The drag & drop canvas follows the Webflow-style 3-panel pattern (field palette → canvas → contextual property panel), and every edit syncs live to collaborators over WebSockets with debounced auto-save to MongoDB. It is the kind of product engineers use daily, rebuilt end-to-end — the differentiator is genuine multi-user collaboration rather than typical CRUD demos.",
    role: "Creator · Designer · Full-stack Engineer",
    year: "2026",
    status: "Active",
    image:
      "https://res.cloudinary.com/dlggumsot/image/upload/v1785505427/Screenshot_2026-07-31_173129_qoohga.webp",
    imageAlt: "Collaborative Form Builder interface",
    accent: "#00f0ff",
    icon: "ClipboardList",
    links: {
      repo: "https://github.com/Sew-a/form-builder",
    },
    techStack: [
      "Next",
      "React",
      "TypeScript",
      "Express",
      "Socket.io",
      "MongoDB / Mongoose",
      "Zustand",
      "Zod",
      "Tailwind CSS",
      "Jest",
    ],
    highlights: [
      "Real-time collaboration — live presence + field sync over Socket.io rooms",
      "11 field types incl. nested 'section' containers with cross-container drag & drop",
      "Optimistic UI with debounced auto-save; last-write-wins conflict handling",
      "Shared Zod schemas between client & server so contracts never drift",
      "Public publish flow + owner-only responses table",
    ],
    architecture: [
      {
        title: "Single-process monolith",
        desc: "Custom Node HTTP server mounts Express for /api/*, falls through to the Next.js request handler, and attaches Socket.io to the same port — one deployable unit that makes WebSockets first-class.",
      },
      {
        title: "Flat fields + parentId",
        desc: "Fields live in a flat array with parentId for nesting, the standard @dnd-kit pattern. Reorders and moves become tiny targeted DB updates and minimal socket diffs.",
      },
      {
        title: "Optimistic UI → server authority",
        desc: "Edits update the Zustand store instantly, persist to MongoDB (debounced), then broadcast to room peers. Sender is not echoed, avoiding loops.",
      },
      {
        title: "Shared contracts",
        desc: "Zod schemas, types, field-type lists, and SOCKET_EVENTS all live in shared/types.ts, imported by both client and server so validation rules cannot drift.",
      },
    ],
    features: [
      {
        title: "Drag & drop canvas",
        desc: "3-panel Webflow-style builder with palette, canvas, and contextual property panel. Keyboard-sortable, DragOverlay preview, click-to-add fallback.",
      },
      {
        title: "Real-time collaboration",
        desc: "Socket.io rooms keyed by form id with live presence list and instant sync of add, update, reorder, move, and delete events.",
      },
      {
        title: "Nested sections",
        desc: "Sections are real containers; fields can be dragged in and out, nesting capped at one level, with children promoted on delete.",
      },
      {
        title: "Rich field properties",
        desc: "Labels, placeholders, validation bounds, required toggles, options, and appearance controls (colors, radius, width, font size) per field.",
      },
      {
        title: "Auth & accounts",
        desc: "JWT in httpOnly cookie, bcrypt hashing, avatar upload with client-side compression, password change, and account deletion that cascades.",
      },
      {
        title: "Publish & responses",
        desc: "Anyone can fill a published form without an account; owners and collaborators review structured responses in a table.",
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
    slug: "form-builder",
    title: "Collaborative Form Builder",
    tagline: "Real-time multiplayer drag & drop form builder",
    image: 'https://res.cloudinary.com/dlggumsot/image/upload/v1785505427/Screenshot_2026-07-31_173129_qoohga.webp',
    accent: "#00f0ff",
    href: "/work",
  },
  {
    slug: "ai-agents",
    title: "AI Agents & Prompt Engineering Hub",
    tagline: "Prompt engineering, agents & RAG made copyable",
    image: PROJECTS[1].image,
    accent: "#a855f7",
    href: "/work",
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
    period: "May 2021 – Present",
    companySummary:
      "AI-powered creative platform for photo, video, and design, serving 150M+ users worldwide.",
    roles: [
      {
        title: "Frontend Engineer II",
        period: "Mar 2025 – Present",
        achievements: [
          "Architected Frontend solutions for the photo editor, File System, component library, and Micro-frontend ecosystem serving 150M+ users.",
          "Created a reusable File System library, ~15 reusable components, and a unified interface contract, saving 20 hours per sprint.",
          "Built the Google Picker Micro-frontend from scratch with Module Federation, enabling reuse across 4 teams.",
          "Reduced production bugs in the core editor by 9.3% through Datadog-driven root-cause analysis.",
        ],
      },
      {
        title: "Frontend Engineer I",
        period: "Apr 2022 – Feb 2025",
        achievements: [
          "Architected a cross-project Commenting Micro-frontend and leveraged Cursor + Claude for API integration, reducing delivery time from 6 to 3 weeks.",
          "Developed the Storage Micro-frontend from scratch and contributed to the architecture of 5+ production Micro-frontends, enabling independent integration and releases.",
          "Automated landing page data migration from local storage to CDN, optimizing content delivery architecture.",
          "Increased unit test coverage across the landing and File System projects to 50–65% within 3–5 weeks.",
        ],
      },
      {
        title: "UI Engineer",
        period: "May 2021 – Apr 2022",
        achievements: [
          "Built and optimized React/Next.js landing pages for web performance.",
          "Increased the main page Lighthouse performance score to 90%.",
          "Built and contributed to 20+ landing pages, maintaining Lighthouse scores of 75–85%.",
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
        title: "Frontend Engineer",
        period: "Nov 2020 – May 2021",
        achievements: [
          "Built lightweight landing pages and e-commerce interfaces with HTML, CSS/Sass, JavaScript, jQuery, and React.",
          "Migrated legacy vanilla JavaScript functionality to React, improving maintainability and extensibility.",
          "Optimized Frontend performance, achieving 80–90% Lighthouse scores.",
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
  { cat: "AI-Enhanced Dev", items: ["Claude", "Cursor", "Copilot", "AI Agents", "Prompt Engineering"] },
  { cat: "Game Development", items: ["Unity", "C#", "Blender", "Pixel Art"] },
];

export const RESUME = {
  name: "Sevak Avetisyan",
  title: "Frontend Engineer | React · TypeScript · Micro-Frontend Architecture",
  headline:
    "Frontend Engineer | React · TypeScript · Micro-Frontend Architecture",
  email: "sevavetisyan97@gmail.com",
  phone: "+374 41080497",
  location: "Yerevan, Armenia",
  linkedin: "https://www.linkedin.com/in/sevak-avetisyan-arm/",
  github: "https://github.com/Sew-a",
  portfolio: "/",
  summary:
    "Frontend Engineer with 5+ years of experience building scalable web applications with React and TypeScript. Specializes in Frontend Architecture, Micro-frontends, Module Federation, reusable component systems, performance, and testing. Architected 5+ production Micro-frontends for a 150M+ user platform, including Google Picker and File System built from scratch, while enabling independent releases across product teams and reducing production bugs in the core editor by 9.3%.",
  skillGroups: [
    {
      category: "Frontend Development",
      items: ["React", "TypeScript", "JavaScript", "Next.js", "HTML5", "CSS3/Sass", "JSS"],
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
      items: ["Node.js", "Express", "Webpack", "Docker"],
    },
    {
      category: "Testing & Design Systems",
      items: ["Jest", "Storybook"],
    },
    {
      category: "AI-assisted Development",
      items: ["Cursor", "Claude"],
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
    { name: "English", level: "B2" },
  ],
};
