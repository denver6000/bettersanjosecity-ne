'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { clock } from './clock';
import { loadOccasion, type LoadedOccasion } from './index';
import type { ActiveId, OccasionContext, Slot } from './types';

/**
 * Draws one depth slot of the active occasion. Until the occasion's code and art are both ready,
 * and if either fails to load, it renders nothing, so the plain scene is never broken or hidden.
 */
export default function OccasionLayer({
  slot,
  occasion,
  ctx,
}: {
  slot: Slot;
  occasion: ActiveId | null;
  ctx: Omit<OccasionContext, 'tSec' | 'manifest' | 'assetBase'>;
}) {
  const [loaded, setLoaded] = useState<{ id: ActiveId; data: LoadedOccasion } | null>(null);
  const tSec = useSyncExternalStore(clock.subscribe, clock.snapshot, () => 0);

  useEffect(() => {
    if (!occasion) return;
    let alive = true;
    loadOccasion(occasion)
      .then((data) => alive && setLoaded({ id: occasion, data }))
      .catch(() => {
        // A missing or broken occasion leaves the plain scene as it is.
      });
    return () => {
      alive = false;
    };
  }, [occasion]);

  if (!occasion || !loaded || loaded.id !== occasion) return null;
  return loaded.data.module.render(slot, {
    ...ctx,
    tSec,
    manifest: loaded.data.manifest,
    assetBase: loaded.data.assetBase,
  });
}
