// --- TimerHook.jsx ---
import { useEffect, useRef, useCallback } from "react";

/**
 * Hook per gestire countdown timer con gestione visibilità + background.
 * @param {boolean} isRunning - se il timer è attivo
 * @param {number|null} timeRemaining - tempo corrente rimanente
 * @param {function} onTick - funzione chiamata ogni secondo con il nuovo tempo
 * @param {function} onFinish - funzione chiamata a fine countdown
 */
export function useTimer({ isRunning, timeRemaining, onTick, onFinish, audioCtxRef }) {
  const lastTickRef = useRef(Date.now());
  const rafRef = useRef(null);
  const visibilityRef = useRef(document.visibilityState);
;
  const tick = useCallback(() => {
    const now = Date.now();
    const delta = Math.floor((now - lastTickRef.current) / 1000);

    if (delta > 0 && timeRemaining !== null) {
      const nextTime = timeRemaining - delta;
      onTick(Math.max(nextTime, 0));

      if (nextTime <= 0) {
        onFinish();
        return;
      }

      lastTickRef.current = now;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [timeRemaining, onTick, onFinish]);

  useEffect(() => {
    if (!isRunning || timeRemaining === null) return;

    lastTickRef.current = Date.now();
    rafRef.current = requestAnimationFrame(tick);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isRunning) {
        const now = Date.now();
        const delta = Math.floor((now - lastTickRef.current) / 1000);
        if (delta > 0 && timeRemaining !== null) {
          const nextTime = timeRemaining - delta;
          onTick(Math.max(nextTime, 0));
          if (nextTime <= 0) onFinish();
        }
        lastTickRef.current = now;

        if (audioCtxRef.current?.state === "suspended" ||
          audioCtxRef.current?.state === "interrupted") {
          audioCtxRef.current.resume().catch(() => { });
        }


      }
      visibilityRef.current = document.visibilityState;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [isRunning, timeRemaining, tick, onTick, onFinish]);



}
