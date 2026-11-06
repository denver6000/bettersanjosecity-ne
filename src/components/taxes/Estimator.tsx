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
import { useLanguage } from '@/i18n/LanguageContext';
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

const STATUS_TEXT: Record<LineItem['status'], { k: string; en: string }> = {
  ok: { k: '', en: '' },
  'needs-input': { k: 'est-s-needs', en: 'Needs an answer' },
  'no-row': { k: 'est-s-norow', en: 'No printed row' },
  'not-charged': { k: 'est-s-notcharged', en: 'Not estimated' },
};

/** i18n key per quick-pick PSIC code; the English label comes from QUICK_PICKS. */
const QUICK_PICK_KEYS: Record<string, string> = {
  '47113': 'est-qp-sari',
  '56105': 'est-qp-carinderia',
  '10611': 'est-qp-ricemill',
  '47731': 'est-qp-agri',
  '47721': 'est-qp-pharmacy',
  '47521': 'est-qp-hardware',
  '96212': 'est-qp-barber',
  '55901': 'est-qp-boarding',
  '95320': 'est-qp-motorcycle',
  '68101': 'est-qp-apartment',
};

/**
 * PSIC search, the visitor's details, and the itemized estimate. The chosen
 * activity lives in `?psic=` so an estimate's starting point can be shared.
 */
