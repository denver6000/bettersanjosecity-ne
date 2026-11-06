'use client';

import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { T, useLanguage } from '@/i18n/LanguageContext';

/** Response of public/api/scholar-lookup.php (the SIS, proxied). */
interface Lookup {
  scholars: Scholar[];
  /** Student fields a scholar may send a correction for: { column: label }. */
  update_fields: Record<string, string>;
}

interface Scholar {
  ref: number;
  student_id: string;
  full_name: string;
  student_number: string | null;
  cycles: Cycle[];
}

interface Cycle {
  label: string;
  payout_track: 'initial' | 'renewal';
  school: string | null;
  course: string | null;
  year_level: string | null;
  batch: string | null;
  status: 'eligible' | 'payrolled' | 'not_eligible';
  qualified: boolean;
  requirements: { label: string; met: boolean }[];
}

const API_URL = '/api/scholar-lookup.php';

/** Same wording as the SIS eligibility page; `{n}` in a text is the semester label. */
const STATUS: Record<
  Cycle['status'],
  { title: [string, string]; icon: string; text: [string, string] | null }
> = {
  eligible: {
    title: ['sch-st-eligible', 'Eligible for payout'],
    icon: 'ph-check-circle',
    text: ['sch-st-eligible-d', 'You are qualified and your requirements are complete for {n}.'],
  },
  payrolled: {
    title: ['sch-st-payrolled', 'Included in payroll'],
    icon: 'ph-money',
    text: ['sch-st-payrolled-d', 'Your payout for {n} has already been processed.'],
  },
  not_eligible: {
    title: ['sch-st-not-eligible', 'Not yet eligible'],
    icon: 'ph-hourglass',
    text: null,
  },
};

async function post<T>(query: string, body: object, fallback: string): Promise<T> {
  const res = await fetch(API_URL + query, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error ?? fallback);
  }
  return data as T;
}

/**
 * Scholars look up their record, payout status and requirements by Student ID.
 * `heading={false}` when the page around it already titles the section (the home page); it also
 * selects the compact home-band presentation (visible label, no lock note, plain status icons).
 */
export default function ScholarLookup({
  heading = true,
  submitLabel,
}: {
  heading?: boolean;
  submitLabel?: ReactNode;
}) {
  const ids = useId();
  const { t } = useLanguage();
  const [studentId, setStudentId] = useState('');
  const [searched, setSearched] = useState('');
  const [result, setResult] = useState<Lookup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const unavailable = t(
    'sch-unavailable',
    'The scholar lookup is unavailable right now. Please try again later.'
  );

  async function search(e: FormEvent) {
    e.preventDefault();
    const id = studentId.trim();
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      setResult(await post<Lookup>('', { student_id: id }, unavailable));
      setSearched(id);
    } catch (err) {
      setResult(null);
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="scholar-block scholar-lookup"
      aria-labelledby={heading ? `${ids}-title` : undefined}
      aria-label={heading ? undefined : t('scholar-lookup-aria', 'Scholarship record lookup')}
    >
      {heading && (
        <>
          <h2 id={`${ids}-title`}>{t('sch-lookup-title', 'Look up your scholarship record')}</h2>
          <p>
            {t(
              'sch-lookup-lede',
              'Enter your Student ID to see your record, whether you are cleared for each semester’s payout and which requirements are still missing.'
            )}
          </p>
        </>
      )}
      <form className="scholar-search" onSubmit={search} role="search">
        <i className="ph ph-identification-card scholar-search-icon" aria-hidden="true" />
        <label htmlFor={`${ids}-id`} className={heading ? 'sr-only' : undefined}>
          <T k="scholar-student-id">Student ID</T>
        </label>
        <input
          id={`${ids}-id`}
          placeholder={heading ? t('scholar-student-id', 'Student ID') : undefined}
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          maxLength={50}
          autoComplete="off"
          spellCheck={false}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={busy}>
          <i className="ph ph-magnifying-glass" aria-hidden="true" />{' '}
          {busy
            ? t('sch-searching', 'Searching…')
            : (submitLabel ?? t('hero-search-btn', 'Search'))}
        </button>
      </form>
      {heading && (
        <p className="scholar-lock-note">
          <i className="ph-fill ph-lock-simple" aria-hidden="true" />
          <T k="scholar-lock-note">Shows only your own program record. No contact details.</T>
        </p>
      )}

      <div aria-live="polite">
        {error && (
          <p className="scholar-result-msg is-error" role="alert">
            {error}
          </p>
        )}
        {result && result.scholars.length === 0 && (
          <div className="scholar-result-msg">
            <strong>{t('sch-no-student', 'No student found')}</strong>
            <span>
              {t(
                'sch-no-match',
                'No record matches “{n}”. Check the Student ID and try again, or visit the scholarship office.'
              ).replace('{n}', searched)}
            </span>
          </div>
        )}
        {result?.scholars.map((s) => (
          <ScholarCard key={s.ref} scholar={s} fields={result.update_fields} rich={heading} />
        ))}
      </div>
    </section>
  );
}

