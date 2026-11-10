// Undas: votive candles in glass jars on the hut steps and along the dike, with white and yellow
// chrysanthemums. Flames are flat gold ellipses with a gentle flicker, lit from dusk and still burning
// in rain (a flame is drawn above the rain, so it never gets drawn in front of it by accident).
import { lampOpacity } from '@/lib/hero-light';
import { ANCHORS } from './anchors';
import type { OccasionContext, OccasionModule, Slot } from './types';

const [sx, sy] = ANCHORS.hutSteps;
const [ax, ay] = ANCHORS.dikeLineStart;
const [bx, by] = ANCHORS.dikeLineEnd;
const dike = (t: number): [number, number] => [ax + (bx - ax) * t, ay + (by - ay) * t - 4];

// x, y of the jar foot, jar height.
const CANDLES: [number, number, number][] = [
  [sx - 26, sy, 34],
  [sx + 4, sy + 6, 46],
  [sx + 34, sy, 28],
  ...[0.55, 0.68, 0.8, 0.93].map((t, i): [number, number, number] => {
    const [x, y] = dike(t);
    return [x, y, [30, 42, 34, 26][i]];
  }),
];
const FLOWERS: [number, number][] = [
  [sx - 46, sy + 4],
  [sx + 54, sy + 4],
  ...[0.5, 0.74, 0.88].map((t): [number, number] => dike(t)),
];

function Candle({
  x,
  y,
  h,
  i,
  ctx,
}: {
  x: number;
  y: number;
  h: number;
  i: number;
  ctx: OccasionContext;
}) {
  const lamp = lampOpacity(ctx.night, ctx.weatherGrey);
  const flick = ctx.reduced ? 1 : 0.88 + 0.12 * Math.sin(ctx.tSec * 5 + i * 1.9);
  return (
    <g transform={`translate(${x} ${y}) scale(1.4)`}>
      <g filter="url(#hero-tint)">
        <rect x={-9} y={-h} width={18} height={h} rx={3} fill="#e9f0f2" opacity={0.85} />
        <rect x={-6} y={-h * 0.62} width={12} height={h * 0.62} fill="#f4ead2" />
      </g>
      <circle
        cy={-h * 0.62 - 14}
        r={26}
        fill="#ffd25a"
        opacity={0.22 * lamp}
        pointerEvents="none"
      />
      <ellipse
        cy={-h * 0.62 - 9}
        rx={4.5 * flick}
        ry={9 * flick}
        fill="#ffc933"
        opacity={0.15 + 0.85 * lamp}
        pointerEvents="none"
      />
    </g>
  );
}

function Flowers({ x, y }: { x: number; y: number }) {
  const heads: [number, number, string][] = [
    [-12, -22, '#ffffff'],
    [0, -30, '#f4c430'],
    [12, -20, '#ffffff'],
    [-4, -14, '#f4c430'],
    [8, -12, '#ffffff'],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(1.4)`} filter="url(#hero-tint)">
      {heads.map(([dx, dy], i) => (
        <line key={i} x1={dx} y1={dy} x2={0} y2={0} stroke="#3f7d3a" strokeWidth={3} />
      ))}
      {heads.map(([dx, dy, fill], i) => (
        <g key={i} transform={`translate(${dx} ${dy})`}>
          <circle r={9} fill={fill} stroke="#d9d9d9" strokeWidth={0.8} />
          <circle r={3.5} fill={fill === '#ffffff' ? '#f4c430' : '#c98a00'} />
        </g>
      ))}
    </g>
  );
}

function render(slot: Slot, ctx: OccasionContext) {
  if (slot !== 'betweenPaddiesAndForeground') return null;
  return (
    <g>
      {FLOWERS.map(([x, y], i) => (
        <Flowers key={i} x={x} y={y} />
      ))}
      {CANDLES.map(([x, y, h], i) => (
        <Candle key={i} x={x} y={y} h={h} i={i} ctx={ctx} />
      ))}
    </g>
  );
}

const undas: OccasionModule = { id: 'undas', tone: 'remember', assets: [], render };
export default undas;
