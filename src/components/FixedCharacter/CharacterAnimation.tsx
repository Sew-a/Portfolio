import Rusty from "@/src/components/Rusty";
import { useCharacterLogic } from "./useCharacterLogic";

export default function CharacterAnimation() {
  const { isReady, mood, clip, facing, handleLoaded, handleClipEnd } = useCharacterLogic();

  return (
    <div className="character-section-wrapper">
      <div className={`character-animation-container ${isReady ? "ready" : ""}`}>
        <Rusty
          mood={mood}
          clip={clip}
          facing={facing}
          viewHeight={2.1}
          onLoad={handleLoaded}
          onClipEnd={handleClipEnd}
        />
      </div>
    </div>
  );
}
