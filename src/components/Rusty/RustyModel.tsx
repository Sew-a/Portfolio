import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Face } from "@/src/lib/rusty/face";
import { ClipPlayer, RobotAnimator, disposeRobot, loadRobot, type RobotParts } from "@/src/lib/rusty/robot";
import type { RustyProps } from "./types";

/** Body poses step at this rate for a stop-motion feel; the face draws every frame. */
const BODY_FPS = 12;

type ModelProps = Required<Pick<RustyProps, "mood" | "facing" | "viewHeight">> &
  Pick<RustyProps, "clip" | "onLoad" | "onClipEnd">;

/** Orthographic camera framing Rusty with his feet near the bottom (as in the desktop app). */
function RustyCamera({ viewHeight }: { viewHeight: number }) {
  const set = useThree((s) => s.set);
  const size = useThree((s) => s.size);
  const camera = useMemo(() => {
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    // Tell R3F not to reset the frustum to pixel units on resize; we set it ourselves.
    (cam as THREE.OrthographicCamera & { manual?: boolean }).manual = true;
    return cam;
  }, []);

  useLayoutEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    camera.top = viewHeight * 0.62;
    camera.bottom = -viewHeight * 0.38;
    camera.left = (-viewHeight * aspect) / 2;
    camera.right = (viewHeight * aspect) / 2;
    // Aim so the bottom edge stays just under his feet (y = 0) whatever the zoom.
    const aimY = viewHeight * 0.38 - 0.12;
    camera.position.set(0.9, aimY + 0.25, 6);
    camera.lookAt(0, aimY, 0);
    camera.updateProjectionMatrix();
    set({ camera });
  }, [camera, set, size.width, size.height, viewHeight]);

  return null;
}

export default function RustyModel({ mood, facing, viewHeight, clip, onLoad, onClipEnd }: ModelProps) {
  const face = useMemo(() => new Face(), []);
  const [parts, setParts] = useState<RobotParts | null>(null);
  const animator = useRef<RobotAnimator | null>(null);
  const player = useRef<ClipPlayer | null>(null);
  const gl = useThree((s) => s.gl);

  const callbacks = useRef({ onLoad, onClipEnd });
  callbacks.current = { onLoad, onClipEnd };

  const anim = useRef({
    time: 0,
    lastStep: 0,
    moodStart: 0,
    mood,
    facing: 0,
    clipWasPlaying: false,
    gaze: { x: 0, y: 0 },
  });

  useEffect(() => {
    let cancelled = false;
    let loaded: RobotParts | null = null;
    loadRobot(face)
      .then((p) => {
        if (cancelled) return disposeRobot(p);
        loaded = p;
        animator.current = new RobotAnimator(p);
        player.current = new ClipPlayer(p);
        setParts(p);
        callbacks.current.onLoad?.();
      })
      .catch((err) => console.error("Rusty failed to load", err));
    return () => {
      cancelled = true;
      if (loaded) disposeRobot(loaded);
      face.texture.dispose();
    };
  }, [face]);

  // Restart mood timing whenever the mood changes.
  useEffect(() => {
    anim.current.mood = mood;
    anim.current.moodStart = anim.current.time;
  }, [mood]);

  useEffect(() => {
    if (clip && parts) player.current?.play(clip.name);
  }, [clip, parts]);

  // Eyes follow the mouse, relative to the canvas centre.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.4;
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      anim.current.gaze = {
        x: clamp((e.clientX - cx) / (window.innerWidth / 2)),
        y: clamp((e.clientY - cy) / (window.innerHeight / 2)),
      };
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [gl]);

  useFrame((_, delta) => {
    const a = anim.current;
    a.time += Math.min(delta, 0.1);
    if (!parts) return;
    const t = a.time;
    const stepped = Math.floor(t * BODY_FPS) / BODY_FPS;

    if (stepped !== a.lastStep) {
      if (player.current?.playing) {
        player.current.update(a.lastStep ? stepped - a.lastStep : 1 / BODY_FPS);
        a.clipWasPlaying = true;
      }
      a.lastStep = stepped;
      a.facing += (facing - a.facing) * 0.35;
      if (Math.abs(a.facing - facing) < 0.01) a.facing = facing;
    }

    if (!player.current?.playing) {
      if (a.clipWasPlaying) {
        animator.current?.restoreRest();
        a.clipWasPlaying = false;
        callbacks.current.onClipEnd?.();
      }
      animator.current?.pose(a.mood, stepped, stepped - a.moodStart, a.facing);
    }

    face.setGaze(a.gaze.x, a.gaze.y);
    face.draw(a.mood, t);
  });

  return (
    <>
      <RustyCamera viewHeight={viewHeight} />
      {parts && <primitive object={parts.root} />}
    </>
  );
}
