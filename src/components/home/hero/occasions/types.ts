import type { ReactElement } from 'react';
import type { DateParts, OccasionId, Tone } from '@/lib/occasions';

/** Where in the scene's depth an occasion draws, back to front. */
export type Slot =
  'behindHills' | 'betweenHillsAndPaddies' | 'betweenPaddiesAndForeground' | 'frontOfForeground';

export interface SpriteRect {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface SpriteSheet {
  file: string;
  sprites: SpriteRect[];
}
export interface Manifest {
  sheets: SpriteSheet[];
}

export interface OccasionContext {
  night: number;
  windKmh: number;
  hour: number;
  date: DateParts;
  /** Seconds, updated about 30 times a second while the hero is running. */
  tSec: number;
  reduced: boolean;
  weatherGrey: number;
  /** False on remember days and with reduced motion: render no poke handlers. */
  pokes: boolean;
  manifest: Manifest | null;
  /** URL folder of this occasion's files, ending in a slash. */
  assetBase: string;
}

/** The occasion drawn on the scene. */
export type ActiveId = OccasionId;

export interface OccasionModule {
  id: ActiveId;
  tone: Tone;
  /** File names under the occasion's asset folder; `.json` is parsed as the sprite manifest. */
  assets: string[];
  /** Called once per slot; return null for slots this occasion does not use. */
  render(slot: Slot, ctx: OccasionContext): ReactElement | null;
  pokes?: { sky?: (scene: { x: number; y: number }) => void };
}
