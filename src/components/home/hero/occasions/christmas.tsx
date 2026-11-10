// Christmas: parols hung from the hut and palms and on a bamboo pole at the dike, string lights along
// the roof and eaves, and on Christmas Eve a star over the ridge. Everything is code-drawn in the
// scene's flat style and anchored to named landmarks; parols sway with the real wind and light up
// with the night (and stay lit in rain).
import { lampOpacity, windSway } from '@/lib/hero-light';
import { christmasMoment } from '@/lib/occasions';
import { ANCHORS } from './anchors';
import { clock } from './clock';
import type { OccasionContext, OccasionModule, Slot } from './types';

const PALETTE = {
  red: { main: '#d7263d', shade: '#a31527', accent: '#ffd166' },
  gold: { main: '#f2b100', shade: '#c98a00', accent: '#fff3b0' },
  green: { main: '#1fa35a', shade: '#14753f', accent: '#ffe58a' },
} as const;
type Color = keyof typeof PALETTE;

// A bamboo pole on the dike with an arm; a parol hangs from the arm's end, clear of the pole.
const POLE = {
  x: ANCHORS.dikeFlagpole[0] - 100,
  top: ANCHORS.dikeFlagpole[1] - 140,
  base: ANCHORS.dikeFlagpole[1] + 105,
  armTo: ANCHORS.dikeFlagpole[0] - 10,
};

// Where each parol hangs: a landmark, a size (star radius) and a colour.
const PAROLS: { x: number; y: number; r: number; color: Color }[] = [
  { x: ANCHORS.hutEaveLeft[0] + 22, y: ANCHORS.hutEaveLeft[1] + 6, r: 40, color: 'gold' },
  { x: ANCHORS.hutEaveRight[0] - 22, y: ANCHORS.hutEaveRight[1] + 6, r: 52, color: 'red' },
  { x: ANCHORS.palmSmallCrown[0] - 52, y: ANCHORS.palmSmallCrown[1] + 14, r: 40, color: 'green' },
  { x: ANCHORS.palmBigCrown[0] - 62, y: ANCHORS.palmBigCrown[1] + 56, r: 52, color: 'gold' },
  { x: POLE.armTo, y: POLE.top + 4, r: 62, color: 'red' },
];
const BULBS = ['#e02b3c', '#f2b100', '#1fa35a', '#2b8cff'];

// A parol that was just clicked swings hard for a moment.
const kicks = new Map<number, number>();

function starPoints(cx: number, cy: number, R: number, r: number): string {
  const p: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const q = i % 2 ? r : R;
    p.push(`${(cx + q * Math.cos(a)).toFixed(1)},${(cy + q * Math.sin(a)).toFixed(1)}`);
  }
  return p.join(' ');
}

function Parol({
  index,
  def,
  ctx,
  lamp,
}: {
  index: number;
  def: (typeof PAROLS)[number];
  ctx: OccasionContext;
  lamp: number;
}) {
  const { x, y, r, color } = def;
  const c = PALETTE[color];
  const cy = 10 + r;
  const k0 = kicks.get(index);
  const kick =
    k0 !== undefined && ctx.tSec - k0 < 3
      ? 26 * Math.exp(-(ctx.tSec - k0) * 1.6) * Math.sin(9 * (ctx.tSec - k0))
      : 0;
  const sway = ctx.reduced ? 0 : windSway(ctx.windKmh, ctx.tSec, index * 1.7) * 0.7;
  const tassel = (dx: number, len: number) =>
    `${dx - r * 0.12},${cy + r} ${dx + r * 0.12},${cy + r} ${dx},${cy + r + len}`;

  return (
    <g
      transform={`translate(${x} ${y}) rotate(${(sway + kick).toFixed(2)})`}
      className={ctx.pokes ? 'hero-poke' : undefined}
      onClick={ctx.pokes ? () => kicks.set(index, clock.snapshot()) : undefined}
    >
      <g className="hero-poke-in">
        <circle cx={0} cy={cy} r={r * 1.35} fill="transparent" />
        <line x1={0} y1={0} x2={0} y2={10} stroke="#3a3a3a" strokeWidth={2} />
        <g filter="url(#hero-tint)">
          <polygon points={tassel(-r * 0.3, r * 0.5)} fill={c.shade} />
          <polygon points={tassel(r * 0.3, r * 0.5)} fill={c.shade} />
          <polygon points={tassel(0, r * 0.75)} fill={c.main} />
          <polygon points={starPoints(0, cy, r, r * 0.42)} fill={c.main} />
          <polygon points={starPoints(0, cy, r * 0.66, r * 0.28)} fill={c.accent} />
          <polygon points={starPoints(0, cy, r * 0.36, r * 0.16)} fill={c.shade} />
        </g>
        <circle
          cx={0}
          cy={cy}
          r={r * 1.3}
          fill="#ffe27a"
          opacity={0.26 * lamp}
          pointerEvents="none"
        />
        <circle
          cx={0}
          cy={cy}
          r={r * 0.2}
          fill="#fff6c8"
          opacity={0.35 + 0.65 * lamp}
          pointerEvents="none"
        />
      </g>
    </g>
  );
}

