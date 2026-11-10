// Independence Day: a bamboo flagpole on the dike with the Philippine flag, raised at 8:00 on 12 Jun
// (up all day on 10 and 11 Jun), plain blue, red and white pennant bunting strung to the hut, and
// fireworks on click. The flag is drawn to the national design (blue over red, a white triangle at
// the hoist with an eight-rayed gold sun and a gold star at each point) and appears ONLY on the pole:
// never as bunting, a banner or inside fireworks.
import { windSway } from '@/lib/hero-light';
import { raiseEase } from '@/lib/hero-motion';
import { flagProgress } from '@/lib/occasions';
import { ANCHORS } from './anchors';
import { clock } from './clock';
import { createFireworks } from './fireworks';
import { BLUE, Flag, FlagPole, H, POLE, RED, type Pt } from './flag';
import type { OccasionContext, OccasionModule, Slot } from './types';

const fireworks = createFireworks(['#f2b100', '#ffffff', '#0038a8', '#ce1126']);

/** Plain pennants (never the flag) hung from a sagging line. */
function bunting(from: Pt, to: Pt, sag: number, ctx: OccasionContext) {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const n = Math.max(4, Math.round(len / 26));
  const at = (t: number): Pt => [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t + Math.sin(Math.PI * t) * sag,
  ];
  const path = Array.from({ length: 21 }, (_, i) => at(i / 20))
    .map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join('');
  const colors = [BLUE, '#ffffff', RED];
  return (
    <g filter="url(#hero-tint)">
      <path d={path} fill="none" stroke="#3a3a3a" strokeWidth={2.4} />
      {Array.from({ length: n }, (_, i) => {
        const [px, py] = at((i + 0.5) / n);
        const swing = ctx.reduced ? 0 : windSway(ctx.windKmh, ctx.tSec, i * 0.9) * 0.5;
        const white = colors[i % 3] === '#ffffff';
        return (
          <polygon
            key={i}
            points={`${px - 13},${py} ${px + 13},${py} ${px},${py + 36}`}
            transform={`rotate(${swing.toFixed(2)} ${px} ${py})`}
            fill={colors[i % 3]}
            stroke={white ? '#c9c9c9' : 'none'}
            strokeWidth={1.5}
          />
        );
      })}
    </g>
  );
}

// The raise eases up over two minutes and never comes back down while the page stays open, so the
// 30-second hour tick and the sun time-lapse cannot make it jump or vanish.
let shown = 0;
let shownDay = '';
let lastT = 0;
function raised(ctx: OccasionContext): number {
  const day = `${ctx.date.year}-${ctx.date.month}-${ctx.date.day}`;
  const target = flagProgress(ctx.date, ctx.hour);
  const dt = Math.max(0, Math.min(5, ctx.tSec - lastT));
  lastT = ctx.tSec;
  if (day !== shownDay) {
    shownDay = day;
    shown = target;
  } else {
    shown = raiseEase(shown, target, dt);
  }
  return shown;
}

function render(slot: Slot, ctx: OccasionContext) {
  // Fireworks burst in the sky behind the hills, never over the hut, palms or rice.
  if (slot === 'behindHills') return ctx.reduced ? null : fireworks.render(ctx.tSec);
  if (slot !== 'betweenPaddiesAndForeground') return null;

  const progress = raised(ctx);
  const top = POLE.top + 8;
  const flagY = POLE.base - H - 20 - (POLE.base - H - 20 - top) * progress;
  return (
    <g>
      <FlagPole />
      {bunting([POLE.x, POLE.top + 8], ANCHORS.hutEaveLeft, 26, ctx)}
      {progress > 0 && <Flag ctx={ctx} y={flagY} />}
    </g>
  );
}

const independence: OccasionModule = {
  id: 'independence',
  tone: 'celebrate',
  assets: [],
  render,
  pokes: {
    // Fireworks in gold, white, blue and red dots; they start in the sky above the ridge.
    sky: ({ x, y }) => fireworks.spawn(x, Math.min(y, 420), clock.snapshot()),
  },
};
export default independence;
