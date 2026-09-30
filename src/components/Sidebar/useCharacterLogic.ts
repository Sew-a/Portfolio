import { useState, useEffect, useCallback, useRef } from "react";
import { Action } from "../../utils/characterConstants";

export function useCharacterLogic() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentAction, setCurrentAction] = useState<Action>("idle");
  const [isReady, setIsReady] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());


  const handleLoaded = useCallback(() => {
    const timer = setTimeout(() => setIsReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsRunning(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        if (keysPressed.current.size === 0) {
          setIsRunning(false);
        }
      }, 250);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e?.key?.toLowerCase();
      
      if (key === "escape") {
        setCurrentAction("dead");
        return;
      }

      // Movement keys
      if (["a", "d", "arrowleft", "arrowright"].includes(key)) {
        keysPressed.current.add(key);
        setIsRunning(true);
      }
      // Action keys
      if (key === " ") {
        e.preventDefault();
        setCurrentAction("jump");
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e?.key?.toLowerCase();
      if (["a", "d", "arrowleft", "arrowright"].includes(key)) {
        keysPressed.current.delete(key);
        if (keysPressed.current.size === 0) {
          setIsRunning(false);
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (e.button === 0) {
        setCurrentAction(Math.random() > 0.5 ? "kick" : "secKick");
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setCurrentAction("action1");
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("click", handleClick);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("contextmenu", handleContextMenu);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  const handleActionComplete = () => {
    setCurrentAction("idle");
  };

  const triggerKick = () => {
    setCurrentAction("kick");
  };

  return {
    isReady,
    isRunning,
    currentAction,
    triggerKick,
    handleLoaded,
    handleActionComplete,
  };
}
