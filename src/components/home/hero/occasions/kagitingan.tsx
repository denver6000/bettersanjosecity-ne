// Araw ng Kagitingan: one flag on the dike pole, up and waving gently. Nothing else: no bunting, no
// pokes, no fireworks. The flag is the same code-drawn one as on Independence Day.
import { Flag, FlagPole, POLE } from './flag';
import type { OccasionModule, Slot } from './types';

function render(slot: Slot, ctx: Parameters<OccasionModule['render']>[1]) {
  if (slot !== 'betweenPaddiesAndForeground') return null;
  // Calmer air than a celebration: half the wind drives the cloth.
  const gentle = { ...ctx, windKmh: ctx.windKmh * 0.5 };
  return (
    <g>
      <FlagPole />
      <Flag ctx={gentle} y={POLE.top + 8} />
    </g>
  );
}

const kagitingan: OccasionModule = { id: 'kagitingan', tone: 'remember', assets: [], render };
export default kagitingan;
