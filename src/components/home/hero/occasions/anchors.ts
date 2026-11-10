import anchors from './anchors.json';

/** Named landmarks of the hero art in scene units (1586 x 992); `npm run hero:overlay` draws them. */
export const ANCHORS = anchors as Record<keyof typeof anchors, [number, number]>;
