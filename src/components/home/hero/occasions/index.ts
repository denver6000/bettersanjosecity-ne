import type { OccasionId } from '@/lib/occasions';
import type { ActiveId, Manifest, OccasionModule } from './types';

/** Translation key for the scene's screen-reader description on each occasion. */
export const OCCASION_ALT_KEYS: Record<OccasionId, string> = {
  christmas: 'hero-scene-alt-christmas',
  'new-year': 'hero-scene-alt-new-year',
  independence: 'hero-scene-alt-independence',
  'city-anniversary': 'hero-scene-alt-city-anniversary',
  'st-joseph': 'hero-scene-alt-st-joseph',
  'pagibang-damara': 'hero-scene-alt-pagibang-damara',
  'labor-day': 'hero-scene-alt-labor-day',
  kagitingan: 'hero-scene-alt-kagitingan',
  'holy-week': 'hero-scene-alt-holy-week',
  undas: 'hero-scene-alt-undas',
};

// One dynamic import per occasion, so a visitor only ever downloads the occasion that is active.
const LOADERS: Partial<Record<ActiveId, () => Promise<{ default: OccasionModule }>>> = {
  christmas: () => import('./christmas'),
  'new-year': () => import('./new-year'),
  independence: () => import('./independence'),
  kagitingan: () => import('./kagitingan'),
  'holy-week': () => import('./holy-week'),
  undas: () => import('./undas'),
  'city-anniversary': () => import('./city-anniversary'),
  'st-joseph': () => import('./st-joseph'),
  'pagibang-damara': () => import('./pagibang-damara'),
  'labor-day': () => import('./labor-day'),
  ...(process.env.NODE_ENV !== 'production' ? { 'test-pin': () => import('./test-pin') } : {}),
};

export interface LoadedOccasion {
  module: OccasionModule;
  manifest: Manifest | null;
  assetBase: string;
}

const cache = new Map<ActiveId, Promise<LoadedOccasion>>();

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

/** Loads an occasion's code and art together; rejects if either is missing so the plain scene stays. */
export function loadOccasion(id: ActiveId): Promise<LoadedOccasion> {
  let promise = cache.get(id);
  if (!promise) {
    const loader = LOADERS[id];
    promise = (async () => {
      if (!loader) throw new Error(`no module for ${id}`);
      const module = (await loader()).default;
      const assetBase = `/assets/images/hero/occasions/${id}/`;
      let manifest: Manifest | null = null;
      await Promise.all(
        module.assets.map(async (name) => {
          if (name.endsWith('.json')) {
            const res = await fetch(assetBase + name);
            if (!res.ok) throw new Error(`could not load ${name}`);
            manifest = (await res.json()) as Manifest;
          } else {
            await preloadImage(assetBase + name);
          }
        })
      );
      return { module, manifest, assetBase };
    })();
    promise.catch(() => cache.delete(id));
    cache.set(id, promise);
  }
  return promise;
}
