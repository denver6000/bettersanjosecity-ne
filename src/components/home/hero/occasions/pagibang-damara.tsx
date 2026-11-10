// Pagibang Damara (the harvest thanksgiving): rice sheaves stacked along the dike, woven baskets at the
// front edge, and a carabao pulling a little cart of sacks, very slowly, along the dike. The date is
// unconfirmed with the city government.
import { ANCHORS } from './anchors';
import { Carabao, crawl } from './carabao';
import type { OccasionContext, OccasionModule, Slot } from './types';

const [ax, ay] = ANCHORS.dikeLineStart;
const [bx, by] = ANCHORS.dikeLineEnd;
const dike = (t: number): [number, number] => [ax + (bx - ax) * t, ay + (by - ay) * t];

function Sheaf({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(1.2)`} filter="url(#hero-tint)">
      <polygon points="-14,0 14,0 7,-34 -7,-34" fill="#e0a526" />
      <polygon points="-8,0 8,0 0,-44" fill="#f2c14b" />
      <rect x={-11} y={-16} width={22} height={4} fill="#8a5a2b" />
    </g>
  );
}

function Basket({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(1.3)`} filter="url(#hero-tint)">
      <ellipse cx={0} cy={0} rx={22} ry={7} fill="#6b4a2b" />
      <path d="M-22,0 L-17,-22 L17,-22 L22,0 Z" fill="#a8763e" />
      <ellipse cx={0} cy={-22} rx={17} ry={5} fill="#e0a526" />
      <path d="M-18,-12 H18 M-20,-5 H20" stroke="#7a5524" strokeWidth={2} />
    </g>
  );
}

function Cart({ ctx }: { ctx: OccasionContext }) {
  const { dx, fade } = crawl(ctx.reduced ? 0 : ctx.tSec, 5, 520);
  const x = ANCHORS.paddyMidLeft[0] - 20 + dx;
  const y = ANCHORS.paddyMidLeft[1];
  const t = ctx.reduced ? 0 : ctx.tSec;
  return (
    <g transform={`translate(${x} ${y}) scale(0.95)`} opacity={fade}>
      <g transform="translate(-130 0)" filter="url(#hero-tint)">
        <line x1={-4} y1={-44} x2={60} y2={-56} stroke="#6b4a2b" strokeWidth={4} />
        <rect x={-70} y={-62} width={78} height={26} fill="#8a5a2b" />
        <ellipse cx={-52} cy={-70} rx={14} ry={11} fill="#efe2bd" />
        <ellipse cx={-26} cy={-72} rx={14} ry={12} fill="#e6d4a6" />
        <ellipse cx={-2} cy={-69} rx={12} ry={10} fill="#efe2bd" />
        <g transform="translate(-36 -22)">
          <circle r={22} fill="#6b4a2b" />
          <circle r={14} fill="#a8763e" />
          <circle r={3} fill="#6b4a2b" />
        </g>
      </g>
      <g transform="translate(0 0)">
        <Carabao tSec={t} walking={ctx.reduced ? 0 : 0.5} headUp={false} />
      </g>
    </g>
  );
}

function render(slot: Slot, ctx: OccasionContext) {
  if (slot !== 'betweenPaddiesAndForeground') return null;
  const sheaves = [0.3, 0.38, 0.5, 0.58].map(dike);
  return (
    <g>
      <Cart ctx={ctx} />
      {sheaves.map(([x, y], i) => (
        <Sheaf key={i} x={x} y={y + 6} />
      ))}
      <Basket x={ANCHORS.foregroundEdge[0] - 70} y={ANCHORS.foregroundEdge[1]} />
      <Basket x={ANCHORS.foregroundEdge[0] + 60} y={ANCHORS.foregroundEdge[1] + 4} />
    </g>
  );
}

const pagibangDamara: OccasionModule = {
  id: 'pagibang-damara',
  tone: 'celebrate',
  assets: [],
  render,
};
export default pagibangDamara;
