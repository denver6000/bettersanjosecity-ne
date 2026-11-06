/**
 * Business tax estimator: maps a PSIC activity to the city's tax and fee
 * codes, then works out each charge from the printed schedules in
 * src/data/revenue.ts. Figures always come from there; this file only decides
 * which code applies and how a printed row is read.
 */
import {
  allCodes,
  findBracket,
  type FixedCode,
  type GraduatedCode,
  type RevenueCode,
  type TieredCode,
} from '@/data/revenue';
import type { Activity } from '@/lib/psic';
import { isOpenEnded, peso, percent, plain } from '@/lib/tax-format';

/** Translatable text: i18n key plus its English wording. */
export interface Msg {
  k: string;
  en: string;
}
const w = (k: string, en: string): Msg => ({ k, en });

/** `t` from useLanguage(). */
export type Tr = (key: string, fallback: string) => string;

interface Rule {
  /** Business tax code on the license schedule, or null when none applies. */
  tax: string | null;
  /** Why this code was suggested, in plain words: i18n key and English text. */
  why: Msg;
  /** Mayor's permit code; "Other business" (582-22) when not set. */
  permit?: string;
  /** Garbage fee group most likely to fit. */
  garbage?: string;
}

const MANUFACTURER = w('est-why-manuf', 'PSIC lists this under manufacturing.');
const SERVICE = w(
  'est-why-service',
  'The city taxes businesses that mainly sell a service under code 582-10.'
);
const CONTRACTOR = w(
  'est-why-contractor',
  'Repair, installation and construction work count as contracting under the Local Government Code (Sec. 131).'
);

/**
 * Keyed by PSIC section letter or by a code prefix (division, group, class,
 * or sub-class). The longest matching prefix wins, then the section.
 */