export default function Estimator() {
  const { t } = useLanguage();
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
    ? estimate(
        {
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
        },
        t
      )
    : null;

  return (
    <div className="est-layout">
      <div className="est-form">
        {/* Step 1: activity */}
        <section className="est-step" aria-labelledby={`${ids}-s1`}>
          <h2 id={`${ids}-s1`}>
            <span className="est-step-num">1</span>{' '}
            {t('est-s1-title', 'What does your business do?')}
          </h2>

          {activity && rule ? (
            <div className="est-picked">
              <div className="est-picked-head">
                <span className="code-pill">PSIC {activity.code}</span>
                <button type="button" className="link-btn" onClick={() => choose(null)}>
                  {t('est-change', 'Change')}
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
                <i className="ph ph-arrow-bend-down-right" aria-hidden="true" />
                <p>
                  {rule.tax ? (
                    <>
                      {t('est-tax-code', 'Business tax code')}{' '}
                      <a href={codeHref(rule.tax)}>
                        <strong>{rule.tax}</strong> {getCode(rule.tax).title}
                      </a>
                      .{' '}
                    </>
                  ) : (
                    <>{t('est-no-tax-code', 'No business tax code')}. </>
                  )}
                  {t(rule.why.k, rule.why.en)}
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="est-help">
                {t(
                  'est-help-search',
                  'Search PSA’s industry classification ({n}). Use everyday words, like “sari-sari”, “piggery” or “boarding house”, or a PSIC code.'
                ).replace('{n}', PSIC_SOURCE.edition)}
              </p>
              <div className="tax-search" role="search">
                <i className="ph ph-magnifying-glass" aria-hidden="true" />
                <label htmlFor={`${ids}-q`} className="sr-only">
                  {t('est-search-label', 'Search business activities')}
                </label>
                <input
                  id={`${ids}-q`}
                  type="search"
                  autoComplete="off"
                  placeholder={t('est-search-ph', 'What do you sell or do?')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-controls={`${ids}-results`}
                />
                {query && (
                  <button
                    type="button"
                    className="tax-search-clear"
                    onClick={() => setQuery('')}
                    aria-label={t('bt-clear-search', 'Clear search')}
                  >
                    <i className="ph ph-x" aria-hidden="true" />
                  </button>
                )}
              </div>

              {!query && (
                <div className="est-quick">
                  <span className="muted">{t('est-common', 'Common in San Jose:')}</span>
                  {QUICK_PICKS.map((p) => (
                    <button
                      type="button"
                      key={p.code}
                      onClick={() => choose(findActivity(p.code) ?? null)}
                    >
                      {t(QUICK_PICK_KEYS[p.code], p.label)}
                    </button>
                  ))}
                </div>
              )}

              <div id={`${ids}-results`} aria-live="polite">
                {query && (
                  <p className="search-status">
                    {search.total === 0
                      ? t(
                          'est-no-match',
                          'No activity matches. Try a shorter or more general word.'
                        )
                      : search.total > search.results.length
                        ? t(
                            'est-showing',
                            'Showing {n} of {m} matches. Add a word to narrow it down.'
                          )
                            .replace('{n}', String(search.results.length))
                            .replace('{m}', String(search.total))
                        : (search.total === 1
                            ? t('est-match-one', '{n} match')
                            : t('est-match-many', '{n} matches')
                          ).replace('{n}', String(search.total))}
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
                              ? t('est-result-tax', 'Business tax {n}').replace(
                                  '{n}',
                                  ruleFor(a).tax ?? ''
                                )
                              : t('est-no-tax-code', 'No business tax code')}
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
            <span className="est-step-num">2</span> {t('est-s2-title', 'About your business')}
          </h2>
          {!activity ? (
            <p className="est-help">{t('est-choose-first', 'Choose an activity first.')}</p>
          ) : (
            <div className="est-fields">
              <fieldset className="est-field est-segment">
                <legend>{t('est-application', 'Application')}</legend>
                {(
                  [
                    ['renewal', 'est-renewal', 'Renewal'],
                    ['new', 'est-new-business', 'New business'],
                  ] as const
                ).map(([value, labelKey, label]) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name={`${ids}-applicant`}
                      value={value}
                      checked={applicant === value}
                      onChange={() => setApplicant(value)}
                    />
                    <span>{t(labelKey, label)}</span>
                  </label>
                ))}
              </fieldset>

              {applicant === 'renewal' && rule?.tax && (
                <div className="est-field">
                  <label htmlFor={`${ids}-gross`}>
                    {t('est-gross', 'Gross sales or receipts last year')}
                  </label>
                  <div className="est-input est-input-peso">
                    <input
                      id={`${ids}-gross`}
                      inputMode="decimal"
                      placeholder="0.00"
                      value={gross}
                      onChange={(e) => setGross(e.target.value)}
                    />
                  </div>
                  <small>
                    {t('est-gross-help', 'From January to December of the year before.')}
                  </small>
                </div>
              )}

              <div className="est-field">
                <label htmlFor={`${ids}-area`}>{t('est-area', 'Floor area')}</label>
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
                  {t(
                    'est-area-help',
                    'For the sanitary fee. The schedule does not print the unit; square metres is usual.'
                  )}
                </small>
              </div>

              <div className="est-field">
                <label htmlFor={`${ids}-emp`}>{t('est-emp', 'Number of employees')}</label>
                <div className="est-input">
                  <input
                    id={`${ids}-emp`}
                    inputMode="numeric"
                    placeholder="0"
                    value={employees}
                    onChange={(e) => setEmployees(e.target.value)}
                  />
                </div>
                <small>{t('est-emp-help', 'For the health and occupational fees.')}</small>
              </div>

              {permitCode?.kind === 'tiered' && (
                <div className="est-field">
                  <label htmlFor={`${ids}-permit`}>
                    {permitCode.column} {t('est-permit-suffix', '(mayor’s permit)')}
                  </label>
                  <select
                    id={`${ids}-permit`}
                    value={permitRow}
                    onChange={(e) => setPermitRow(e.target.value)}
                  >
                    <option value="">{t('est-choose', 'Choose…')}</option>
                    {permitCode.rows.map((r, i) => (
                      <option key={r.label} value={i}>
                        {r.label}: {peso(r.amount)}
                      </option>
                    ))}
                  </select>
                  <small>
                    {t(
                      'est-permit-help',
                      'The Treasurer’s Office decides which size class applies to you.'
                    )}
                  </small>
                </div>
              )}

              <div className="est-field est-field-wide">
                <label htmlFor={`${ids}-garbage`}>
                  {t('est-garbage', 'Type of establishment (garbage fee)')}
                </label>
                <select
                  id={`${ids}-garbage`}
                  value={garbage}
                  onChange={(e) => setGarbage(e.target.value)}
                >
                  <option value="">{t('est-choose', 'Choose…')}</option>
                  {garbageOptions.map((g: TieredCode) => (
                    <optgroup
                      key={g.code}
                      label={`${g.code} ${g.title}${g.code === rule?.garbage ? ` ${t('est-suggested', '(suggested)')}` : ''}`}
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
        <p className="est-result-eyebrow">{t('est-result-eyebrow', 'Estimated yearly charges')}</p>
        <p className="est-total" id={`${ids}-total`}>
          {result ? peso(result.total) : '—'}
        </p>
        {!result ? (
          <p className="est-help">{t('est-start', 'Choose what your business does to start.')}</p>
        ) : (
          <>
            {result.pending > 0 && (
              <p className="est-pending">
                <i className="ph ph-info" aria-hidden="true" />{' '}
                {(result.pending === 1
                  ? t('est-pending-one', '{n} item needs an answer before it counts.')
                  : t('est-pending-many', '{n} items need an answer before it counts.')
                ).replace('{n}', String(result.pending))}
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
                      {item.status === 'ok'
                        ? peso(item.amount)
                        : t(STATUS_TEXT[item.status].k, STATUS_TEXT[item.status].en)}
                    </span>
                  </div>
                  <p className="est-item-detail">{item.detail}</p>
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="est-fineprint">
          {t(
            'est-fine',
            'An estimate from the schedules printed {n}, not an assessment. It leaves out the barangay clearance, fire safety inspection fee, community tax certificate, and any surcharges or penalties. If you have more than one line of business, estimate each one. The City Treasurer’s Office computes what you owe.'
          ).replace('{n}', PRINTED_ON)}
        </p>
      </aside>
    </div>
  );
}
