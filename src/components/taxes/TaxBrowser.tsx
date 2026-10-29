'use client';

import { useEffect, useMemo, useState } from 'react';
import CodeCard from '@/components/taxes/CodeCard';
import { codeAnchor, PRINTED_ON, schedules, type RevenueCode } from '@/data/revenue';
import { normalize } from '@/lib/tax-format';

interface Match {
  code: RevenueCode;
  /** Tiered rows that mention the query. */
  rows?: number[];
  /** Hide the other rows: only when the match came from the rows alone. */
  filter?: boolean;
}

/** Every word of the query must appear in the code's text or in one of its rows. */
function matchCode(code: RevenueCode, scheduleName: string, words: string[]): Match | null {
  const head = normalize(
    [
      code.code,
      code.title,
      scheduleName,
      ...(code.description ?? []),
      ...(code.enumerated ?? []),
    ].join(' ')
  );
  const headHit = words.every((w) => head.includes(w));

  if (code.kind === 'tiered') {
    const rows = code.rows
      .map((r, i) => ({ i, text: normalize(r.label) }))
      .filter(
        ({ text }) =>
          words.every((w) => text.includes(w) || head.includes(w)) &&
          words.some((w) => text.includes(w))
      )
      .map(({ i }) => i);
    if (rows.length) return { code, rows, filter: !headHit };
  }
  return headHit ? { code } : null;
}

/**
 * Search box, schedule contents and code cards. The query lives in `?q=` so a
 * search can be shared; it is read on mount because the page is a static export.
 */
export default function TaxBrowser() {
  const [q, setQ] = useState('');
  const words = useMemo(() => normalize(q).split(' ').filter(Boolean), [q]);

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q');
    if (initial) setQ(initial);
  }, []);

  const setQuery = (v: string) => {
    setQ(v);
    const url = new URL(window.location.href);
    if (v) url.searchParams.set('q', v);
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url);
  };

  const results = useMemo(
    () =>
      schedules.map((s) => ({
        schedule: s,
        matches: words.length
          ? (s.codes.map((c) => matchCode(c, s.name, words)).filter(Boolean) as Match[])
          : s.codes.map((code): Match => ({ code })),
      })),
    [words]
  );

  const hitCount = results.reduce((n, r) => n + r.matches.length, 0);

  return (
    <>
      <div className="tax-search" role="search">
        <i className="ph ph-magnifying-glass" aria-hidden="true" />
        <label htmlFor="tax-q" className="sr-only">
          Search taxes and fees
        </label>
        <input
          id="tax-q"
          type="search"
          placeholder="Search a business, code or fee, like “funeral” or “582-02”"
          value={q}
          onChange={(e) => setQuery(e.target.value)}
        />
        {q && (
          <button
            type="button"
            className="tax-search-clear"
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            <i className="ph ph-x" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="taxes-layout">
        <aside className="toc" aria-label="Schedules">
          <p className="toc-head">Schedules</p>
          <ol>
            {results.map(({ schedule: s, matches }) => (
              <li key={s.id} className={matches.length ? '' : 'is-empty'}>
                <a href={`#${s.id}`}>
                  {s.short}
                  <span className="toc-count">{matches.length}</span>
                </a>
                {matches.length > 0 && s.codes.length > 1 && (
                  <ul>
                    {matches.map(({ code }) => (
                      <li key={code.code}>
                        <a href={`#${codeAnchor(code.code)}`}>
                          <span className="toc-code">{code.code}</span> {code.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
          <a href="#how-to-read" className="toc-help">
            How to read these schedules →
          </a>
        </aside>

        <div className="taxes-main">
          {words.length > 0 && (
            <p className="search-status" aria-live="polite">
              {hitCount === 0 ? (
                <>
                  No code mentions “{q}”. Try a broader word, or{' '}
                  <button type="button" className="link-btn" onClick={() => setQuery('')}>
                    show every code
                  </button>
                  .
                </>
              ) : (
                <>
                  {hitCount} {hitCount === 1 ? 'code matches' : 'codes match'} “{q}”.{' '}
                  <button type="button" className="link-btn" onClick={() => setQuery('')}>
                    Clear search
                  </button>
                </>
              )}
            </p>
          )}

          {results.map(({ schedule: s, matches }) =>
            matches.length === 0 ? null : (
              <section key={s.id} id={s.id} className="schedule">
                <header className="schedule-head">
                  <div>
                    <p className="schedule-eyebrow">Printed as “{s.printedHeading}”</p>
                    <h2>{s.name}</h2>
                    <p className="schedule-summary">{s.summary}</p>
                    {s.explainer.map((p, i) => (
                      <p key={i} className="schedule-explainer">
                        {p}
                      </p>
                    ))}
                  </div>
                  <p className="source-chip">
                    <i className="ph-duotone ph-file-text" aria-hidden="true" />
                    <span>
                      {s.source.label}
                      <small>
                        {s.source.pages} {s.source.pages === 1 ? 'page' : 'pages'} · printed{' '}
                        {PRINTED_ON}
                      </small>
                    </span>
                  </p>
                </header>
                <div className="code-list">
                  {matches.map((m) => (
                    <CodeCard
                      key={m.code.code + q}
                      code={m.code}
                      rowFilter={m.rows}
                      filterRows={m.filter}
                      query={q}
                    />
                  ))}
                </div>
              </section>
            )
          )}
        </div>
      </div>
    </>
  );
}
