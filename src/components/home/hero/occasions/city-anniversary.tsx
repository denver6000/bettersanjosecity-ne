// Araw ng San Jose City: navy, gold and green banderitas from the hut to the small palm and across the
// paddies to a blank banner post on the dike. The date is unconfirmed with the city government.
import { BannerPost, CITY_COLORS, Strands } from './fiesta';
import type { OccasionContext, OccasionModule, Slot } from './types';

function render(slot: Slot, ctx: OccasionContext) {
  if (slot !== 'betweenPaddiesAndForeground') return null;
  return (
    <g>
      <BannerPost ctx={ctx} cloth="#fbf3da" />
      <Strands colors={CITY_COLORS} ctx={ctx} />
    </g>
  );
}

const cityAnniversary: OccasionModule = {
  id: 'city-anniversary',
  tone: 'celebrate',
  assets: [],
  render,
};
export default cityAnniversary;
