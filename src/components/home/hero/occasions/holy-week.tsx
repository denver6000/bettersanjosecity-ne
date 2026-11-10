// Holy Week: the whole scene wears a muted violet-grey (a little deeper on Good Friday), a plain
// wooden cross stands on the ridge and a woven palm-leaf palaspas hangs at the hut's left eave.
// Nothing is playful: no pokes, and the sway is half speed.
import { windSway } from '@/lib/hero-light';
import { easterSunday } from '@/lib/occasions';
import { ANCHORS } from './anchors';
import type { OccasionContext, OccasionModule, Slot } from './types';

const isGoodFriday = ({ year, month, day }: OccasionContext['date']) => {
  const e = easterSunday(year);
  return Date.UTC(year, month - 1, day) === Date.UTC(year, e.month - 1, e.day) - 2 * 864e5;
};

function Cross() {
  const [x, y] = ANCHORS.ridgeCross;
  // The foot sits behind the paddies layer, so only the upright and arm show above the ridge.
  return (
    <g filter="url(#hero-tint)">
      <rect x={x - 6} y={y - 96} width={12} height={110} fill="#6b4a2b" />
      <rect x={x - 34} y={y - 70} width={68} height={11} fill="#6b4a2b" />
    </g>
  );
}

function Palaspas({ ctx }: { ctx: OccasionContext }) {
  const [x, y] = ANCHORS.hutEaveLeft;
  const sway = ctx.reduced ? 0 : windSway(ctx.windKmh, ctx.tSec * 0.5, 3) * 0.6;
  const leaf = (angle: number, len: number, fill: string) => (
    <polygon
      key={`${angle}-${len}`}
      points={`-5,0 5,0 0,${len}`}
      transform={`rotate(${angle})`}
      fill={fill}
    />
  );
  return (
    <g transform={`translate(${x + 20} ${y + 4}) rotate(${sway.toFixed(2)}) scale(1.6)`}>
      <g filter="url(#hero-tint)">
        <line x1={0} y1={-4} x2={0} y2={10} stroke="#3a3a3a" strokeWidth={2} />
        {[-32, -16, 0, 16, 32].map((a, i) => leaf(a, 54 - Math.abs(a) * 0.4 + i, '#7bb661'))}
        {[-24, -8, 8, 24].map((a) => leaf(a, 40, '#4f8f3c'))}
        <circle cx={0} cy={12} r={5} fill="#c98a00" />
      </g>
    </g>
  );
}

function render(slot: Slot, ctx: OccasionContext) {
  if (slot === 'betweenHillsAndPaddies') return <Cross />;
  if (slot === 'betweenPaddiesAndForeground') return <Palaspas ctx={ctx} />;
  if (slot === 'frontOfForeground') {
    return (
      <rect
        width={1586}
        height={992}
        fill="#4a3a5c"
        opacity={isGoodFriday(ctx.date) ? 0.34 : 0.26}
        pointerEvents="none"
      />
    );
  }
  return null;
}

const holyWeek: OccasionModule = { id: 'holy-week', tone: 'remember', assets: [], render };
export default holyWeek;
