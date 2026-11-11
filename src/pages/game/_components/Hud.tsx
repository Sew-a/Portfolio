import { Volume2, VolumeX } from "lucide-react";
import type { Engine } from "@/src/lib/game/engine";
import { useGameStore } from "@/src/store/useGameStore";
import { GAME_COPY } from "@/src/pages/game/constants";

const VISIBLE_TASKS = 4;

export default function Hud({ engine }: { engine: Engine }) {
  const satisfaction = useGameStore((s) => s.satisfaction);
  const health = useGameStore((s) => s.health);
  const boss = useGameStore((s) => s.boss);
  const tasks = useGameStore((s) => s.tasks);
  const toasts = useGameStore((s) => s.toasts);
  const score = useGameStore((s) => s.score);
  const combo = useGameStore((s) => s.combo);
  const muted = useGameStore((s) => s.muted);

  const activeIdx = Math.max(0, tasks.findIndex((t) => t.active));
  const start = Math.max(0, Math.min(activeIdx - 2, tasks.length - VISIBLE_TASKS));
  const visible = tasks.slice(start, start + VISIBLE_TASKS);

  return (
    <div className="game-hud">
      <div className="game-hud__left">
        {satisfaction !== null && (
          <div className="game-hud__panel">
            <span className="game-hud__label">{GAME_COPY.satisfaction}</span>
            <div className="game-hud__bar">
              <div
                className={`game-hud__fill${satisfaction < 25 ? " game-hud__fill--low" : ""}`}
                style={{ width: `${satisfaction}%` }}
              />
            </div>
          </div>
        )}
        {health && (
          <div className="game-hud__panel">
            <span className="game-hud__label">{GAME_COPY.health}</span>
            <div className="game-hud__hearts">
              {Array.from({ length: health.max }, (_, i) => (
                <span key={i} className={`game-hud__heart${i < health.hp ? "" : " game-hud__heart--lost"}`} />
              ))}
            </div>
          </div>
        )}
        {health && (
          <div className="game-hud__score">
            {score.toLocaleString()}
            {combo > 1 && <span className="game-hud__combo">x{combo} COMBO</span>}
          </div>
        )}
      </div>

      <div className="game-hud__toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="game-hud__toast">
            {t.text}
          </div>
        ))}
      </div>

      <div className="game-hud__right">
        <button
          type="button"
          className="game-hud__mute"
          onClick={() => engine.setMuted(!muted)}
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        {tasks.length > 0 && (
          <div className="game-hud__panel game-hud__tasks">
            <span className="game-hud__label">{GAME_COPY.tasks}</span>
            <ul className="game-hud__task-list">
              {visible.map((t) => (
                <li
                  key={t.id}
                  className={`game-hud__task${t.done ? " game-hud__task--done" : ""}${t.active ? " game-hud__task--active" : ""}`}
                >
                  <span className="game-hud__check" />
                  {t.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {boss !== null && (
        <div className="game-hud__boss">
          <span className="game-hud__label">{GAME_COPY.boss}</span>
          <div className="game-hud__bar game-hud__bar--boss">
            <div className="game-hud__fill game-hud__fill--boss" style={{ width: `${boss * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
