'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { codeAnchor, PRINTED_ON, type TieredCode } from '@/data/revenue';
import {
  estimate,
  garbageGroups,
  getCode,
  ruleFor,
  type Applicant,
  type LineItem,
} from '@/lib/estimator';
import {
  findActivity,
  lineage,
  PSIC_SOURCE,
  QUICK_PICKS,
  searchActivities,
  type Activity,
} from '@/lib/psic';
import { peso } from '@/lib/tax-format';

/** "1,250,000" or "1250000.50" → number; blank or invalid → null. */
function parseAmount(v: string): number | null {
  const n = Number(v.replace(/[,\s₱]/g, ''));
  return v.trim() && Number.isFinite(n) && n >= 0 ? n : null;
}

function setParam(name: string, value: string | null) {
  const url = new URL(window.location.href);
  if (value) url.searchParams.set(name, value);
  else url.searchParams.delete(name);
  window.history.replaceState(null, '', url);
}

const codeHref = (code: string) => `/business-taxes/#${codeAnchor(code)}`;

const STATUS_TEXT: Record<LineItem['status'], string> = {
  ok: '',
  'needs-input': 'Needs an answer',
  'no-row': 'No printed row',
  'not-charged': 'Not estimated',
};

/**
 * PSIC search, the visitor's details, and the itemized estimate. The chosen
 * activity lives in `?psic=` so an estimate's starting point can be shared.
 */
