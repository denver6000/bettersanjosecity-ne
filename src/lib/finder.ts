// Intents for the home page "I need to…" finder. Pure, no imports, so Node can test it.
// To add one: add a line here and its two translation keys (`finder-<id>`, `finder-<id>-t`) in en and fil.

export interface Intent {
  id: string;
  icon: string; // Phosphor class, written out in full so the icon subset picks it up
  key: string; // translation key: the phrase that finishes "I need to …"
  titleKey: string; // translation key: the result card headline
  href?: string; // an existing page; omitted when the service is not online yet
  soon?: boolean;
}

const page = (id: string, icon: string, href: string): Intent => ({
  id,
  icon,
  key: `finder-${id}`,
  titleKey: `finder-${id}-t`,
  href,
});
const soon = (id: string, icon: string): Intent => ({
  id,
  icon,
  key: `finder-${id}`,
  titleKey: `finder-${id}-t`,
  soon: true,
});

export const INTENTS: Intent[] = [
  page('business-tax', 'ph-storefront', '/business-taxes'),
  page('tax-estimate', 'ph-calculator', '/business-taxes/estimator'),
  page('scholarship', 'ph-graduation-cap', '/scholarship'),
  page('news', 'ph-newspaper', '/news'),
  page('budget', 'ph-coins', '/budget'),
  page('numbers', 'ph-chart-bar', '/statistics'),
  page('ordinances', 'ph-scroll', '/legislative'),
  page('officials', 'ph-buildings', '/government'),
  soon('certificate', 'ph-file-text'),
  soon('welfare', 'ph-hand-heart'),
  soon('farming', 'ph-plant'),
  page('city-hall', 'ph-phone', '/contact'),
];

export function resolveIntent(id: string): Intent | undefined {
  return INTENTS.find((i) => i.id === id);
}

/** Where the card's button goes: the page, or City Hall's contact page when there is none yet. */
export function destination(intent: Intent): string {
  return intent.href ?? '/contact';
}
