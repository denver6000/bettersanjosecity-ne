// Shared fiesta dressing: strands of paper banderitas strung between real landmarks, a bamboo post with a
// blank cloth banner (no text, no logo) and bunches of white lilies. Pennants flutter with the real wind;
// a click on a strand makes them flutter hard for a few seconds.
import { windSway } from '@/lib/hero-light';
import { ANCHORS } from './anchors';
import { clock } from './clock';
import type { OccasionContext } from './types';

type Pt = [number, number];

export const CITY_COLORS = ['#1b2f6e', '#f2b100', '#1fa35a'];
export const FIESTA_COLORS = ['#d7263d', '#f2b100', '#1fa35a', '#2b8cff', '#ff8a3d', '#ffffff'];

let kickedAt = -10;

/** One sagging strand; pennants hang from it and flutter. */
export function Strand({
  from,
  to,
  sag,
  colors,
  ctx,
  seed,
}: {
  from: Pt;
  to: Pt;
  sag: number;
  colors: string[];
  ctx: OccasionContext;
  seed: number;
}) {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const n = Math.max(4, Math.round(len / 24));
  const at = (t: number): Pt => [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t + Math.sin(Math.PI * t) * sag,
  ];
  const path = Array.from({ length: 21 }, (_, i) => at(i / 20))
    .map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join('');
  const kick = ctx.tSec - kickedAt < 3 ? Math.exp(-(ctx.tSec - kickedAt) * 0.9) : 0;
  const poke = ctx.pokes;
  return (
    <g
      className={poke ? 'hero-poke' : undefined}
      onClick={poke ? () => (kickedAt = clock.snapshot()) : undefined}
    >
      <g className="hero-poke-in">
        <path d={path} fill="none" stroke="transparent" strokeWidth={30} />
        <g filter="url(#hero-tint)">
          <path d={path} fill="none" stroke="#3a3a3a" strokeWidth={2.2} />
          {Array.from({ length: n }, (_, i) => {
            const [px, py] = at((i + 0.5) / n);
            const swing = ctx.reduced
              ? 0
              : windSway(ctx.windKmh, ctx.tSec, i * 0.8 + seed) * 0.6 +
                kick * 22 * Math.sin(ctx.tSec * 9 + i * 1.3);
            return (
              <polygon
                key={i}
                points={`${px - 10},${py} ${px + 10},${py} ${px},${py + 28}`}
                transform={`rotate(${swing.toFixed(2)} ${px} ${py})`}
                fill={colors[i % colors.length]}
                stroke={colors[i % colors.length] === '#ffffff' ? '#c9c9c9' : 'none'}
                strokeWidth={1.2}
              />
            );
          })}
        </g>
      </g>
    </g>
  );
}

/** A bamboo post on the dike; strands tie to its top. */
export const BANNER_POST: { x: number; top: number; base: number } = (() => {
  const [ax, ay] = ANCHORS.dikeLineStart;
  const [bx, by] = ANCHORS.dikeLineEnd;
  const t = 0.82;
  const x = ax + (bx - ax) * t;
  const y = ay + (by - ay) * t;
  return { x, top: y - 190, base: y + 18 };
})();

export function BannerPost({ ctx, cloth }: { ctx: OccasionContext; cloth: string }) {
  const { x, top, base } = BANNER_POST;
  const sway = ctx.reduced ? 0 : windSway(ctx.windKmh, ctx.tSec, 5) * 0.5;
  return (
    <g filter="url(#hero-tint)">
      <line
        x1={x}
        y1={top}
        x2={x}
        y2={base}
        stroke="#7a5a2e"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <g transform={`translate(${x + 3} ${top + 12}) rotate(${sway.toFixed(2)})`}>
        <rect width={92} height={58} fill={cloth} />
        <rect width={92} height={5} fill="#f2b100" />
        <rect y={53} width={92} height={5} fill="#f2b100" />
      </g>
    </g>
  );
}

export function Lilies({ x, y }: { x: number; y: number }) {
  const heads: Pt[] = [
    [-11, -26],
    [2, -34],
    [13, -24],
    [-3, -18],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(1.3)`} filter="url(#hero-tint)">
      {heads.map(([dx, dy], i) => (
        <line key={i} x1={dx} y1={dy} x2={0} y2={0} stroke="#3f7d3a" strokeWidth={3} />
      ))}
      {heads.map(([dx, dy], i) => (
        <g key={i} transform={`translate(${dx} ${dy})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cy={-6}
              rx={3.6}
              ry={7}
              transform={`rotate(${a})`}
              fill="#ffffff"
              stroke="#d6d6d6"
              strokeWidth={0.7}
            />
          ))}
          <circle r={2.4} fill="#f2b100" />
        </g>
      ))}
    </g>
  );
}

/** The strands every fiesta shares: hut eave to the small palm, and the banner post to the hut and dike. */
export function Strands({ colors, ctx }: { colors: string[]; ctx: OccasionContext }) {
  const palm: Pt = [ANCHORS.palmSmallCrown[0] + 6, ANCHORS.palmSmallCrown[1] + 24];
  const post: Pt = [BANNER_POST.x, BANNER_POST.top + 6];
  const far: Pt = [ANCHORS.dikeLineStart[0] + 40, ANCHORS.dikeLineStart[1] - 120];
  return (
    <>
      <Strand from={ANCHORS.hutEaveRight} to={palm} sag={22} colors={colors} ctx={ctx} seed={0} />
      <Strand from={post} to={ANCHORS.hutEaveLeft} sag={34} colors={colors} ctx={ctx} seed={2} />
      <Strand from={post} to={far} sag={30} colors={colors} ctx={ctx} seed={4} />
    </>
  );
}