export default function Estimator() {
  const ids = useId();
  const [query, setQuery] = useState('');
  const [activity, setActivity] = useState<Activity | null>(null);
  const [applicant, setApplicant] = useState<Applicant>('renewal');
  const [gross, setGross] = useState('');
  const [area, setArea] = useState('');
  const [employees, setEmployees] = useState('');
  const [permitRow, setPermitRow] = useState('');
  const [garbage, setGarbage] = useState('');

  useEffect(() => {
    const initial = findActivity(new URLSearchParams(window.location.search).get('psic'));
    if (initial) setActivity(initial);
  }, []);

  const choose = (a: Activity | null) => {
    setActivity(a);
    setPermitRow('');
    setGarbage('');
    if (a) setQuery('');
    setParam('psic', a?.code ?? null);
  };

  const search = useMemo(() => searchActivities(query), [query]);
  const rule = activity ? ruleFor(activity) : null;
  const permitCode = rule ? getCode(rule.permit ?? '582-22') : null;

  // Suggested garbage group first, the rest in schedule order.
  const garbageOptions = useMemo(() => {
    const suggested = rule?.garbage;
    return [...garbageGroups].sort(
      (a, b) => Number(b.code === suggested) - Number(a.code === suggested)
    );
  }, [rule?.garbage]);

  const result = activity
    ? estimate({
        activity,
        applicant,
        gross: parseAmount(gross),
        area: parseAmount(area),
        employees: (() => {
          const n = parseAmount(employees);
          return n == null ? null : Math.floor(n);
        })(),
        permitRow: permitRow === '' ? null : Number(permitRow),
        garbage: garbage
          ? { code: garbage.split(':')[0], row: Number(garbage.split(':')[1]) }
          : null,
      })
    : null;

  return (
    <div className="est-layout">
      <div className="est-form">
        {/* Step 1: activity */}
        <section className="est-step" aria-labelledby={`${ids}-s1`}>
          <h2 id={`${ids}-s1`}>
            <span className="est-step-num">1</span> What does your business do?
          </h2>

          {activity && rule ? (
            <div className="est-picked">
              <div className="est-picked-head">
                <span className="code-pill">PSIC {activity.code}</span>
                <button type="button" className="link-btn" onClick={() => choose(null)}>
                  Change
                </button>
              </div>
              <p className="est-picked-title">{activity.title}</p>
              <ol className="est-lineage">
                {lineage(activity)
                  .filter((l, i, all) => i === 0 || l.title !== all[i - 1].title)
                  .map((l) => (
                    <li key={l.level}>
                      <span className="muted">{l.level}</span> {l.title}
                    </li>
                  ))}
              </ol>
              <div className="est-mapping">
                <i className="bi bi-arrow-return-right" aria-hidden="true" />
                <p>
                  {rule.tax ? (
                    <>
                      Business tax code{' '}
                      <a href={codeHref(rule.tax)}>
                        <strong>{rule.tax}</strong> {getCode(rule.tax).title}
                      </a>
                      .{' '}
                    </>
                  ) : (
                    <>No business tax code. </>
                  )}
                  {rule.why}
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="est-help">
                Search PSA’s industry classification ({PSIC_SOURCE.edition}). Use everyday words,
                like “sari-sari”, “piggery” or “boarding house”, or a PSIC code.
              </p>
              <div className="tax-search" role="search">
                <i className="bi bi-search" aria-hidden="true" />
                <label htmlFor={`${ids}-q`} className="sr-only">
                  Search business activities
                </label>
                <input
                  id={`${ids}-q`}
                  type="search"
                  autoComplete="off"
                  placeholder="What do you sell or do?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-controls={`${ids}-results`}
                />
                {query && (
                  <button
                    type="button"
                    className="tax-search-clear"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                  >
                    <i className="bi bi-x-lg" aria-hidden="true" />
                  </button>
                )}
              </div>

              {!query && (
                <div className="est-quick">
                  <span className="muted">Common in San Jose:</span>
                  {QUICK_PICKS.map((p) => (
                    <button
                      type="button"
                      key={p.code}
                      onClick={() => choose(findActivity(p.code) ?? null)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}

              <div id={`${ids}-results`} aria-live="polite">
                {query && (
                  <p className="search-status">
                    {search.total === 0
                      ? 'No activity matches. Try a shorter or more general word.'
                      : search.total > search.results.length
                        ? `Showing ${search.results.length} of ${search.total} matches. Add a word to narrow it down.`
                        : `${search.total} ${search.total === 1 ? 'match' : 'matches'}`}
                  </p>
                )}
                {search.results.length > 0 && (
                  <ul className="est-results">
                    {search.results.map((a) => (
                      <li key={a.code}>
                        <button type="button" onClick={() => choose(a)}>
                          <span className="est-result-code">{a.code}</span>
                          <span className="est-result-title">{a.title}</span>
                          <span className="est-result-tax">
                            {ruleFor(a).tax
                              ? `Business tax ${ruleFor(a).tax}`
                              : 'No business tax code'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>

        {/* Step 2: details */}
        <section
          className={`est-step${activity ? '' : ' is-locked'}`}
          aria-labelledby={`${ids}-s2`}
        >
          <h2 id={`${ids}-s2`}>
            <span className="est-step-num">2</span> About your business
          </h2>
          {!activity ? (
            <p className="est-help">Choose an activity first.</p>
          ) : (
            <div className="est-fields">
              <fieldset className="est-field est-segment">
                <legend>Application</legend>
                {(
                  [
                    ['renewal', 'Renewal'],
                    ['new', 'New business'],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name={`${ids}-applicant`}
                      value={value}
                      checked={applicant === value}
                      onChange={() => setApplicant(value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </fieldset>

              {applicant === 'renewal' && rule?.tax && (
                <div className="est-field">
                  <label htmlFor={`${ids}-gross`}>Gross sales or receipts last year</label>
                  <div className="est-input est-input-peso">
                    <input
                      id={`${ids}-gross`}
                      inputMode="decimal"
                      placeholder="0.00"
                      value={gross}
                      onChange={(e) => setGross(e.target.value)}
                    />
                  </div>
                  <small>From January to December of the year before.</small>
                </div>
              )}

              <div className="est-field">
                <label htmlFor={`${ids}-area`}>Floor area</label>
                <div className="est-input est-input-unit" data-unit="sq m">
                  <input
                    id={`${ids}-area`}
                    inputMode="decimal"
                    placeholder="0"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </div>
                <small>
                  For the sanitary fee. The schedule does not print the unit; square metres is
                  usual.
                </small>
              </div>

              <div className="est-field">
                <label htmlFor={`${ids}-emp`}>Number of employees</label>
                <div className="est-input">
                  <input
                    id={`${ids}-emp`}
                    inputMode="numeric"
                    placeholder="0"
                    value={employees}
                    onChange={(e) => setEmployees(e.target.value)}
                  />
                </div>
                <small>For the health and occupational fees.</small>
              </div>

              {permitCode?.kind === 'tiered' && (
                <div className="est-field">
                  <label htmlFor={`${ids}-permit`}>{permitCode.column} (mayor’s permit)</label>
                  <select
                    id={`${ids}-permit`}
                    value={permitRow}
                    onChange={(e) => setPermitRow(e.target.value)}
                  >
                    <option value="">Choose…</option>
                    {permitCode.rows.map((r, i) => (
                      <option key={r.label} value={i}>
                        {r.label}: {peso(r.amount)}
                      </option>
                    ))}
                  </select>
                  <small>The Treasurer’s Office decides which size class applies to you.</small>
                </div>
              )}

              <div className="est-field est-field-wide">
                <label htmlFor={`${ids}-garbage`}>Type of establishment (garbage fee)</label>
                <select
                  id={`${ids}-garbage`}
                  value={garbage}
                  onChange={(e) => setGarbage(e.target.value)}
                >
                  <option value="">Choose…</option>
                  {garbageOptions.map((g: TieredCode) => (
                    <optgroup
                      key={g.code}
                      label={`${g.code} ${g.title}${g.code === rule?.garbage ? ' (suggested)' : ''}`}
                    >
                      {g.rows.map((r, i) => (
                        <option key={r.label} value={`${g.code}:${i}`}>
                          {r.label}: {peso(r.amount)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Estimate */}
      <aside className="est-result" aria-live="polite" aria-labelledby={`${ids}-total`}>
        <p className="est-result-eyebrow">Estimated yearly charges</p>
        <p className="est-total" id={`${ids}-total`}>
          {result ? peso(result.total) : '—'}
        </p>
        {!result ? (
          <p className="est-help">Choose what your business does to start.</p>
        ) : (
          <>
            {result.pending > 0 && (
              <p className="est-pending">
                <i className="bi bi-info-circle" aria-hidden="true" /> {result.pending}{' '}
                {result.pending === 1 ? 'item needs' : 'items need'} an answer before it counts.
              </p>
            )}
            <ul className="est-items">
              {result.items.map((item) => (
                <li key={item.key} className={`is-${item.status}`}>
                  <div className="est-item-head">
                    <span className="est-item-label">
                      {item.label}
                      {item.code && (
                        <a href={codeHref(item.code)} className="est-item-code">
                          {item.code}
                        </a>
                      )}
                    </span>
                    <span className="est-item-amount">
                      {item.status === 'ok' ? peso(item.amount) : STATUS_TEXT[item.status]}
                    </span>
                  </div>
                  <p className="est-item-detail">{item.detail}</p>
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="est-fineprint">
          An estimate from the schedules printed {PRINTED_ON}, not an assessment. It leaves out the
          barangay clearance, fire safety inspection fee, community tax certificate, and any
          surcharges or penalties. If you have more than one line of business, estimate each one.
          The City Treasurer’s Office computes what you owe.
        </p>
      </aside>
    </div>
  );
}
