import { useRef, useState } from 'react';
import { COMBO_WINDOW_MS } from '../lib/scoring';

export function useCombo() {
  const [streak, setStreak] = useState(0);
  const lastRevealTime = useRef<number>(0);

  function registerReveal(): number {
    const now = Date.now();
    const gap = now - lastRevealTime.current;
    lastRevealTime.current = now;

    if (gap <= COMBO_WINDOW_MS) {
      const next = streak + 1;
      setStreak(next);
      return next;
    } else {
      setStreak(1);
      return 1;
    }
  }

  function resetCombo() {
    setStreak(0);
    lastRevealTime.current = 0;
  }

  return { streak, registerReveal, resetCombo };
}