function ScholarCard({
  scholar,
  fields,
  rich,
}: {
  scholar: Scholar;
  fields: Record<string, string>;
  /** The scholarship page's fuller styling; the home band keeps the compact one. */
  rich: boolean;
}) {
  const { t } = useLanguage();
  return (
    <article className="scholar-card">
      <header className="scholar-card-head">
        <span className="scholar-avatar" aria-hidden="true">
          <i className="ph-duotone ph-user" />
        </span>
        <h3>{scholar.full_name}</h3>
        <dl>
          <div>
            <dt>{t('scholar-student-id', 'Student ID')}</dt>
            <dd>{scholar.student_id}</dd>
          </div>
          {scholar.student_number && (
            <div>
              <dt>{t('sch-student-number', 'Student number')}</dt>
              <dd>{scholar.student_number}</dd>
            </div>
          )}
        </dl>
      </header>

      {scholar.cycles.length === 0 ? (
        <p className="scholar-status">{t('sch-no-semesters', 'No semester records yet.')}</p>
      ) : (
        <div className="scholar-cycles">
          {scholar.cycles.map((c) => (
            <CycleRow key={c.label} cycle={c} rich={rich} />
          ))}
        </div>
      )}

      <UpdateRequest scholar={scholar} fields={fields} />
    </article>
  );
}

function CycleRow({ cycle, rich }: { cycle: Cycle; rich: boolean }) {
  const { t } = useLanguage();
  const status = STATUS[cycle.status];
  const details = [
    cycle.school,
    cycle.course,
    cycle.year_level && t('sch-year-level', 'Year {n}').replace('{n}', cycle.year_level),
    cycle.batch && t('sch-batch', 'Batch {n}').replace('{n}', cycle.batch),
  ].filter(Boolean);

  return (
    <section className={`scholar-cycle is-${cycle.status}`}>
      <div className="scholar-cycle-head">
        <h4>{cycle.label}</h4>
        <span className="scholar-track">
          {cycle.payout_track === 'renewal'
            ? t('sch-renewing-scholar', 'Renewing scholar')
            : t('sch-new-grantee', 'New grantee')}
        </span>
      </div>
      {details.length > 0 && <p className="scholar-cycle-details">{details.join(' · ')}</p>}

      <p className="scholar-cycle-status">
        <i className={`ph-duotone ${status.icon}`} aria-hidden="true" />
        <span>
          <strong>{t(...status.title)}</strong>
          {cycle.status === 'not_eligible' ? (
            !cycle.qualified && (
              <span>
                {t(
                  'sch-st-unconfirmed',
                  'Your qualification for {n} has not been confirmed by the office.'
                ).replace('{n}', cycle.label)}
              </span>
            )
          ) : (
            <span>{t(...status.text!).replace('{n}', cycle.label)}</span>
          )}
        </span>
      </p>

      <h5>{t('sch-requirements', 'Requirements')}</h5>
      <ul className="scholar-checklist">
        {cycle.requirements.map((r) => (
          <li key={r.label} className={r.met ? 'is-met' : 'is-missing'}>
            <i
              className={
                rich
                  ? r.met
                    ? 'ph-fill ph-check-circle'
                    : 'ph-duotone ph-x-circle'
                  : `ph ${r.met ? 'ph-check' : 'ph-x'}`
              }
              aria-hidden="true"
            />
            {r.label}
            {r.met ? (
              <span className="sr-only">, {t('scholar-req-submitted', 'submitted')}</span>
            ) : (
              <span className="scholar-missing">{t('scholar-req-missing', 'missing')}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function UpdateRequest({ scholar, fields }: { scholar: Scholar; fields: Record<string, string> }) {
  const ids = useId();
  const { t } = useLanguage();
  const [field, setField] = useState(Object.keys(fields)[0] ?? '');
  const [value, setValue] = useState('');
  const [contact, setContact] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await post<{ message: string }>(
        '?action=update',
        {
          student_id: scholar.student_id,
          ref: scholar.ref,
          field,
          submitted_value: value,
          submitter_contact: contact || null,
        },
        t('sch-unavailable', 'The scholar lookup is unavailable right now. Please try again later.')
      );
      setSent(res.message);
      setValue('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="scholar-update">
      <summary>{t('sch-wrong', 'Something wrong with your details?')}</summary>
      {sent ? (
        <p className="scholar-result-msg is-sent" role="status">
          {sent}
        </p>
      ) : (
        <form onSubmit={submit}>
          <label htmlFor={`${ids}-field`}>{t('sch-upd-field', 'What needs updating')}</label>
          <select id={`${ids}-field`} value={field} onChange={(e) => setField(e.target.value)}>
            {Object.entries(fields).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <label htmlFor={`${ids}-value`}>{t('sch-upd-value', 'Correct value')}</label>
          <input
            id={`${ids}-value`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={500}
            required
          />
          <label htmlFor={`${ids}-contact`}>
            {t('sch-upd-contact', 'Your contact (optional)')}
          </label>
          <input
            id={`${ids}-contact`}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            maxLength={120}
          />
          {error && (
            <p className="scholar-result-msg is-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-secondary" disabled={busy}>
            {busy ? t('sch-sending', 'Sending…') : t('sch-send', 'Send update')}
          </button>
          <p className="scholar-note">
            {t(
              'sch-upd-note',
              'The scholarship office reviews every update before changing your record.'
            )}
          </p>
        </form>
      )}
    </details>
  );
}
