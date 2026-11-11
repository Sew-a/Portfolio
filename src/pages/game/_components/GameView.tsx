import { useEffect, useRef, useState } from "react";
import { Engine } from "@/src/lib/game/engine";
import { gameUiBridge, useGameStore } from "@/src/store/useGameStore";
import DialogueBox from "@/src/pages/game/_components/DialogueBox";
import Hud from "@/src/pages/game/_components/Hud";
import Screens from "@/src/pages/game/_components/Screens";
import { CONTROLS, GAME_COPY } from "@/src/pages/game/constants";

const desktopQuery = "(pointer: fine) and (min-width: 900px)";

function useIsDesktop() {
  const [ok, setOk] = useState(() => window.matchMedia(desktopQuery).matches);
  useEffect(() => {
    const mq = window.matchMedia(desktopQuery);
    const onChange = () => setOk(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return ok;
}

/** Mounts the engine on a canvas and layers the React HUD and menus on top. */
export default function GameView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<Engine | null>(null);
  const screen = useGameStore((s) => s.screen);
  const isDesktop = useIsDesktop();

  // Keep the whole frame on screen once play starts.
  const frameRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (screen === "playing") frameRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [screen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isDesktop) return;
    const instance = new Engine(canvas, gameUiBridge);
    setEngine(instance);
    // Dev-only handle for poking at the game from the console.
    if (import.meta.env.DEV) (window as unknown as { __smokeSim?: Engine }).__smokeSim = instance;
    return () => {
      instance.dispose();
      setEngine(null);
      useGameStore.getState().reset();
    };
  }, [isDesktop]);

  if (!isDesktop) {
    return (
      <section className="game">
        <p className="game__mobile">{GAME_COPY.mobile}</p>
      </section>
    );
  }

  return (
    <section className="game">
      <div ref={frameRef} className={`game__frame game__frame--${screen}`}>
        <canvas ref={canvasRef} className="game__canvas" />
        <div className="game__crt" aria-hidden="true" />
        {engine && (screen === "playing" || screen === "paused") && <Hud engine={engine} />}
        {engine && <DialogueBox engine={engine} />}
        {engine && <Screens engine={engine} />}
      </div>
      <ul className="game__controls">
        {CONTROLS.map((c) => (
          <li key={c.keys} className="game__control">
            <kbd className="game__key">{c.keys}</kbd>
            <span>{c.action}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
