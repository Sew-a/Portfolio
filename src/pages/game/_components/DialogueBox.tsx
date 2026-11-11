import type { Engine } from "@/src/lib/game/engine";
import { useGameStore } from "@/src/store/useGameStore";
import { GAME_COPY } from "@/src/pages/game/constants";

export default function DialogueBox({ engine }: { engine: Engine }) {
  const dialogue = useGameStore((s) => s.dialogue);
  const screen = useGameStore((s) => s.screen);
  if (!dialogue || screen !== "playing") return null;

  return (
    <div className="game-dialogue" role="dialog" aria-label={dialogue.speaker}>
      <div className="game-dialogue__head">
        {dialogue.portrait ? (
          <img className="game-dialogue__portrait" src={dialogue.portrait} alt="" />
        ) : (
          <span className="game-dialogue__portrait game-dialogue__portrait--initial">{dialogue.speaker[0]}</span>
        )}
        <div>
          <span className="game-dialogue__speaker">{dialogue.speaker}</span>
          <p className="game-dialogue__text">“{dialogue.text}”</p>
        </div>
      </div>
      <div className="game-dialogue__options">
        {dialogue.options.map((text, i) => (
          <button key={text} type="button" className="game-dialogue__option" onClick={() => engine.choose(i)}>
            <span className="game-dialogue__num">{i + 1}</span>
            {text}
          </button>
        ))}
      </div>
      <span className="game-dialogue__hint">{GAME_COPY.dialogueHint}</span>
    </div>
  );
}
