'use client';

import { useState } from 'react';
import officesJson from '@/data/offices.json';
import { search, type SearchEntry } from '@/lib/search';
import { useLanguage } from '@/i18n/LanguageContext';

const ENTRIES: SearchEntry[] = officesJson.offices.map((o) => ({
  type: 'office',
  en: o.name,
  fil: o.name,
  extra: (o.keywords ?? []).join(' '),
  href: '/government/#offices',
}));

/** The 43 city offices with a filter box (matches names and everyday words, English or Filipino). */
export default function OfficeList() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const filtering = query.replace(/\s/g, '').length >= 2;
  const shown = filtering ? search(ENTRIES, query) : ENTRIES;

  return (
    <div className="office-list-wrap">
      <label className="office-filter">
        <i className="ph ph-magnifying-glass" aria-hidden="true" />
        <span className="sr-only">{t('offices-filter', 'Filter offices')}</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('offices-filter', 'Filter offices')}
          autoComplete="off"
        />
      </label>
      <p className="sr-only" role="status">
        {filtering ? t('offices-count', '{n} offices').replace('{n}', String(shown.length)) : ''}
      </p>
      {shown.length ? (
        <ul className="office-list">
          {shown.map((o) => (
            <li key={o.en}>{o.en}</li>
          ))}
        </ul>
      ) : (
        <p className="office-empty">{t('offices-none', 'No office matches.')}</p>
      )}
    </div>
  );
}
