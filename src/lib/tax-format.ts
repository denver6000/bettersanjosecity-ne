import { OPEN_ENDED } from '@/data/revenue';

const pesoFmt = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const plainFmt = new Intl.NumberFormat('en-PH', { maximumFractionDigits: 2 });

export const peso = (n: number) => '₱' + pesoFmt.format(n);
export const num = (n: number) => pesoFmt.format(n);
export const plain = (n: number) => plainFmt.format(n);

/** 0.005625 → "0.5625%" */
export const percent = (rate: number) => `${+(rate * 100).toFixed(4)}%`;

export const isOpenEnded = (to: number) => to >= OPEN_ENDED;

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
