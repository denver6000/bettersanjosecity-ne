/**
 * PSIC (Philippine Standard Industrial Classification) lookup for the tax estimator.
 *
 * src/data/psic.json is generated from PSA's workbook by scripts/psic-to-json.py,
 * so the site never calls PSA at runtime and needs no API token.
 */
import data from '@/data/psic.json';
import { normalize } from '@/lib/tax-format';

export interface Activity {
  /** Five-digit sub-class code, as printed. */
  code: string;
  title: string;
  classCode: string;
  groupCode: string;
  divisionCode: string;
  section: string;
}

export const PSIC_SOURCE = { edition: data.edition, released: data.released };

const sections = data.sections as Record<string, string>;
const divisions = data.divisions as unknown as Record<string, [title: string, section: string]>;
const groups = data.groups as Record<string, string>;
const classes = data.classes as Record<string, string>;

export const activities: Activity[] = (data.subClasses as [string, string, string][]).map(
  ([code, title, classCode]) => ({
    code,
    title,
    classCode,
    groupCode: classCode.slice(0, 3),
    divisionCode: classCode.slice(0, 2),
    section: divisions[classCode.slice(0, 2)][1],
  })
);

const byCode = new Map(activities.map((a) => [a.code, a]));

export const findActivity = (code: string | null | undefined) =>
  code ? byCode.get(code) : undefined;

/** Section down to class, for the breadcrumb under a selected activity. */
export function lineage(a: Activity) {
  return [
    { level: 'Section', code: a.section, title: sections[a.section] },
    { level: 'Division', code: a.divisionCode, title: divisions[a.divisionCode][0] },
    { level: 'Group', code: a.groupCode, title: groups[a.groupCode] },
    { level: 'Class', code: a.classCode, title: classes[a.classCode] },
  ];
}

/** Common businesses in the city, offered before the visitor types anything. */
export const QUICK_PICKS = [
  { code: '47113', label: 'Sari-sari store' },
  { code: '56105', label: 'Carinderia' },
  { code: '10611', label: 'Rice mill' },
  { code: '47731', label: 'Agri supply' },
  { code: '47721', label: 'Pharmacy' },
  { code: '47521', label: 'Hardware' },
  { code: '96212', label: 'Barbershop' },
  { code: '55901', label: 'Boarding house' },
  { code: '95320', label: 'Motorcycle repair' },
  { code: '68101', label: 'Apartment rental' },
];

/** Everyday phrases rewritten to PSA's wording before the query is split into words. */
const PHRASES: [RegExp, string][] = [
  [/\b(internet cafe|computer shop|piso ?net|piso ?wifi)\b/, 'internet access'],
  [/\b(gas|gasoline|petrol) station\b/, 'automotive fuel'],
  [/\bwater refilling\b/, 'refilling'],
];

/**
 * Everyday and Filipino words mapped to the wording PSA uses. A query word
 * matches if it, or any word here, starts a word in the title; earlier
 * entries rank higher.
 */
const SYNONYMS: Record<string, string[]> = {
  apartment: ['residential buildings', 'apartment'],
  paupahan: ['residential buildings'],
  babuyan: ['swine'],
  piggery: ['swine'],
  manukan: ['chickens'],
  poultry: ['chickens', 'poultry'],
  karinderya: ['carinderia'],
  carenderia: ['carinderia'],
  eatery: ['carinderia', 'eatery'],
  resto: ['restaurants'],
  canteen: ['cafeterias', 'carinderia'],
  tindahan: ['sari'],
  botika: ['drugs', 'pharmaceutical'],
  pharmacy: ['drugs', 'pharmaceutical'],
  drugstore: ['drugs', 'pharmaceutical'],
  salon: ['hairdressing', 'beauty'],
  parlor: ['hairdressing', 'beauty'],
  barbershop: ['barber'],
  laundry: ['washing and cleaning of textile', 'laundry'],
  laundromat: ['washing and cleaning of textile'],
  gasoline: ['automotive fuel'],
  gas: ['automotive fuel', 'gas'],
  car: ['motor vehicle', 'car'],
  gym: ['fitness'],
  bakeshop: ['bakery', 'baking'],
  panaderya: ['bakery', 'baking'],
  computer: ['computer', 'internet access'],
  pisonet: ['internet access'],
  wifi: ['internet'],
  palay: ['rice'],
  bigas: ['rice'],
};

interface Indexed {
  activity: Activity;
  own: string;
  ownWords: string[];
  parentWords: string[];
}

let index: Indexed[] | null = null;

function getIndex(): Indexed[] {
  if (!index) {
    index = activities.map((a) => {
      const own = normalize(a.title);
      const parents = normalize(
        [classes[a.classCode], groups[a.groupCode], divisions[a.divisionCode][0]].join(' ')
      );
      return { activity: a, own, ownWords: own.split(' '), parentWords: parents.split(' ') };
    });
  }
  return index;
}

const startsAny = (words: string[], alt: string) =>
  alt.includes(' ') ? words.join(' ').includes(alt) : words.some((w) => w.startsWith(alt));

/** Score one query word against an entry: 0 means it does not match. */
function scoreWord(entry: Indexed, word: string): number {
  const alts = [word, ...(SYNONYMS[word] ?? [])];
  let best = 0;
  alts.forEach((alt, i) => {
    const s = entry.ownWords.includes(alt)
      ? 4
      : startsAny(entry.ownWords, alt)
        ? 3
        : startsAny(entry.parentWords, alt)
          ? 1
          : 0;
    if (s) best = Math.max(best, s - i * 0.25);
  });
  return best;
}

export interface SearchResult {
  results: Activity[];
  total: number;
}

export function searchActivities(query: string, limit = 12): SearchResult {
  const q = PHRASES.reduce((s, [re, to]) => s.replace(re, to), normalize(query));
  if (!q) return { results: [], total: 0 };

  // Digits only: treat as a code or code prefix (4711, 47113, 47).
  const digits = q.replace(/ /g, '');
  if (/^\d+$/.test(digits)) {
    const hits = activities.filter(
      (a) => a.code.startsWith(digits) || a.classCode.startsWith(digits)
    );
    return { results: hits.slice(0, limit), total: hits.length };
  }

  const words = q.split(' ');
  const scored: { a: Activity; score: number }[] = [];
  for (const entry of getIndex()) {
    let score = 0;
    for (const w of words) {
      const s = scoreWord(entry, w);
      if (!s) {
        score = 0;
        break;
      }
      score += s;
    }
    if (!score) continue;
    if (words.length > 1 && entry.own.includes(q)) score += 3;
    // Catch-all "n.e.c." rows sink below specific ones.
    if (/\bn e c\b/.test(entry.own)) score -= 1;
    scored.push({ a: entry.activity, score });
  }
  scored.sort((x, y) => y.score - x.score || x.a.title.length - y.a.title.length);
  return { results: scored.slice(0, limit).map((s) => s.a), total: scored.length };
}
