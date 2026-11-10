// One shared clock for the occasion layers: the hero loop ticks it, and each layer re-renders on its
// own (about 30 times a second) without re-rendering the whole scene.
let seconds = 0;
let lastNotify = 0;
const subscribers = new Set<() => void>();

export const clock = {
  subscribe(fn: () => void) {
    subscribers.add(fn);
    return () => {
      subscribers.delete(fn);
    };
  },
  snapshot: () => seconds,
  tick(nowMs: number) {
    seconds = nowMs / 1000;
    if (nowMs - lastNotify >= 33) {
      lastNotify = nowMs;
      subscribers.forEach((fn) => fn());
    }
  },
};