const RULES: Record<string, Rule> = {
  A: {
    tax: null,
    why: w(
      'est-why-a',
      'Farming, forestry and fishing are not on the printed business tax schedule.'
    ),
    garbage: '3009',
  },
  '016': {
    tax: '582-10',
    why: w(
      'est-why-016',
      'Services to farms for a fee (drying, threshing, spraying) are taxed as a service business.'
    ),
    garbage: '3009',
  },
  '0145': {
    tax: null,
    why: w('est-why-livestock', 'Livestock raising is not on the printed business tax schedule.'),
    permit: '582-06',
    garbage: '3009',
  },
  '0146': {
    tax: null,
    why: w('est-why-poultry', 'Poultry raising is not on the printed business tax schedule.'),
    permit: '582-06',
    garbage: '3009',
  },
  '0147': {
    tax: null,
    why: w('est-why-poultry', 'Poultry raising is not on the printed business tax schedule.'),
    permit: '582-06',
    garbage: '3009',
  },
  '0148': {
    tax: null,
    why: w('est-why-poultry', 'Poultry raising is not on the printed business tax schedule.'),
    permit: '582-06',
    garbage: '3009',
  },
  B: {
    tax: null,
    why: w(
      'est-why-b',
      'Mining and quarrying is not on the printed business tax schedule. Sand and gravel taxes are set by the province.'
    ),
    garbage: '3012',
  },
  C: { tax: '582-01', why: MANUFACTURER, garbage: '3001' },
  '33': { tax: '582-08', why: CONTRACTOR, permit: '582-08-MP', garbage: '3012' },
  D: {
    tax: null,
    why: w(
      'est-why-d',
      'Power and gas utilities usually pay a franchise tax instead, which is not on these schedules.'
    ),
    garbage: '3006',
  },
  E: { tax: '582-10', why: SERVICE, garbage: '3012' },
  '36': {
    tax: null,
    why: w(
      'est-why-36',
      'Water utilities usually pay a franchise tax instead, which is not on these schedules.'
    ),
    garbage: '3006',
  },
  F: {
    tax: '582-08',
    why: w('est-why-f', 'PSIC lists this under construction, which the city taxes as contracting.'),
    permit: '582-08-MP',
    garbage: '3012',
  },
  '46': {
    tax: '582-02',
    why: w('est-why-46', 'PSIC lists this under wholesale trade.'),
    permit: '582-02-MP',
    garbage: '3011',
  },
  '461': {
    tax: '582-10',
    why: w(
      'est-why-461',
      'Wholesale on a fee or contract basis is commission agency, listed under code 582-10.'
    ),
    garbage: '3008',
  },
  '47': {
    tax: '582-07',
    why: w('est-why-47', 'PSIC lists this under retail trade.'),
    garbage: '3002',
  },
  '479': {
    tax: '582-10',
    why: w('est-why-479', 'Arranging sales for others for a fee is listed under code 582-10.'),
    garbage: '3008',
  },
  H: { tax: '582-10', why: SERVICE, garbage: '3012' },
  '49': {
    tax: null,
    why: w(
      'est-why-carrier',
      'Common carriers are exempt from city tax on their receipts from carrying passengers or goods (Local Government Code, Sec. 133(j)).'
    ),
    garbage: '3006',
  },
  '50': {
    tax: null,
    why: w(
      'est-why-carrier',
      'Common carriers are exempt from city tax on their receipts from carrying passengers or goods (Local Government Code, Sec. 133(j)).'
    ),
    garbage: '3006',
  },
  '51': {
    tax: null,
    why: w(
      'est-why-carrier',
      'Common carriers are exempt from city tax on their receipts from carrying passengers or goods (Local Government Code, Sec. 133(j)).'
    ),
    garbage: '3006',
  },
  I: {
    tax: '582-10',
    why: w(
      'est-why-i',
      'Restaurants, eateries, hotels and boarding houses are listed under code 582-10.'
    ),
    garbage: '3002',
  },
  J: { tax: '582-10', why: SERVICE, garbage: '3008' },
  K: {
    tax: '582-10',
    why: w('est-why-k', 'Computer services and cable operators are listed under code 582-10.'),
    garbage: '3008',
  },
  '61': { tax: '582-10', why: SERVICE, garbage: '3006' },
  L: {
    tax: '582-09',
    why: w(
      'est-why-l',
      'PSIC lists this under financial and insurance activities, taxed under code 582-09.'
    ),
    permit: '589-09-01-MP',
    garbage: '3004',
  },
  '641': {
    tax: '582-09',
    why: w('est-why-641', 'PSIC lists this under banking, taxed under code 582-09.'),
    permit: '582-09-MP',
    garbage: '3004',
  },
  '6411': {
    tax: null,
    why: w(
      'est-why-6411',
      'Central banking is done by the national government, not a local business.'
    ),
  },
  M: {
    tax: '582-10',
    why: w(
      'est-why-m',
      'Lessors, dealers and brokers of real estate are listed under code 582-10.'
    ),
    garbage: '3008',
  },
  N: {
    tax: '582-10',
    why: w('est-why-n', 'Consultancy and other professional services are taxed under code 582-10.'),
    garbage: '3008',
  },
  O: { tax: '582-10', why: SERVICE, garbage: '3008' },
  '79': {
    tax: '582-10',
    why: w('est-why-79', 'Travel agencies are listed under code 582-10.'),
    garbage: '3008',
  },
  P: { tax: null, why: w('est-why-p', 'Government offices do not pay business tax.') },
  Q: {
    tax: '582-10',
    why: w(
      'est-why-q',
      'Private schools are taxed as a service business. Non-stock, non-profit schools are exempt; ask the Treasurer.'
    ),
    garbage: '3005',
  },
  R: {
    tax: '582-10',
    why: w('est-why-r', 'Hospitals, clinics and laboratories are listed under code 582-10.'),
    garbage: '3003',
  },
  S: {
    tax: '582-10',
    why: w('est-why-s', 'Amusement places, resorts and cockpits are listed under code 582-10.'),
    garbage: '3007',
  },
  T: { tax: '582-10', why: SERVICE, garbage: '3002' },
  '94': {
    tax: null,
    why: w(
      'est-why-94',
      'Associations, unions and religious groups are generally not run for profit. Ask the Treasurer if yours earns income.'
    ),
  },
  '95': { tax: '582-08', why: CONTRACTOR, permit: '582-08-MP', garbage: '3010' },
  '9540': {
    tax: '582-10',
    why: w('est-why-9540', 'Arranging repairs for others for a fee is listed under code 582-10.'),
    garbage: '3008',
  },
  U: {
    tax: null,
    why: w('est-why-u', 'Households employing domestic workers are not businesses.'),
  },
  V: {
    tax: null,
    why: w('est-why-v', 'Embassies and international organizations are not taxed by the city.'),
  },
};

export function ruleFor(a: Activity): Rule {
  for (const key of [a.code, a.classCode, a.groupCode, a.divisionCode, a.section]) {
    if (RULES[key]) return RULES[key];
  }
  return { tax: null, why: w('est-why-none', 'No business tax code matched this activity.') };
}

