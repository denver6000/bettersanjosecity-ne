// Pure motion maths for the living hero. No imports, so Node can run the tests on this file directly.

type Weather = 'clear' | 'cloudy' | 'rain' | 'storm';

/** Drifts a cloud right with the real wind; past 1850 it re-enters at -320. */
export function cloudX(x: number, dtSec: number, windKmh: number, k: number): number {
  const next = x + (6 + 1.6 * windKmh) * dtSec * (0.6 + 0.12 * k);
  return next > 1850 ? -320 : next;
}

/** A bird crossing the sky; `scatter` (0 to 1) throws it up and to the right. */
export function birdPose(
  tSec: number,
  bird: { index: number; y: number; speed: number; offset: number; phase: number },
  scatter: number
): { x: number; y: number } {
  return {
    x: ((tSec * bird.speed + bird.offset) % 1900) - 150 + scatter * (160 + 40 * bird.index),
    y: bird.y + Math.sin(1.2 * tSec + bird.phase) * 14 - scatter * (240 + 30 * bird.index),
  };
}

/** Ripples per second on the paddies. */
export function rippleRate(
  weather: Weather,
  precipitationMm: number,
  showerActive: boolean
): number {
  const base =
    weather === 'storm' ? 14 : weather === 'rain' ? 4 + Math.min(1, precipitationMm / 4) * 8 : 0;
  return base + (showerActive ? 7 : 0);
}

/** Where a firefly wants to be: a slow loop around its base point. */
export function fireflyTarget(
  base: { x: number; y: number },
  tSec: number,
  phase: number
): { x: number; y: number } {
  return {
    x: base.x + Math.sin(0.7 * tSec + phase) * 40,
    y: base.y + Math.cos(0.9 * tSec + phase * 1.7) * 24,
  };
}

/** Angle in degrees for a rice stalk: a gentle idle sway, leaning away from a cursor in the grass. */
export function stalkTarget(
  stalkX: number,
  cursorX: number | null,
  cursorY: number | null,
  moving: boolean,
  tSec: number,
  phase: number
): number {
  let angle = Math.sin(1.3 * tSec + phase) * 2.4;
  if (cursorX !== null && cursorY !== null && cursorY > 380) {
    const d = stalkX - cursorX;
    const w = Math.exp(-Math.pow(d / 280, 2)) * (moving ? 1.25 : 0.8);
    angle += Math.sign(d || 1) * 30 * w;
  }
  return angle;
}

/** The hour shown during the sun-click time-lapse: eased through 24 hours, back to `realHour`. */
export function timelapseHour(realHour: number, elapsedMs: number, durationMs: number): number {
  const k = elapsedMs / durationMs;
  if (k >= 1) return realHour;
  const eased = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  return (realHour + 24 * eased) % 24;
}
