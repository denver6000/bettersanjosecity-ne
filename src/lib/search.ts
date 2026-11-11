export type EntryType = 'page' | 'official' | 'office' | 'hotline' | 'service';

export interface SearchEntry {
  type: EntryType;
  /** Title in English and Filipino (names of people and offices are the same in both). */
  en: string;
  fil: string;
  /** Body text and keywords, both languages. */
  extra: string;
  href: string;
  /** Hotline numbers as printed; render each with toTel() for its `tel:` link. */
  tel?: string[];
}

const TYPE_ORDER: EntryType[] = ['page', 'official', 'office', 'hotline', 'service'];

/** Lower case with accents stripped, so "munoz" finds "Muñoz". */
export function normalize(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** Every word must match; entries whose title holds every word come first. */
export function search(entries: SearchEntry[], query: string): SearchEntry[] {
  // Words without a letter or digit are noise; at least one word needs two letters or digits.
  const words = normalize(query)
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w));
  if (!words.some((w) => w.replace(/[^\p{L}\p{N}]/gu, '').length >= 2)) return [];
  const titleHits: SearchEntry[] = [];
  const otherHits: SearchEntry[] = [];
  for (const entry of entries) {
    const title = normalize(`${entry.en} ${entry.fil}`);
    const all = `${title} ${normalize(entry.extra)}`;
    if (!words.every((w) => all.includes(w))) continue;
    (words.every((w) => title.includes(w)) ? titleHits : otherHits).push(entry);
  }
  return [...titleHits, ...otherHits];
}

export function groupByType(results: SearchEntry[], perType = 5): [EntryType, SearchEntry[]][] {
  return TYPE_ORDER.map(
    (type) =>
      [type, results.filter((r) => r.type === type).slice(0, perType)] as [EntryType, SearchEntry[]]
  ).filter(([, list]) => list.length > 0);
}

/** How many results the grouped list actually shows (for the screen-reader count). */
export function shownCount(results: SearchEntry[], perType = 5): number {
  return groupByType(results, perType).reduce((n, [, list]) => n + list.length, 0);
}
