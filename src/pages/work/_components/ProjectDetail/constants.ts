import { Layers, Boxes, Rocket, Wrench, Globe, FolderOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SectionHeading } from "./types";

export const FEATURE_ICONS: LucideIcon[] = [
  Layers,
  Boxes,
  Rocket,
  Wrench,
  Globe,
  FolderOpen,
  Boxes,
  Rocket,
];

export const SECTION_HEADINGS: Record<
  "overview" | "architecture" | "features" | "highlights",
  SectionHeading
> = {
  overview: { title: "Overview", label: "// THE PROJECT" },
  architecture: { title: "Architecture & decisions", label: "// HOW IT WORKS" },
  features: { title: "Features", label: "// CAPABILITIES" },
  highlights: { title: "Highlights", label: "// KEY POINTS" },
};

export const PROJECT_NOT_FOUND = {
  title: "Project not found",
  label: "// 404",
  backAction: "← Back to work",
};

export const PROJECT_HERO_COPY = {
  allWork: "All work",
  liveSite: "Visit live site",
  sourceCode: "View source code",
};