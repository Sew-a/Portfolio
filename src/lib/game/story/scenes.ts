import type { Engine } from "@/src/lib/game/engine";
import type { FriendId } from "@/src/lib/game/entities/friend";
import { WANDER_PATHS } from "@/src/lib/game/levels/house";
import { finalMonologue, LEAVE_LINES, LONELY_CLOSERS, lonelyMonologue } from "@/src/lib/game/story/dialogues";

const LEAVE_ORDER: FriendId[] = ["vahe", "karen", "grish"];
const FIRST_LEAVE = 1.4;
const LEAVE_GAP = 2.4;

/**
 * Act 3 ending: you sit for the last joint, and one by one your friends get up and drift away.
 * You stay on the couch with your thoughts, then the room folds into the maze.
 */
export function lonelinessScene(g: Engine) {
  g.sitDown();
  g.audio.sfx("bong");
  g.toast("You sink into the couch for one last hit.");

  LEAVE_ORDER.forEach((id, i) => {
    g.schedule(FIRST_LEAVE + i * LEAVE_GAP, () => {
      const friend = g.friends.find((f) => f.id === id);
      if (!friend) return;
      const { path, face } = WANDER_PATHS[id];
      friend.walk(path, face);
      g.toast(LEAVE_LINES[id]);
    });
  });

  g.schedule(FIRST_LEAVE + LEAVE_ORDER.length * LEAVE_GAP + 1.2, () => {
    g.audio.setMusicVolume(0.35);
    g.openDialogue(
      lonelyMonologue((g2, lonely) => {
        g2.toast(LONELY_CLOSERS[Math.min(LONELY_CLOSERS.length - 1, Math.floor(lonely / 2))]);
        g2.schedule(2, () => g2.transition(() => g2.startAct(4), 1.5));
      }),
    );
  });
}

/**
 * Act 5, the end: back on the couch in the silent flat. A last few thoughts, then the screen goes
 * black. Nothing is shown; the knife in his hand and the cut to black carry it.
 */
export function finalScene(g: Engine) {
  g.sitDown();
  g.audio.stopHum();
  g.schedule(1.2, () =>
    g.openDialogue(
      finalMonologue((g2) => {
        g2.audio.silence();
        g2.endInDarkness();
      }),
    ),
  );
}
