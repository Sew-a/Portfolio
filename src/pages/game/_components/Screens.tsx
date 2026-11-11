import { useEffect, useState } from "react";
import type { Engine } from "@/src/lib/game/engine";
import { useGameStore } from "@/src/store/useGameStore";
import { GAME_COPY } from "@/src/pages/game/constants";

const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Start, pause, game over, act result and ending overlays. */
export default function Screens({ engine }: { engine: Engine }) {
  const screen = useGameStore((s) => s.screen);
  const reason = useGameStore((s) => s.gameOverReason);
  const result = useGameStore((s) => s.result);
  const [savedAct, setSavedAct] = useState(0);

  useEffect(() => {
    if (screen === "start") setSavedAct(engine.savedAct());
  }, [screen, engine]);

  if (screen === "start") {
    return (
      <div className="game-screen">
        <div className="game-screen__card">
          <h1 className="game-screen__title">{GAME_COPY.title}</h1>
          <div className="game-screen__notice">
            <span className="game-screen__tag">{GAME_COPY.noticeTag}</span>
            <p>{GAME_COPY.notice}</p>
          </div>
          <button type="button" className="game-screen__btn" onClick={() => engine.startNew()}>
            {GAME_COPY.start}
          </button>
          {savedAct > 1 && (
            <button type="button" className="game-screen__btn game-screen__btn--ghost" onClick={() => engine.continueSaved()}>
              {GAME_COPY.continue(savedAct)}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (screen === "paused") {
    return (
      <div className="game-screen">
        <div className="game-screen__card">
          <h2 className="game-screen__heading">{GAME_COPY.paused}</h2>
          <button type="button" className="game-screen__btn" onClick={() => engine.togglePause()}>
            {GAME_COPY.resume}
          </button>
          <button type="button" className="game-screen__btn game-screen__btn--ghost" onClick={() => engine.restartCheckpoint()}>
            {GAME_COPY.restartAct}
          </button>
          <button type="button" className="game-screen__btn game-screen__btn--ghost" onClick={() => engine.quitToMenu()}>
            {GAME_COPY.quit}
          </button>
        </div>
      </div>
    );
  }

  if (screen === "gameover") {
    return (
      <div className="game-screen game-screen--danger">
        <div className="game-screen__card">
          <h2 className="game-screen__heading game-screen__heading--danger">{GAME_COPY.gameOverTitle}</h2>
          <p className="game-screen__text">{reason}</p>
          <button type="button" className="game-screen__btn game-screen__btn--danger" onClick={() => engine.restartCheckpoint()}>
            {GAME_COPY.retry}
          </button>
          <button type="button" className="game-screen__btn game-screen__btn--ghost" onClick={() => engine.quitToMenu()}>
            {GAME_COPY.quit}
          </button>
        </div>
      </div>
    );
  }

  if (screen === "result" && result) {
    const rows: [string, string][] = [
      ["Time", formatTime(result.time)],
      ["Kills", String(result.kills)],
      ["Best combo", `x${result.bestCombo}`],
      ["Hits taken", String(result.hitsTaken)],
      ["Score", result.score.toLocaleString()],
    ];
    return (
      <div className="game-screen">
        <div className="game-screen__card">
          <h2 className="game-screen__heading">{result.title}</h2>
          <div className="game-screen__grade">{result.grade}</div>
          <dl className="game-screen__stats">
            {rows.map(([k, v]) => (
              <div key={k} className="game-screen__stat">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <button type="button" className="game-screen__btn" onClick={() => engine.continueResult()}>
            {GAME_COPY.continueResult}
          </button>
        </div>
      </div>
    );
  }

  if (screen === "complete") {
    return (
      <div className="game-screen">
        <div className="game-screen__card">
          <h2 className="game-screen__heading game-screen__heading--gold">{GAME_COPY.completeTitle}</h2>
          <p className="game-screen__text">{GAME_COPY.completeText}</p>
          <p className="game-screen__help">
            {GAME_COPY.help}{" "}
            <a href={GAME_COPY.helpLink.href} target="_blank" rel="noreferrer">
              {GAME_COPY.helpLink.label}
            </a>
          </p>
          <button type="button" className="game-screen__btn game-screen__btn--gold" onClick={() => engine.startNew()}>
            {GAME_COPY.replay}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