/** Flat bulbs strung along a sagging line between two points. */
function lights(
  from: [number, number],
  to: [number, number],
  sag: number,
  ctx: OccasionContext,
  lamp: number,
  seed: number
) {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const n = Math.max(3, Math.round(len / 26));
  const at = (t: number): [number, number] => [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t + Math.sin(Math.PI * t) * sag,
  ];
  const path = Array.from({ length: 21 }, (_, i) => at(i / 20))
    .map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join('');
  return (
    <g key={seed}>
      <g filter="url(#hero-tint)">
        <path d={path} fill="none" stroke="#3a3a3a" strokeWidth={2.6} />
      </g>
      {Array.from({ length: n + 1 }, (_, i) => {
        const [bx, by] = at(i / n);
        const twinkle = ctx.reduced ? 1 : 0.82 + 0.18 * Math.sin(ctx.tSec * 3 + i * 1.3 + seed);
        return (
          <circle
            key={i}
            cx={bx}
            cy={by + 3}
            r={7}
            fill={BULBS[(i + seed) % BULBS.length]}
            opacity={(0.5 + 0.5 * lamp) * twinkle}
          />
        );
      })}
    </g>
  );
}

function render(slot: Slot, ctx: OccasionContext) {
  const moment = christmasMoment(ctx.date, ctx.hour);
  const lamp = moment === 'simbang-gabi' ? 1 : lampOpacity(ctx.night, ctx.weatherGrey);

  if (slot === 'behindHills') {
    if (moment !== 'eve') return null;
    const [sx, sy] = [ANCHORS.ridgeCross[0] - 40, ANCHORS.ridgeCross[1] - 170];
    const pulse = ctx.reduced ? 1 : 1 + 0.04 * Math.sin(ctx.tSec * 2);
    return (
      <g
        opacity={Math.max(0.5, ctx.night)}
        transform={`translate(${sx} ${sy}) scale(${pulse})`}
        pointerEvents="none"
      >
        <polygon
          points={`0,-110 12,-12 110,0 12,12 0,110 -12,12 -110,0 -12,-12`}
          fill="#fff3b0"
          opacity={0.55}
        />
        <polygon points={starPoints(0, 0, 58, 24)} fill="#fff3b0" />
        <circle r={10} fill="#ffffff" />
      </g>
    );
  }

  if (slot !== 'betweenPaddiesAndForeground') return null;
  const peak = ANCHORS.hutRoofPeak;
  const eL = ANCHORS.hutEaveLeft;
  const eR = ANCHORS.hutEaveRight;
  return (
    <g>
      {lights(eL, peak, 0, ctx, lamp, 0)}
      {lights(peak, eR, 0, ctx, lamp, 2)}
      {lights([eL[0] + 10, eL[1] + 2], [eR[0] - 10, eR[1] + 2], 16, ctx, lamp, 1)}
      <g filter="url(#hero-tint)">
        <line
          x1={POLE.x}
          y1={POLE.top - 4}
          x2={POLE.x}
          y2={POLE.base}
          stroke="#7a5a2e"
          strokeWidth={7}
          strokeLinecap="round"
        />
        <line
          x1={POLE.x}
          y1={POLE.top}
          x2={POLE.armTo}
          y2={POLE.top}
          stroke="#7a5a2e"
          strokeWidth={5}
          strokeLinecap="round"
        />
        {[0.3, 0.6, 0.85].map((t) => (
          <line
            key={t}
            x1={POLE.x - 5}
            x2={POLE.x + 5}
            y1={POLE.top + (POLE.base - POLE.top) * t}
            y2={POLE.top + (POLE.base - POLE.top) * t}
            stroke="#5a3f1c"
            strokeWidth={2}
          />
        ))}
      </g>
      {moment === 'simbang-gabi' && (
        <circle
          cx={ANCHORS.hutWindow[0]}
          cy={ANCHORS.hutWindow[1]}
          r={16}
          fill="#ffd25a"
          pointerEvents="none"
        />
      )}
      {PAROLS.map((def, i) => (
        <Parol key={i} index={i} def={def} ctx={ctx} lamp={lamp} />
      ))}
    </g>
  );
}

const christmas: OccasionModule = { id: 'christmas', tone: 'celebrate', assets: [], render };
export default christmas;
