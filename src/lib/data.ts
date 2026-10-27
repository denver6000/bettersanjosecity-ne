/**
 * Typed access to src/data/*.json. Data is read at build time, so edit the
 * JSON and run `npm run build` to publish changes.
 */
import servicesJson from '@/data/services.json';
import newsJson from '@/data/news.json';

export interface Service {
  id: string;
  title: string;
  category: string;
  categoryId?: string;
  description?: string;
  keywords?: string[];
  fee?: string;
  processingTime?: string;
  office?: string;
  url?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: string;
  badge?: 'info' | 'success' | 'warning';
  summary: string;
  url?: string | null;
  source?: string;
}

export const services = servicesJson.services as Service[];

export const news = ([...newsJson.news] as NewsItem[]).sort((a, b) => b.date.localeCompare(a.date));

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return m ? `${MONTHS[m - 1]} ${d}, ${y}` : iso;
}

/** Only allow http(s) and site-relative URLs into href attributes. */
export function safeUrl(url?: string | null) {
  if (!url) return null;
  const u = url.trim();
  return /^https?:\/\//i.test(u) || u.startsWith('/') ? u : null;
}
