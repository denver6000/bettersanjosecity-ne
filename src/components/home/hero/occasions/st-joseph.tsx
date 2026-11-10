// Fiesta of St. Joseph: many-colour banderitas, a blank banner post and white lilies (his flower) at the
// hut steps and along the dike. The feast date (19 Mar) is unconfirmed with the city government.
import { ANCHORS } from './anchors';
import { BannerPost, FIESTA_COLORS, Lilies, Strands } from './fiesta';
import type { OccasionContext, OccasionModule, Slot } from './types';

const [sx, sy] = ANCHORS.hutSteps;
const [ax, ay] = ANCHORS.dikeLineStart;
const [bx, by] = ANCHORS.dikeLineEnd;
const dike = (t: number): [number, number] => [ax + (bx - ax) * t, ay + (by - ay) * t - 2];
const LILIES: [number, number][] = [
  [sx - 40, sy + 4],
  [sx + 52, sy + 4],
  dike(0.45),
  dike(0.62),
  dike(0.92),
];

function render(slot: Slot, ctx: OccasionContext) {
  if (slot !== 'betweenPaddiesAndForeground') return null;
  return (
    <g>
      <BannerPost ctx={ctx} cloth="#ffffff" />
      <Strands colors={FIESTA_COLORS} ctx={ctx} />
      {LILIES.map(([x, y], i) => (
        <Lilies key={i} x={x} y={y} />
      ))}
    </g>
  );
}

const stJoseph: OccasionModule = { id: 'st-joseph', tone: 'celebrate', assets: [], render };
export default stJoseph;
