import type { ComponentType } from "react";
import {
  SiReact,
  SiRedux,
  SiJavascript,
  SiTypescript,
  SiDocker,
  SiNextdotjs,
  SiGraphql,
  SiNodedotjs,
  SiHtml5,
  SiCss,
  SiStorybook,
  SiNestjs,
  SiPostgresql,
} from "react-icons/si";
import { GiBearFace } from "react-icons/gi";

export const TECH_ICONS: { name: string; Icon: ComponentType<{ size?: number }> }[] = [
  { name: "React", Icon: SiReact },
  { name: "Redux", Icon: SiRedux },
  { name: "JavaScript", Icon: SiJavascript },
  { name: "TypeScript", Icon: SiTypescript },
  { name: "Docker", Icon: SiDocker },
  { name: "Next.js", Icon: SiNextdotjs },
  { name: "Zustand", Icon: GiBearFace },
  { name: "GraphQL", Icon: SiGraphql },
  { name: "Node.js", Icon: SiNodedotjs },
  { name: "NestJS", Icon: SiNestjs },
  { name: "PostgreSQL", Icon: SiPostgresql },
  { name: "HTML", Icon: SiHtml5 },
  { name: "CSS", Icon: SiCss },
  { name: "Storybook", Icon: SiStorybook },
];

export const HERO_ANIMATIONS = {
  tag: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: 0.15 },
  },
  heading: {
    initial: { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay: 0.25, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
  sub: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay: 0.4 },
  },
  cta: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: 0.55 },
  },
};