// Labor Day: a farmer in a salakot ploughing a paddy behind a carabao, drawn small in mid-ground so it
// reads as part of the land. They plod slowly; a click on the carabao makes it lift its head and the
// farmer pause for two seconds (only where pokes are allowed).
import { ANCHORS } from './anchors';
import { crawl } from '@/lib/hero-motion';
import { Carabao } from './carabao';
import { clock } from './clock';
import type { OccasionContext, OccasionModule, Slot } from './types';

let raisedAt: number | null = null;
let closedPause = 0; // seconds of finished pauses, so the walk resumes where it stopped

function Farmer({ tSec, walking }: { tSec: number; walking: number }) {
  const step = Math.sin(tSec * 2.4) * 6 * walking;
  return (
    <g filter="url(#hero-tint)">
      <rect x={-5 + step * 0.3} y={-28} width={8} height={28} fill="#3a4a63" />
      <rect x={-12 - step * 0.3} y={-28} width={8} height={28} fill="#2c3a4f" />
      <rect x={-12} y={-62} width={20} height={36} rx={4} fill="#c9503e" />
      <circle cx={-2} cy={-72} r={9} fill="#c68642" />
      <polygon points="-24,-76 -2,-100 20,-76" fill="#d9b45a" />
      <path d="M6,-52 L40,-36" stroke="#c9503e" strokeWidth={6} strokeLinecap="round" />
      <path d="M40,-36 L48,-4" stroke="#6b4a2b" strokeWidth={5} />
      <polygon points="44,-4 66,-2 50,6" fill="#3f484f" />
    </g>
  );
}

function render(slot: Slot, ctx: OccasionContext) {
  if (slot !== 'betweenPaddiesAndForeground') return null;
  const t = ctx.reduced ? 0 : ctx.tSec;
  const sincePoke = raisedAt === null ? Infinity : ctx.tSec - raisedAt;
  const resting = sincePoke < 2;
  const { dx, fade } = crawl(
    t - closedPause - Math.min(2, Math.max(0, sincePoke)),
    4,
    420,
    ctx.reduced
  );
  const x = ANCHORS.paddyMidLeft[0] + 40 + dx;
  const y = ANCHORS.paddyMidLeft[1] + 10;
  const walking = resting || ctx.reduced ? 0 : 0.5;
  const poke = ctx.pokes;
  return (
    <g transform={`translate(${x} ${y}) scale(0.95)`} opacity={fade}>
      <g transform="translate(-190 0)">
        <Farmer tSec={t} walking={walking} />
      </g>
      <line x1={-124} y1={-30} x2={-48} y2={-52} stroke="#6b4a2b" strokeWidth={3} />
      <g
        className={poke ? 'hero-poke' : undefined}
        onClick={
          poke
            ? () => {
                const now = clock.snapshot();
                if (raisedAt !== null) closedPause += Math.min(2, now - raisedAt);
                raisedAt = now;
              }
            : undefined
        }
      >
        <g className="hero-poke-in">
          <rect x={-70} y={-110} width={150} height={120} fill="transparent" />
          <Carabao tSec={t} walking={walking} headUp={resting} />
        </g>
      </g>
    </g>
  );
}

const laborDay: OccasionModule = { id: 'labor-day', tone: 'celebrate', assets: [], render };
export default laborDay;