const codeIndex = new Map(allCodes.map(({ schedule, code }) => [code.code, { schedule, code }]));

export function getCode<T extends RevenueCode = RevenueCode>(code: string): T {
  const hit = codeIndex.get(code);
  if (!hit) throw new Error(`Unknown revenue code ${code}`);
  return hit.code as T;
}

/* ---------- Inputs and line items ---------- */

export type Applicant = 'renewal' | 'new';

export interface EstimateInput {
  activity: Activity;
  applicant: Applicant;
  gross: number | null;
  area: number | null;
  employees: number | null;
  /** Row index on the mayor's permit code, when it is tiered. */
  permitRow: number | null;
  /** Garbage fee code and row index the visitor picked. */
  garbage: { code: string; row: number } | null;
}

export type LineStatus = 'ok' | 'needs-input' | 'no-row' | 'not-charged';

export interface LineItem {
  key: string;
  label: string;
  code?: string;
  status: LineStatus;
  amount: number;
  /** How the amount was worked out, or what is missing. */
  detail: string;
}

export const RETAIL_BARANGAY_LIMIT = 50_000;

function businessTax(input: EstimateInput, rule: Rule, t: Tr): LineItem {
  const base = {
    key: 'tax',
    label: t('est-l-tax', 'Business tax'),
    code: rule.tax ?? undefined,
    amount: 0,
  };
  const pctOf = (rate: number, amount: number) =>
    t('est-d-pct-of', '{r} of {a}').replace('{r}', percent(rate)).replace('{a}', peso(amount));

  if (!rule.tax) return { ...base, status: 'not-charged', detail: t(rule.why.k, rule.why.en) };
  if (input.applicant === 'new') {
    return {
      ...base,
      status: 'not-charged',
      detail: t(
        'est-d-new',
        'The printed business tax codes are for renewals. In a business’s first year, the tax is set on its capital investment instead (Local Government Code, Sec. 143), which the Treasurer computes.'
      ),
    };
  }
  const gross = input.gross;
  if (gross == null) {
    return {
      ...base,
      status: 'needs-input',
      detail: t('est-d-need-gross', 'Enter last year’s gross sales or receipts.'),
    };
  }

  const code = getCode(rule.tax);

  if (code.kind === 'flat-rate') {
    return {
      ...base,
      status: 'ok',
      amount: gross * code.rate,
      detail: pctOf(code.rate, gross),
    };
  }
  if (code.kind !== 'graduated') throw new Error(`Unexpected kind for ${code.code}`);

  // Retailers: 2% on the first ₱400,000 and 1% on the excess, per the wording of 582-07.
  if (code.brackets.every((r) => r.amount === 0 && r.rate > 0)) {
    if (gross <= RETAIL_BARANGAY_LIMIT) {
      return {
        ...base,
        status: 'not-charged',
        detail: t(
          'est-d-barangay',
          'Stores with gross sales of {a} or less are taxed by their barangay, not the city.'
        ).replace('{a}', peso(RETAIL_BARANGAY_LIMIT)),
      };
    }
    let amount = 0;
    const parts: string[] = [];
    code.brackets.forEach((row, i) => {
      const from = i === 0 ? 0 : row.from;
      const next = code.brackets[i + 1];
      const to = next ? next.from : Infinity;
      const slice = Math.max(0, Math.min(gross, to) - from);
      if (slice > 0) {
        amount += slice * row.rate;
        parts.push(pctOf(row.rate, slice));
      }
    });
    return { ...base, status: 'ok', amount, detail: parts.join(' + ') };
  }

  return graduatedLine(base, code, gross, t);
}

