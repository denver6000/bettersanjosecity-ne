'use client';

import { useMemo, useRef, useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { services, type Service } from '@/lib/data';

function matches(service: Service, terms: string[]) {
  const haystack = [
    service.title,
    service.category,
    service.description,
    service.office,
    ...(service.keywords ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

/** Hero "Find a Service" box: filters data/services.json as you type. */
export default function ServiceSearch() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (query.trim().length < 2) return [];
    return services.filter((s) => matches(s, terms)).slice(0, 6);
  }, [query]);

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
            aria-label={t('home-find-a-service', 'Find a Service')}
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
        {open && query.trim().length >= 2
          ? results.length === 0
            ? t('search-results-none', 'No matching services')
            : t('search-results-count', '{n} matching services').replace(
                '{n}',
                String(results.length)
              )
          : ''}
      </p>
      {open && query.trim().length >= 2 && (
        <ul className="search-results-list" aria-label={t('home-find-a-service', 'Find a Service')}>
          {results.length === 0 ? (
            <li className="search-results-empty">
              {services.length === 0
                ? 'The service directory is being compiled. Please check back soon.'
                : `No services match “${query}”.`}
            </li>
          ) : (
            results.map((s) => (
              <li key={s.id}>
                <Link href={s.url || '/services'}>
                  <strong>{s.title}</strong>
                  <span>{s.category}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
