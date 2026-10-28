'use client';

import { useId, useState, type FormEvent } from 'react';

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

/** Same wording as the SIS eligibility page. */
const STATUS: Record<
  Cycle['status'],
  { title: string; icon: string; text: (label: string) => string }
> = {
  eligible: {
    title: 'Eligible for payout',
    icon: 'bi-check-circle-fill',
    text: (label) => `You are qualified and your requirements are complete for ${label}.`,
  },
  payrolled: {
    title: 'Included in payroll',
    icon: 'bi-cash-stack',
    text: (label) => `Your payout for ${label} has already been processed.`,
  },
  not_eligible: {
    title: 'Not yet eligible',
    icon: 'bi-hourglass-split',
    text: () => '',
  },
};

async function post<T>(query: string, body: object): Promise<T> {
  const res = await fetch(API_URL + query, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      data?.error ?? 'The scholar lookup is unavailable right now. Please try again later.'
    );
  }
  return data as T;
}

/** Scholars look up their record, payout status and requirements by Student ID. */
export default function ScholarLookup() {
  const ids = useId();
  const [studentId, setStudentId] = useState('');
  const [searched, setSearched] = useState('');
  const [result, setResult] = useState<Lookup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function search(e: FormEvent) {
    e.preventDefault();
    const id = studentId.trim();
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      setResult(await post<Lookup>('', { student_id: id }));
      setSearched(id);
    } catch (err) {
      setResult(null);
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="scholar-block scholar-lookup" aria-labelledby={`${ids}-title`}>
      <h2 id={`${ids}-title`}>Look up your scholarship record</h2>
      <p>
        Enter your Student ID to see your record, whether you are cleared for each semester’s payout
        and which requirements are still missing.
      </p>
      <form className="scholar-search" onSubmit={search} role="search">
        <label htmlFor={`${ids}-id`}>Student ID</label>
        <input
          id={`${ids}-id`}
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          maxLength={50}
          autoComplete="off"
          spellCheck={false}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={busy}>
          <i className="bi bi-search" aria-hidden="true" /> {busy ? 'Searching…' : 'Search'}
        </button>
      </form>

      <div aria-live="polite">
        {error && (
          <p className="scholar-result-msg is-error" role="alert">
            {error}
          </p>
        )}
        {result && result.scholars.length === 0 && (
          <div className="scholar-result-msg">
            <strong>No student found</strong>
            <span>
              No record matches “{searched}”. Check the Student ID and try again, or visit the
              scholarship office.
            </span>
          </div>
        )}
        {result?.scholars.map((s) => (
          <ScholarCard key={s.ref} scholar={s} fields={result.update_fields} />
        ))}
      </div>
    </section>
  );
}

function ScholarCard({ scholar, fields }: { scholar: Scholar; fields: Record<string, string> }) {
  return (
    <article className="scholar-card">
      <header className="scholar-card-head">
        <h3>{scholar.full_name}</h3>
        <dl>
          <div>
            <dt>Student ID</dt>
            <dd>{scholar.student_id}</dd>
          </div>
          {scholar.student_number && (
            <div>
              <dt>Student number</dt>
              <dd>{scholar.student_number}</dd>
            </div>
          )}
        </dl>
      </header>

      {scholar.cycles.length === 0 ? (
        <p className="scholar-status">No semester records yet.</p>
      ) : (
        scholar.cycles.map((c) => <CycleRow key={c.label} cycle={c} />)
      )}

      <UpdateRequest scholar={scholar} fields={fields} />
    </article>
  );
}

function CycleRow({ cycle }: { cycle: Cycle }) {
  const status = STATUS[cycle.status];
  const details = [
    cycle.school,
    cycle.course,
    cycle.year_level && `Year ${cycle.year_level}`,
    cycle.batch && `Batch ${cycle.batch}`,
  ].filter(Boolean);

  return (
    <section className={`scholar-cycle is-${cycle.status}`}>
      <div className="scholar-cycle-head">
        <h4>{cycle.label}</h4>
        <span className="scholar-track">
          {cycle.payout_track === 'renewal' ? 'Renewing scholar' : 'New grantee'}
        </span>
      </div>
      {details.length > 0 && <p className="scholar-cycle-details">{details.join(' · ')}</p>}

      <p className="scholar-cycle-status">
        <i className={`bi ${status.icon}`} aria-hidden="true" />
        <span>
          <strong>{status.title}</strong>
          {cycle.status === 'not_eligible' ? (
            !cycle.qualified && (
              <span>
                Your qualification for {cycle.label} has not been confirmed by the office.
              </span>
            )
          ) : (
            <span>{status.text(cycle.label)}</span>
          )}
        </span>
      </p>

      <h5>Requirements</h5>
      <ul className="scholar-checklist">
        {cycle.requirements.map((r) => (
          <li key={r.label} className={r.met ? 'is-met' : 'is-missing'}>
            <i className={`bi ${r.met ? 'bi-check-lg' : 'bi-x-lg'}`} aria-hidden="true" />
            {r.label}
            <span className="sr-only">{r.met ? ', submitted' : ', missing'}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function UpdateRequest({ scholar, fields }: { scholar: Scholar; fields: Record<string, string> }) {
  const ids = useId();
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
      const res = await post<{ message: string }>('?action=update', {
        student_id: scholar.student_id,
        ref: scholar.ref,
        field,
        submitted_value: value,
        submitter_contact: contact || null,
      });
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
      <summary>Something wrong with your details?</summary>
      {sent ? (
        <p className="scholar-result-msg is-sent" role="status">
          {sent}
        </p>
      ) : (
        <form onSubmit={submit}>
          <label htmlFor={`${ids}-field`}>What needs updating</label>
          <select id={`${ids}-field`} value={field} onChange={(e) => setField(e.target.value)}>
            {Object.entries(fields).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <label htmlFor={`${ids}-value`}>Correct value</label>
          <input
            id={`${ids}-value`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={500}
            required
          />
          <label htmlFor={`${ids}-contact`}>Your contact (optional)</label>
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
            {busy ? 'Sending…' : 'Send update'}
          </button>
          <p className="scholar-note">
            The scholarship office reviews every update before changing your record.
          </p>
        </form>
      )}
    </details>
  );
}
