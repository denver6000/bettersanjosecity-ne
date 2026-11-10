// New Year: quiet fireworks behind the hills on New Year's Eve evening, a continuous finale in the ten
// minutes after midnight, and a clean gold flare for the first sunrise. Fireworks are flat dots in the
// scene's palette (never a flag). Reduced motion shows no fireworks.
import { newYearPhase } from '@/lib/occasions';
import { clock } from './clock';
import type { OccasionContext, OccasionModule, Slot } from './types';

const COLORS = ['#f2b100', '#ffffff', '#7fb2ff', '#ff9d6e'];
const PER_BURST = 24;
const MAX_PARTICLES = 150;
const LIFE = 1.8;

interface Burst {
  x: number;
  y: number;
  t0: number;
  hue: number;
}

// Live bursts and the schedule live in the module so every render of the slot sees the same state.
let bursts: Burst[] = [];
let nextAuto = 0;

function spawn(x: number, y: number, t0: number) {
  bursts = bursts.filter((b) => t0 - b.t0 < LIFE);
  if ((bursts.length + 1) * PER_BURST > MAX_PARTICLES) return;
  bursts.push({ x, y, t0, hue: Math.floor(Math.random() * COLORS.length) });
}

function render(slot: Slot, ctx: OccasionContext) {
  if (slot !== 'behindHills') return null;
  const phase = newYearPhase(ctx.date, ctx.hour);

  if (phase === 'sunrise') {
    return <circle cx={720} cy={470} r={130} fill="#f9c92a" opacity={0.26} pointerEvents="none" />;
  }
  if (ctx.reduced || (phase !== 'buildup' && phase !== 'midnight')) return null;

  // Quiet bursts now and then on the Eve; a steady finale just after midnight.
  if (ctx.tSec >= nextAuto) {
    spawn(300 + Math.random() * 1100, 150 + Math.random() * 190, ctx.tSec);
    nextAuto =
      ctx.tSec + (phase === 'midnight' ? 0.5 + Math.random() * 0.4 : 20 + Math.random() * 10);
  }

  return (
    <g pointerEvents="none">
      {bursts.map((b, bi) => {
        const age = ctx.tSec - b.t0;
        if (age < 0 || age >= LIFE) return null;
        return Array.from({ length: PER_BURST }, (_, i) => {
          const a = (i / PER_BURST) * Math.PI * 2 + bi;
          const speed = 90 + (i % 3) * 45;
          return (
            <circle
              key={`${bi}-${i}`}
              cx={b.x + Math.cos(a) * speed * age}
              cy={b.y + Math.sin(a) * speed * age + 70 * age * age}
              r={5 * (1 - age / (LIFE + 0.4))}
              fill={COLORS[(b.hue + i) % COLORS.length]}
              opacity={1 - age / LIFE}
            />
          );
        });
      })}
    </g>
  );
}

const newYear: OccasionModule = {
  id: 'new-year',
  tone: 'celebrate',
  assets: [],
  render,
  pokes: {
    // A click in the sky sets off one firework where you clicked (kept above the ridge).
    sky: ({ x, y }) => spawn(x, Math.min(y, 420), clock.snapshot()),
  },
};
export default newYear;
