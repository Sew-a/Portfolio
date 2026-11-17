import type { RustyClip, RustyMood } from "@/src/lib/rusty/types";

/** A Blender clip to play once. Change `id` to replay the same clip. */
export interface RustyClipRequest {
  name: RustyClip;
  id: number;
}

export interface RustyProps {
  /** Body pose and face expression. */
  mood: RustyMood;
  /** Optional one-shot clip; it owns the body while it plays, the face keeps `mood`. */
  clip?: RustyClipRequest | null;
  /** Body yaw in radians (positive turns towards the viewer's right). Eased towards. */
  facing?: number;
  /** Height of the visible world in model units (Rusty is 1.4 tall). Smaller = bigger Rusty. */
  viewHeight?: number;
  className?: string;
  onLoad?: () => void;
  onClipEnd?: () => void;
}
