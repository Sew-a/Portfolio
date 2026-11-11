import Seo from "@/src/components/Seo";
import GameView from "@/src/pages/game/_components/GameView";
import { GAME_SEO } from "@/src/pages/game/constants";
import "@/src/pages/game/styles.scss";

export default function GamePage() {
  return (
    <main className="game-page">
      <Seo title={GAME_SEO.title} description={GAME_SEO.description} />
      <GameView />
    </main>
  );
}
