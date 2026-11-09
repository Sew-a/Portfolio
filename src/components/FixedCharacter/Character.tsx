import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Action, CHARACTER_CONFIG } from "@/src/utils/characterConstants";
import { useCharacterTextures } from "@/src/hooks/useCharacterTextures";

interface CharacterProps {
  isRunning: boolean;
  currentAction: Action;
  onActionComplete: () => void;
  onLoad: () => void;
}

export function Character({
  isRunning,
  currentAction,
  onActionComplete,
  onLoad,
}: CharacterProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const frameRef = useRef(0);
  const timeRef = useRef(0);
  const prevActionRef = useRef<Action>(currentAction);

  const { textures, initialAspectRatio, loaded } = useCharacterTextures(onLoad);

  useFrame((_, delta) => {
    if (!loaded || !meshRef.current) return;

    const targetAction: Action =
      currentAction === "idle" && isRunning ? "run" : currentAction;

    if (prevActionRef.current !== targetAction) {
      frameRef.current = 0;
      timeRef.current = 0;
      prevActionRef.current = targetAction;
    }

    timeRef.current += delta;

    const config = CHARACTER_CONFIG[targetAction];
    if (timeRef.current < 1 / config.fps) return;

    timeRef.current = 0;
    const frames = textures[targetAction];
    if (!frames?.length) return;

    const next = frameRef.current + 1;

    if (config.isOneShot && next >= frames.length) {
      onActionComplete();
    } else if (config.freezeOnEnd && next >= frames.length) {
      frameRef.current = frames.length - 1;
    } else {
      frameRef.current = next % frames.length;
    }

    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    const tex = frames[frameRef.current];
    mat.map = tex;
    mat.needsUpdate = true;

    const img = tex.image;
    if (img instanceof HTMLImageElement) {
      meshRef.current.scale.set((img.width / img.height) * 3, 3, 1);
    }
  });

  if (!loaded) return null;

  return (
    <mesh ref={meshRef} scale={[initialAspectRatio * 3, 3, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial transparent side={THREE.DoubleSide} />
    </mesh>
  );
}
