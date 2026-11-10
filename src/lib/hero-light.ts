// Pure light, wind and tone rules for hero occasions. No imports, so Node can test it directly.

/** Remember days and reduced motion allow no pokes; celebrate days and ordinary days do. */
export function pokesAllowed(
  tone: 'celebrate' | 'remember' | null,
  reducedMotion: boolean
): boolean {
  return tone !== 'remember' && !reducedMotion;
}

/** How lit a lamp, candle or window is. Rain does not dim it: lamps stay lit in the rain. */
export function lampOpacity(night: number, weatherGrey: number): number {
  void weatherGrey;
  return Math.min(1, Math.max(0, (night - 0.2) / 0.8));
}

/** Degrees of sway for something light (a flag, banderitas, a parol): calm air barely moves it. */
export function windSway(windKmh: number, tSec: number, phase: number): number {
  return Math.sin(1.1 * tSec + phase) * Math.min(14, 2 + 0.35 * windKmh);
}
