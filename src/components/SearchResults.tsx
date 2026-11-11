'use client';

import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { groupByType, type EntryType, type SearchEntry } from '@/lib/search';
import { toTel } from '@/lib/phone';

const GROUP_LABEL: Record<EntryType, string> = {
  page: 'Pages',
  official: 'Officials',
  office: 'City offices',
  hotline: 'Hotlines',
  service: 'Services',
};

/** Site search results, grouped by kind; hotlines also get one tap-to-call link per number. */
export default function SearchResults({
  results,
  onPick,
}: {
  results: SearchEntry[];
  /** Called when a result link is followed (the dialog closes itself). */
  onPick?: () => void;
}) {
  const { t, language } = useLanguage();

  if (!results.length) {
    return (
      <div className="search-results-list">
        <p className="search-results-empty">{t('search-results-none', 'No results')}</p>
      </div>
    );
  }

  return (
    <div className="search-results-list">
      {groupByType(results).map(([type, list]) => (
        <div className="search-group" key={type}>
          <p className="search-group-title">{t(`search-group-${type}`, GROUP_LABEL[type])}</p>
          <ul>
            {list.map((e) => (
              <li key={`${e.href}|${e.en}`} className={e.tel ? 'search-hotline' : undefined}>
                <Link href={e.href} onClick={onPick}>
                  <strong>{language === 'fil' ? e.fil : e.en}</strong>
                </Link>
                {e.tel && (
                  <span className="search-tels">
                    {e.tel.map((n) => (
                      <a key={n} href={`tel:${toTel(n)}`}>
                        <i className="ph ph-phone" aria-hidden="true" />
                        {n}
                      </a>
                    ))}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
