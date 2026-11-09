import { Canvas } from "@react-three/fiber";
import { useCharacterLogic } from "./useCharacterLogic";
import { Character } from "./Character";

export default function CharacterAnimation() {
  const { isRunning, currentAction, handleActionComplete, isReady, handleLoaded } =
    useCharacterLogic();
 
  return (
    <div className="character-section-wrapper">
      <div className={`character-animation-container ${isReady ? 'ready' : ''}`}>
        <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
          <Character
            isRunning={isRunning}
            currentAction={currentAction}
            onActionComplete={handleActionComplete}
            onLoad={handleLoaded}
          />
        </Canvas>
      </div>
    </div>
  );
}