export type Action = "idle" | "run" | "kick" | "secKick" | "action1" | "dead";

export interface ActionConfig {
  frames: string[];
  fps: number;
  isOneShot: boolean;
  freezeOnEnd?: boolean;
}

export const CHARACTER_CONFIG: Record<Action, ActionConfig> = {
  idle: {
    frames: [
      "ComixZone_10.png", "ComixZone_12.png",
      "ComixZone_14.png", "ComixZone_14.png", "ComixZone_12.png",
      "ComixZone_10.png"
    ].map(f => `/game/idle/${f}`),
    fps: 4,
    isOneShot: false,
  },
  run: {
    frames: [
      "ComixZone_02.png", "ComixZone_04.png", "ComixZone_06.png",
      "ComixZone_08.png", "ComixZone_10.png", "ComixZone_12.png",
      "ComixZone_14.png", "ComixZone_16.png", "ComixZone_18.png",
      "ComixZone_20.png"
    ].map(f => `/game/run/${f}`),
    fps: 12,
    isOneShot: false,
  },
  kick: {
    frames: ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png", "7.png", "8.png", "9.png", "10.png", "20.png", "20.png", "22.png", "22.png"].map(f => `/game/footKick/${f}`),
    fps: 10,
    isOneShot: true,
  },
  secKick: {
    frames: ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png", "7.png"].map(f => `/game/secKick/${f}`),
    fps: 10,
    isOneShot: true,
  },
  action1: {
    frames: ["1.png", "2.png", "1.png", "3.png", "4.png", "5.png", "5.png", "6.png", "7.png", "8.png", "9.png", "9.png", "10.png", "10.png", "4.png", "3.png", "2.png", "1.png"].map(f => `/game/action1/${f}`),
    fps: 6,
    isOneShot: true,
  },
  dead: {
    frames: ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png", "7.png", "8.png", "9.png", "10.png", "11.png", "12.png"].map(f => `/game/dead/${f}`),
    fps: 6,
    isOneShot: false,
    freezeOnEnd: true,
  },
};
