import { lazy, Suspense } from "react";
import "./styles.scss";

const CharacterAnimation = lazy(
  () => import("./CharacterAnimation"),
);

export default function FixedCharacter() {
  return (
    <div className="fixed-character">
      <Suspense fallback={null}>
        <CharacterAnimation />
      </Suspense>
    </div>
  );
}
