'use client';

import { useMemo, useRef, useState, useEffect, type FormEvent } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { search, shownCount } from '@/lib/search';
import { SITE_INDEX } from '@/lib/search-index';
import SearchResults from './SearchResults';

/** Hero search box: searches the whole site (pages, officials, offices, hotlines, services) as you type. */
export default function ServiceSearch() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const active = open && query.replace(/\s/g, '').length >= 2;
  const results = useMemo(() => search(SITE_INDEX, query), [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOpen(true);
  };

  return (
    <div className="home-search-box" ref={wrapperRef}>
      <form className="search-form" role="search" onSubmit={onSubmit}>
        <div className="search-input-wrapper">
          <i className="ph ph-magnifying-glass" aria-hidden="true" />
          <input
            type="search"
            id="hero-search"
            className="service-search-input"
            placeholder={t('home-search-placeholder', 'e.g., birth certificate, business permit')}
            aria-label={t('home-find-a-service', 'Find a service')}
            autoComplete="off"
            value={query}
            onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
          />
          <button type="submit" className="search-submit-btn">
            {t('hero-search-btn', 'Search')}
          </button>
        </div>
      </form>
      {/* Links, not a combobox: a plain list plus a polite count keeps Tab order and announcements simple. */}
      <p className="sr-only" role="status">
        {active
          ? t('search-results-count', '{n} results').replace('{n}', String(shownCount(results)))
          : ''}
      </p>
      {active && <SearchResults results={results} onPick={() => setOpen(false)} />}
    </div>
  );
}
