// New Year: quiet fireworks behind the hills on New Year's Eve evening, a continuous finale in the ten
// minutes after midnight, and a clean gold flare for the first sunrise. Fireworks are flat dots in the
// scene's palette (never a flag). Reduced motion shows no fireworks.
import { newYearPhase } from '@/lib/occasions';
import { clock } from './clock';
import { createFireworks } from './fireworks';
import type { OccasionContext, OccasionModule, Slot } from './types';

const fireworks = createFireworks(['#f2b100', '#ffffff', '#7fb2ff', '#ff9d6e']);
let nextAuto = 0;

function render(slot: Slot, ctx: OccasionContext) {
  if (slot !== 'behindHills') return null;
  const phase = newYearPhase(ctx.date, ctx.hour);

  if (phase === 'sunrise') {
    return <circle cx={720} cy={470} r={130} fill="#f9c92a" opacity={0.26} pointerEvents="none" />;
  }
  if (ctx.reduced || (phase !== 'buildup' && phase !== 'midnight')) return null;

  // Quiet bursts now and then on the Eve; a steady finale just after midnight.
  if (ctx.tSec >= nextAuto) {
    fireworks.spawn(300 + Math.random() * 1100, 150 + Math.random() * 190, ctx.tSec);
    nextAuto =
      ctx.tSec + (phase === 'midnight' ? 0.5 + Math.random() * 0.4 : 20 + Math.random() * 10);
  }
  return fireworks.render(ctx.tSec);
}

const newYear: OccasionModule = {
  id: 'new-year',
  tone: 'celebrate',
  assets: [],
  render,
  pokes: {
    // A click in the sky sets off one firework where you clicked (kept above the ridge).
    sky: ({ x, y }) => fireworks.spawn(x, Math.min(y, 420), clock.snapshot()),
  },
};
export default newYear;
