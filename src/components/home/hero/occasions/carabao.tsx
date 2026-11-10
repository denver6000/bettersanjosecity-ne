// A carabao (water buffalo) in flat profile, facing right, feet at y = 0. Shared by the two work-day
// occasions. Legs swing in pairs; `walking` 0 stands still, `headUp` lifts the head.
const BODY = '#5a646e';
const DARK = '#3f484f';
const HORN = '#ddd5c0';

export function Carabao({
  tSec,
  walking,
  headUp,
}: {
  tSec: number;
  walking: number;
  headUp: boolean;
}) {
  const swing = (phase: number) => Math.sin(tSec * 2.4 + phase) * 9 * walking;
  const bob = Math.sin(tSec * 4.8) * 1.2 * walking;
  const leg = (x: number, phase: number, fill: string) => (
    <g transform={`translate(${x} -34) rotate(${swing(phase).toFixed(1)})`}>
      <rect x={-5} y={0} width={10} height={34} rx={3} fill={fill} />
      <rect x={-5} y={30} width={10} height={5} fill="#2c3338" />
    </g>
  );
  const head = headUp ? -28 : 8;
  return (
    <g filter="url(#hero-tint)">
      {leg(-34, 0, DARK)}
      {leg(30, Math.PI, DARK)}
      <g transform={`translate(0 ${bob.toFixed(1)})`}>
        <path d="M-52,-42 Q-58,-30 -60,-4 L-56,-4 Q-52,-26 -46,-36 Z" fill={DARK} />
        <ellipse cx={0} cy={-52} rx={56} ry={26} fill={BODY} />
        <ellipse cx={34} cy={-46} rx={22} ry={22} fill={BODY} />
        <g transform={`translate(52 ${-52 + head}) rotate(${headUp ? -30 : 24})`}>
          <ellipse cx={14} cy={4} rx={20} ry={11} fill={BODY} />
          <ellipse cx={30} cy={7} rx={9} ry={7} fill={DARK} />
          <path d="M2,-4 Q-14,-22 -2,-34 Q2,-24 10,-8 Z" fill={HORN} />
          <circle cx={18} cy={-1} r={2} fill="#1d2226" />
        </g>
      </g>
      {leg(-20, Math.PI, BODY)}
      {leg(44, 0, BODY)}
    </g>
  );
}

/** Slow one-way travel that wraps: the figure slips in and out at the ends. */
export function crawl(tSec: number, speed: number, span: number): { dx: number; fade: number } {
  const p = (tSec * speed) % span;
  const edge = Math.min(p, span - p);
  return { dx: p, fade: Math.min(1, edge / 40) };
}
