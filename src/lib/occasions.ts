// Calendar, seasons and time scripts for the hero's occasions. Pure, no imports, so Node can test it.
// Dates the city has not confirmed are marked `confirmed: false`; edit them here.

export type Tone = 'celebrate' | 'remember';
export type OccasionId =
  | 'christmas'
  | 'new-year'
  | 'independence'
  | 'city-anniversary'
  | 'st-joseph'
  | 'pagibang-damara'
  | 'labor-day'
  | 'kagitingan'
  | 'holy-week'
  | 'undas';
export type Season = 'planting' | 'growing' | 'harvest';
export type DateParts = { year: number; month: number; day: number };

type Range = [number, number, number, number]; // [month, day, month, day]; may wrap the year end

export interface OccasionDef {
  id: OccasionId;
  tone: Tone;
  confirmed: boolean;
  ranges: Range[] | 'holy-week';
}

export const OCCASIONS: OccasionDef[] = [
  { id: 'christmas', tone: 'celebrate', confirmed: true, ranges: [[12, 1, 1, 6]] },
  { id: 'new-year', tone: 'celebrate', confirmed: true, ranges: [[12, 31, 1, 1]] },
  { id: 'independence', tone: 'celebrate', confirmed: true, ranges: [[6, 10, 6, 12]] },
  // RA 9776 makes 10 Aug a special holiday in the city; RA 6051 (the charter) is dated 4 Aug.
  { id: 'city-anniversary', tone: 'celebrate', confirmed: false, ranges: [[8, 10, 8, 10]] },
  { id: 'st-joseph', tone: 'celebrate', confirmed: true, ranges: [[3, 19, 3, 19]] },
  // Sources put the Pagibang Damara festival in the second or third week of April.
  { id: 'pagibang-damara', tone: 'celebrate', confirmed: false, ranges: [[4, 8, 4, 21]] },
  { id: 'labor-day', tone: 'celebrate', confirmed: true, ranges: [[5, 1, 5, 1]] },
  { id: 'kagitingan', tone: 'remember', confirmed: true, ranges: [[4, 9, 4, 9]] },
  { id: 'holy-week', tone: 'remember', confirmed: true, ranges: 'holy-week' },
  { id: 'undas', tone: 'remember', confirmed: true, ranges: [[10, 31, 11, 2]] },
];

// Remember days never share the screen; this order decides an overlap (the spec: Holy Week wins).
const REMEMBER_PRIORITY: OccasionId[] = ['holy-week', 'kagitingan', 'undas'];

/** Meeus/Jones/Butcher Gregorian Easter. */
export function easterSunday(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

const key = (month: number, day: number) => month * 100 + day;
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const dayOfYear = (m: number, d: number) =>
  MONTH_DAYS.slice(0, m - 1).reduce((a, b) => a + b, 0) + d;

function inRange(k: number, r: Range): boolean {
  const start = key(r[0], r[1]);
  const end = key(r[2], r[3]);
  return start <= end ? k >= start && k <= end : k >= start || k <= end;
}

function rangeDays(o: OccasionDef): number {
  if (o.ranges === 'holy-week') return 7;
  return Math.min(
    ...o.ranges.map((r) => {
      const a = dayOfYear(r[0], r[1]);
      const b = dayOfYear(r[2], r[3]);
      return b >= a ? b - a + 1 : 365 - a + b + 1;
    })
  );
}

function matches(o: OccasionDef, date: DateParts): boolean {
  if (o.ranges === 'holy-week') {
    const e = easterSunday(date.year);
    const easter = Date.UTC(date.year, e.month - 1, e.day);
    const t = Date.UTC(date.year, date.month - 1, date.day);
    return t >= easter - 7 * 864e5 && t < easter;
  }
  const k = key(date.month, date.day);
  return o.ranges.some((r) => inRange(k, r));
}

/** The occasion to draw on a date: Remember beats Celebrate; among Celebrate days the narrower range wins. */
export function occasionOn(date: DateParts): { id: OccasionId; tone: Tone } | null {
  const hits = OCCASIONS.filter((o) => matches(o, date));
  const remember = hits
    .filter((o) => o.tone === 'remember')
    .sort((a, b) => REMEMBER_PRIORITY.indexOf(a.id) - REMEMBER_PRIORITY.indexOf(b.id));
  if (remember[0]) return { id: remember[0].id, tone: 'remember' };
  const celebrate = hits
    .map((o, i) => ({ o, i }))
    .sort((a, b) => rangeDays(a.o) - rangeDays(b.o) || a.i - b.i);
  return celebrate[0] ? { id: celebrate[0].o.id, tone: 'celebrate' } : null;
}

/** Planting 1 Dec to 31 Jan and 1 Jun to 31 Jul; harvest 1 Mar to 30 Apr and 1 Oct to 30 Nov. */
export function seasonOn(date: DateParts): Season {
  const m = date.month;
  if (m === 12 || m === 1 || m === 6 || m === 7) return 'planting';
  if (m === 3 || m === 4 || m === 10 || m === 11) return 'harvest';
  return 'growing';
}

/** 0 (not up) to 1 (up): raised over two minutes from 8:00 on 12 Jun, up on 10 and 11 Jun. */
export function flagProgress(date: DateParts, hour: number): number {
  if (date.month !== 6) return 0;
  if (date.day === 10 || date.day === 11) return 1;
  if (date.day !== 12) return 0;
  // Rounded to the microminute so 8:02 is exactly 1 despite float error.
  const minutes = Math.round((hour - 8) * 60 * 1e6) / 1e6;
  return minutes <= 0 ? 0 : Math.min(1, minutes / 2);
}

export function newYearPhase(
  date: DateParts,
  hour: number
): 'buildup' | 'midnight' | 'sunrise' | 'day' {
  if (date.month === 12 && date.day === 31 && hour >= 20) return 'buildup';
  if (date.month === 1 && date.day === 1) {
    if (hour <= 10 / 60) return 'midnight';
    if (hour >= 5.5 && hour <= 9) return 'sunrise';
  }
  return 'day';
}

export function christmasMoment(date: DateParts, hour: number): 'simbang-gabi' | 'eve' | 'season' {
  if (date.month === 12 && date.day === 24 && hour >= 18) return 'eve';
  if (date.month === 12 && date.day >= 16 && date.day <= 24 && hour >= 4 && hour <= 6)
    return 'simbang-gabi';
  return 'season';
}

const IDS = OCCASIONS.map((o) => o.id) as string[];
const SEASONS = ['planting', 'growing', 'harvest'];

/** Reads `?on=christmas` (or `none`), `season=harvest`, `date=2026-06-12`; malformed parts are ignored. */
export function parseOccasionOverride(search: string): {
  occasion?: OccasionId | 'none';
  season?: Season;
  date?: DateParts;
} {
  const q = new URLSearchParams(search);
  const out: { occasion?: OccasionId | 'none'; season?: Season; date?: DateParts } = {};
  const on = q.get('on');
  if (on === 'none' || (on && IDS.includes(on))) out.occasion = on as OccasionId | 'none';
  const season = q.get('season');
  if (season && SEASONS.includes(season)) out.season = season as Season;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(q.get('date') ?? '');
  if (m) {
    const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const t = new Date(Date.UTC(year, month - 1, day));
    if (t.getUTCFullYear() === year && t.getUTCMonth() === month - 1 && t.getUTCDate() === day)
      out.date = { year, month, day };
  }
  return out;
}
