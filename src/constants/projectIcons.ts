import { Bot, FolderOpen, MessagesSquare, PenTool } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const PROJECT_ICONS: Record<string, LucideIcon> = {
  Bot,
  MessagesSquare,
  PenTool,
};

export const FALLBACK_PROJECT_ICON: LucideIcon = FolderOpen;

export function getProjectIcon(name?: string): LucideIcon {
  return (name && PROJECT_ICONS[name]) || FALLBACK_PROJECT_ICON;
}