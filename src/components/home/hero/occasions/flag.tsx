// The Philippine flag and its bamboo pole, shared by the occasions that fly it. Drawn to the national
// design (blue over red, a white triangle at the hoist with an eight-rayed gold sun and a gold star at
// each point) and used ONLY on the pole: never as bunting, a banner or inside fireworks.
import { ANCHORS } from './anchors';
import type { OccasionContext } from './types';

export const BLUE = '#0038a8';
export const RED = '#ce1126';
const GOLD = '#fcd116';

export const H = 76; // flag height; the width is twice that
const W = 2 * H;
const APEX = (H * Math.sqrt(3)) / 2; // the white triangle is equilateral with side H

export const POLE = {
  x: ANCHORS.dikeFlagpole[0] - 80,
  top: ANCHORS.dikeFlagpole[1] - 235,
  base: ANCHORS.dikeFlagpole[1] + 95,
};

export type Pt = [number, number];

/** Where a point of the flat flag lands on the waving cloth: calm air lets it hang short and droop. */
function cloth(ctx: OccasionContext) {
  const wind = Math.min(1, ctx.windKmh / 25);
  const t = ctx.reduced ? 0 : ctx.tSec;
  return ([x, y]: Pt): Pt => {
    const along = x / W;
    const wave = Math.sin(along * 9 - t * (2 + 4 * wind));
    return [
      x * (0.62 + 0.38 * wind),
      y + (2.5 + 9 * wind) * along * wave + (1 - wind) * 22 * along,
    ];
  };
}

const pts = (list: Pt[]) => list.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
const line = (from: Pt, to: Pt, n: number): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => [
    from[0] + ((to[0] - from[0]) * i) / n,
    from[1] + ((to[1] - from[1]) * i) / n,
  ]);

function star(cx: number, cy: number, R: number, rot: number): string {
  const p: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = rot + (i * Math.PI) / 5 - Math.PI / 2;
    const q = i % 2 ? R * 0.4 : R;
    p.push(`${(cx + q * Math.cos(a)).toFixed(1)},${(cy + q * Math.sin(a)).toFixed(1)}`);
  }
  return p.join(' ');
}

export function Flag({ ctx, y }: { ctx: OccasionContext; y: number }) {
  const w = cloth(ctx);
  const N = 14;
  const blue = [...line([0, 0], [W, 0], N), ...line([W, H / 2], [0, H / 2], N)].map(w);
  const red = [...line([0, H / 2], [W, H / 2], N), ...line([W, H], [0, H], N)].map(w);
  const white = [
    ...line([0, 0], [APEX, H / 2], 6),
    ...line([APEX, H / 2], [0, H], 6),
    ...line([0, H], [0, 0], 4),
  ].map(w);
  const cx = APEX / 3;
  const sun = w([cx, H / 2]);
  const R = H * 0.2;
  const corners: [Pt, number][] = [
    [[APEX * 0.14, H * 0.2], -0.9],
    [[APEX * 0.14, H * 0.8], 2.2],
    [[APEX * 0.86, H / 2], 1.57],
  ];
  return (
    <g transform={`translate(${POLE.x + 4} ${y})`}>
      <g filter="url(#hero-tint)">
        <polygon points={pts(blue)} fill={BLUE} />
        <polygon points={pts(red)} fill={RED} />
        <polygon points={pts(white)} fill="#ffffff" />
        <g transform={`translate(${sun[0].toFixed(1)} ${sun[1].toFixed(1)})`} fill={GOLD}>
          <circle r={H * 0.07} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            const ray = (len: number, off: number) => {
              const b = a + off;
              const half = 0.1;
              return `${Math.cos(b - half) * H * 0.09},${Math.sin(b - half) * H * 0.09} ${Math.cos(b) * len},${Math.sin(b) * len} ${Math.cos(b + half) * H * 0.09},${Math.sin(b + half) * H * 0.09}`;
            };
            return (
              <g key={i}>
                <polygon points={ray(R, 0)} />
                <polygon points={ray(R * 0.62, -0.19)} />
                <polygon points={ray(R * 0.62, 0.19)} />
              </g>
            );
          })}
        </g>
        {corners.map(([c, rot], i) => {
          const p = w(c);
          return <polygon key={i} points={star(p[0], p[1], H * 0.085, rot)} fill={GOLD} />;
        })}
      </g>
    </g>
  );
}

/** The bamboo pole with its gold finial; `top` and `base` come from POLE. */
export function FlagPole() {
  return (
    <g filter="url(#hero-tint)">
      <line
        x1={POLE.x}
        y1={POLE.top}
        x2={POLE.x}
        y2={POLE.base}
        stroke="#7a5a2e"
        strokeWidth={8}
        strokeLinecap="round"
      />
      <circle cx={POLE.x} cy={POLE.top - 4} r={8} fill="#c98a00" />
    </g>
  );
}
