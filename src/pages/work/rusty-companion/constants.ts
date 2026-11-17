import type { RustyClip, RustyMood } from "@/src/lib/rusty/types";

export const RUSTY_SLUG = "rusty-companion";

export const RUSTY_SEO = {
  title: "Rusty Companion — Sevak Avetisyan",
  description:
    "Case study of Rusty, a free, open-source animated desktop robot for Claude Code: Electron, three.js, a Blender-built model, Claude Code hooks and an on-device voice. Try him live on the page.",
};

/** One thing Rusty can act out on the stage. */
export interface StageAction {
  id: string;
  label: string;
  mood: RustyMood;
  /** Blender clip to play first (the body), while the face shows `mood`. */
  clip?: RustyClip;
  /** Walk or sprint on the spot, turned to the side. */
  facing?: number;
  /** Seconds before he goes back to idle. */
  seconds: number;
  /** What he says in the bubble (first person, short). */
  line: string;
}

export const STAGE_IDLE_LINE = "Hi! I'm Rusty. Press a button and I'll show you.";

export const STAGE_ACTIONS: StageAction[] = [
  { id: "wave", label: "Wave", mood: "greet", clip: "Wave", seconds: 2.5, line: "Hello there!" },
  { id: "hop", label: "Hop", mood: "happy", clip: "Hop", seconds: 1.6, line: "Boing!" },
  { id: "cheer", label: "Cheer", mood: "happy", clip: "Cheer", seconds: 2.4, line: "Task done!" },
  { id: "think", label: "Think", mood: "thinking", seconds: 4, line: "Hmm, let me think…" },
  { id: "work", label: "Work", mood: "working", seconds: 4, line: "Editing files, running commands." },
  { id: "browse", label: "Browse", mood: "browsing", seconds: 4, line: "Look, over there in the browser!" },
  { id: "research", label: "Take notes", mood: "researching", seconds: 5, line: "Taking notes while I research." },
  { id: "permission", label: "Ask", mood: "permission", seconds: 4, line: "Can I go ahead? I need your OK." },
  { id: "knock", label: "Knock", mood: "nudge", seconds: 3, line: "Knock knock! Still waiting on you." },
  { id: "dance", label: "Dance", mood: "dancing", seconds: 4.8, line: "That was a long one. Dance break!" },
  { id: "coffee", label: "Coffee", mood: "sipping", seconds: 5, line: "Morning! Just a sip first." },
  { id: "walk", label: "Walk", mood: "walking", facing: 0.55, seconds: 4, line: "A little stroll along the taskbar." },
  { id: "sprint", label: "Sprint", mood: "running", facing: 0.55, seconds: 3.5, line: "On it! Fixing that bug." },
  { id: "yawn", label: "Yawn", mood: "tired", seconds: 3.2, line: "Ahh… it's getting late." },
  { id: "sleep", label: "Nap", mood: "sleep", seconds: 5, line: "Zzz…" },
  { id: "sad", label: "Oops", mood: "error", seconds: 3, line: "Something broke. I'm a bit sad." },
];

export const RUSTY_HERO_COPY = {
  eyebrow: "// FREE & OPEN SOURCE",
  freeBadge: "Free to download",
  platformBadge: "Windows 10 / 11",
  download: "Download on GitHub",
  install: "How to install",
  stageTitle: "rusty — live in your browser",
  stageHint: "This is the real model from the app. Make him move:",
};

/** Claude Code event → what Rusty does. From the rusty-companion README. */
export const REACTIONS: { event: string; when: string; does: string; action: string }[] = [
  { event: "SessionStart", when: "A Claude Code session starts", does: "Waves and says hello", action: "wave" },
  { event: "UserPromptSubmit", when: "You send a prompt", does: "Shows a thought cloud with dots", action: "think" },
  { event: "PreToolUse · Edit / Bash", when: "Claude edits files or runs commands", does: "Looks busy", action: "work" },
  { event: "PreToolUse · Browser", when: "Claude uses the browser", does: "Points and looks curious", action: "browse" },
  { event: "PreToolUse · WebSearch", when: "Claude does research (several web lookups)", does: "Takes notes on a little notepad", action: "research" },
  { event: "PermissionRequest", when: "Claude needs your permission", does: "Waves both arms and asks, out loud too", action: "permission" },
  { event: "… a minute later", when: "You still haven't answered", does: "Knocks on his screen to remind you", action: "knock" },
  { event: "Stop", when: "Claude finishes", does: "Cheers and reads the answer aloud", action: "cheer" },
  { event: "Stop · 7+ min", when: "A task took a long time", does: "Dances", action: "dance" },
  { event: "Idle", when: "Nothing is happening", does: "Strolls along the taskbar, yawns, naps", action: "walk" },
];

export const REACTIONS_HEADING = { title: "When Claude…, Rusty…", label: "// EVENT → REACTION" };
export const REACTIONS_PLAY = "Show me";

export const GALLERY_HEADING = { title: "On the desktop", label: "// SCREENSHOTS" };

export const INSTALL_HEADING = { title: "Take Rusty home", label: "// INSTALL IN 2 MINUTES" };

export const INSTALL_STEPS: { comment: string; command: string }[] = [
  { comment: "Get the code", command: "git clone https://github.com/Sew-a/rusty-companion.git" },
  { comment: "Install dependencies", command: "cd rusty-companion && npm install" },
  { comment: "Start Rusty (he appears above the taskbar)", command: "npm start" },
  { comment: "Connect him to Claude Code", command: "npm run hooks:install" },
];

export const INSTALL_COPY = { copy: "Copy", copied: "Copied", terminalTitle: "PowerShell", requirementsTitle: "You need" };

export const REQUIREMENTS = [
  "Windows 10 or 11",
  "Node.js 20 or newer",
  "Claude Code 2.1 or newer (CLI or the desktop app's Code tab)",
  "About 400 MB for the voice model, downloaded on first start",
  "Optional: Blender 5.1, only to change the 3D model",
];

export const RUSTY_CTA = {
  title: "Free for everyone. Clone it, run it, make it yours.",
  button: "Get Rusty on GitHub",
  disclaimer: "Rusty is a fan-made helper for Claude Code, not an official Anthropic product.",
};
