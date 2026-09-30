import { ShieldCheck, Layers, Boxes } from "lucide-react";

export const APPROACH_DATA = [
  {
    id: "safety",
    title: "Type Safety & Correctness",
    problem:
      "Loosely typed codebases lead to runtime bugs, unclear contracts between components, and slower onboarding for new engineers.",
    solution:
      "I build with TypeScript end-to-end — strict typing, shared type contracts across modules, and compile-time checks that catch errors before they ship, reducing regressions and making large codebases safer to refactor.",
    tags: ["TypeScript", "Strict Typing", "Shared Contracts", "Compile-time Checks"],
  },
  {
    id: "state",
    title: "Scalable State Management",
    problem:
      "As apps grow, state logic becomes tangled — prop drilling, redundant fetching, and inconsistent data across components.",
    solution:
      "I design clean state architectures using tools like Zustand or Redux (chosen based on the app's actual complexity, not by default), paired with data-fetching libraries like TanStack Query, to keep state predictable, performant, and easy to reason about.",
    tags: ["Zustand", "Redux", "TanStack Query", "Predictability"],
  },
  {
    id: "architecture",
    title: "Scalable Frontend Architecture",
    problem:
      "Monolithic frontend codebases become slow to build, hard to deploy independently, and risky to change — one team's bug can block everyone else.",
    solution:
      "I architect applications using Module Federation to split large frontends into independently deployable micro-frontends, isolating logic and ownership boundaries while keeping the end-user experience seamless.",
    tags: ["Module Federation", "Micro-frontends", "Independent Deploys"],
  },
];