function graduatedLine(
  base: Omit<LineItem, 'status' | 'detail'>,
  code: GraduatedCode,
  value: number,
  t: Tr
): LineItem {
  const fmt = code.unit === 'peso' ? peso : plain;
  const unit = code.unit === 'peso' ? '' : ' sq m';
  const hit = findBracket(code.brackets, value);
  if (!hit || 'gap' in hit) {
    return {
      ...base,
      status: 'no-row',
      detail: t(
        'est-d-no-row',
        'The printed schedule has no row for {v}. Ask the Treasurer’s Office.'
      ).replace('{v}', `${fmt(value)}${unit}`),
    };
  }
  const row = code.brackets[hit.index];
  if (!row.rate) {
    const detail = isOpenEnded(row.to)
      ? t('est-d-row-above', 'Row for {a}{u} and above')
      : t('est-d-row-range', 'Row for {a} to {b}{u}');
    return {
      ...base,
      status: 'ok',
      amount: row.amount,
      detail: detail.replace('{a}', fmt(row.from)).replace('{b}', fmt(row.to)).replace('{u}', unit),
    };
  }
  // A rate on a row is read as applying to the part above the row's start.
  const excess = Math.max(0, value - row.from);
  return {
    ...base,
    status: 'ok',
    amount: row.amount + excess * row.rate,
    detail: t('est-d-plus', '{a} plus {r} of the {e} above {f}')
      .replace('{a}', peso(row.amount))
      .replace('{r}', percent(row.rate))
      .replace('{e}', peso(excess))
      .replace('{f}', peso(row.from)),
  };
}

function permitFee(input: EstimateInput, rule: Rule, t: Tr): LineItem {
  const code = getCode<FixedCode | TieredCode>(rule.permit ?? '582-22');
  const base = {
    key: 'permit',
    label: t('est-l-permit', 'Mayor’s permit fee'),
    code: code.code,
    amount: 0,
  };
  if (code.kind === 'fixed')
    return { ...base, status: 'ok', amount: code.amount, detail: code.title };
  const row = input.permitRow != null ? code.rows[input.permitRow] : undefined;
  if (!row)
    return {
      ...base,
      status: 'needs-input',
      detail: t('est-d-choose-col', 'Choose your {n}.').replace('{n}', code.column.toLowerCase()),
    };
  return { ...base, status: 'ok', amount: row.amount, detail: `${code.title}, ${row.label}` };
}

function sanitaryFee(input: EstimateInput, t: Tr): LineItem {
  const code = getCode<GraduatedCode>('FEE');
  const base = {
    key: 'sanitary',
    label: t('est-l-sanitary', 'Sanitary fee'),
    code: code.code,
    amount: 0,
  };
  if (input.area == null)
    return {
      ...base,
      status: 'needs-input',
      detail: t('est-d-need-area', 'Enter your floor area.'),
    };
  return graduatedLine(base, code, input.area, t);
}

function garbageFee(input: EstimateInput, t: Tr): LineItem {
  const base = { key: 'garbage', label: t('est-l-garbage', 'Garbage fee'), amount: 0 };
  if (!input.garbage)
    return {
      ...base,
      status: 'needs-input',
      detail: t('est-d-need-type', 'Choose the type of establishment.'),
    };
  const code = getCode<TieredCode>(input.garbage.code);
  const row = code.rows[input.garbage.row];
  return { ...base, code: code.code, status: 'ok', amount: row.amount, detail: row.label };
}

function perEmployee(key: string, codeName: string, employees: number | null, t: Tr): LineItem {
  const code = getCode<FixedCode>(codeName);
  const base = { key, label: code.title, code: code.code, amount: 0 };
  if (employees == null)
    return {
      ...base,
      status: 'needs-input',
      detail: t('est-d-need-emp', 'Enter the number of employees.'),
    };
  return {
    ...base,
    status: 'ok',
    amount: code.amount * employees,
    detail: (employees === 1
      ? t('est-d-emp-one', '{a} × {n} employee')
      : t('est-d-emp-many', '{a} × {n} employees')
    )
      .replace('{a}', peso(code.amount))
      .replace('{n}', plain(employees)),
  };
}

export interface Estimate {
  rule: Rule;
  items: LineItem[];
  total: number;
  pending: number;
}

export function estimate(input: EstimateInput, t: Tr): Estimate {
  const rule = ruleFor(input.activity);
  const items = [
    businessTax(input, rule, t),
    permitFee(input, rule, t),
    sanitaryFee(input, t),
    garbageFee(input, t),
    perEmployee('health', 'HEALTH-FEE', input.employees, t),
    perEmployee('occupational', 'OCCUP-FEE', input.employees, t),
  ];
  return {
    rule,
    items,
    total: items.reduce((sum, i) => sum + (i.status === 'ok' ? i.amount : 0), 0),
    pending: items.filter((i) => i.status === 'needs-input').length,
  };
}

/** Every garbage fee group, for the establishment picker. */
export const garbageGroups = allCodes
  .filter(({ schedule }) => schedule.id === 'garbage-fees')
  .map(({ code }) => code as TieredCode);
