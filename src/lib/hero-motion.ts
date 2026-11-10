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
