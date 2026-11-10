'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

/** True when the visitor asks for reduced motion; follows changes to the setting. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/**
 * One requestAnimationFrame loop that runs only while `enabled`, the tab is visible and the
 * `target` element is on screen. `dtSec` is capped at 0.05 so a stalled tab never jumps.
 */
export function useHeroLoop(
  onFrame: (nowMs: number, dtSec: number) => void,
  enabled: boolean,
  target: RefObject<Element | null>
): void {
  const callback = useRef(onFrame);
  callback.current = onFrame;

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let last = 0;
    let tabVisible = document.visibilityState === 'visible';
    let onScreen = true;

    function step(now: number) {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      callback.current(now, dt);
      raf = requestAnimationFrame(step);
    }
    function sync() {
      if (tabVisible && onScreen) {
        if (!raf) {
          last = 0;
          raf = requestAnimationFrame(step);
        }
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    const onVisibility = () => {
      tabVisible = document.visibilityState === 'visible';
      sync();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const el = target.current;
    const io = el
      ? new IntersectionObserver(([entry]) => {
          onScreen = entry.isIntersecting;
          sync();
        })
      : null;
    if (el) io?.observe(el);

    sync();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
      io?.disconnect();
    };
  }, [enabled, target]);
}
