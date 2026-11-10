// Development-only fixture (`/?on=test-pin`): one marker per depth slot, to check slot order, tint,
// lamps and poke wiring before any real occasion exists. Removed in the last task.
import { lampOpacity } from '@/lib/hero-light';
import type { OccasionModule, Slot } from './types';

const SPOTS: Record<Slot, [number, number, string]> = {
  behindHills: [800, 430, '#e02b3c'],
  betweenHillsAndPaddies: [900, 560, '#f2b100'],
  betweenPaddiesAndForeground: [1000, 930, '#1fa35a'],
  frontOfForeground: [1100, 930, '#2b6cff'],
};

const pin: OccasionModule = {
  id: 'test-pin',
  tone: 'celebrate',
  assets: [],
  render(slot, ctx) {
    const [x, y, color] = SPOTS[slot];
    return (
      <g data-pin={slot} filter="url(#hero-tint)" pointerEvents="none">
        <circle cx={x} cy={y} r={46} fill={color} />
        <circle
          cx={x}
          cy={y}
          r={14}
          fill="#ffe27a"
          opacity={lampOpacity(ctx.night, ctx.weatherGrey)}
        />
      </g>
    );
  },
  pokes: {
    sky: () => {
      const d = document.documentElement.dataset;
      d.pinPoked = String(Number(d.pinPoked ?? 0) + 1);
    },
  },
};

export default pin;
