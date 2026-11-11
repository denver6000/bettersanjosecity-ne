'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { search, shownCount } from '@/lib/search';
import { SITE_INDEX } from '@/lib/search-index';
import SearchResults from './SearchResults';

/**
 * Header search: a button that opens a modal <dialog>. The native dialog traps focus and closes on
 * Esc; we add backdrop-click close, a scroll lock and focus return to the button.
 */
export default function SiteSearch() {
  const { t } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState('');
  const active = query.replace(/\s/g, '').length >= 2;
  const results = useMemo(() => search(SITE_INDEX, query), [query]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      document.documentElement.classList.remove('search-open');
      openerRef.current?.focus();
    };
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, []);

  const open = () => {
    setQuery('');
    document.documentElement.classList.add('search-open');
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const label = t('search-open', 'Search the site');

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        className="btn btn-secondary site-search-btn"
        aria-label={label}
        aria-haspopup="dialog"
        onClick={open}
      >
        <i className="ph ph-magnifying-glass" aria-hidden="true" />
      </button>
      <dialog
        ref={dialogRef}
        className="site-search"
        aria-label={label}
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <div className="site-search-panel">
          <div className="site-search-bar">
            <i className="ph ph-magnifying-glass" aria-hidden="true" />
            <input
              type="search"
              autoFocus
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              // A search input's own Esc only clears it; one press should close the dialog.
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  close();
                }
              }}
              placeholder={t('search-placeholder', 'Search pages, officials, offices, hotlines')}
              aria-label={label}
            />
            <button
              type="button"
              className="site-search-close"
              onClick={close}
              aria-label={t('search-close', 'Close search')}
            >
              <i className="ph ph-x" aria-hidden="true" />
            </button>
          </div>
          <p className="sr-only" role="status">
            {active
              ? t('search-results-count', '{n} results').replace('{n}', String(shownCount(results)))
              : ''}
          </p>
          {active && <SearchResults results={results} onPick={close} />}
        </div>
      </dialog>
    </>
  );
}
