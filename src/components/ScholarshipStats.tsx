'use client';

import { useEffect, useId, useState } from 'react';

/** Response of public/api/scholarship-stats.php (the SIS, proxied): counts only, never per-student data. */
interface Stats {
  school_year: string | null;
  school_years: string[];
  semesters: {
    semester: number;
    label: string;
    scholars: number;
    new_grantees: number;
    renewals: number;
    qualified_for_payout: number;
    paid: number;
  }[];
  requirements: { initial: string[]; renewal: string[] };
  generated_at: string;
  /** True when the SIS did not answer and the proxy served its last good copy. */
  stale: boolean;
}

const API_URL = '/api/scholarship-stats.php';
const fmt = new Intl.NumberFormat('en-PH');

/** Live program numbers and requirements from the City Scholarship Program system. */
export default function ScholarshipStats() {
  const ids = useId();
  const [year, setYear] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const query = year ? `?${new URLSearchParams({ school_year: year })}` : '';
    fetch(API_URL + query, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Scholarship API ${res.status}`);
        return res.json() as Promise<Stats>;
      })
      .then((data) => {
        setStats(data);
        setFailed(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setFailed(true);
      });
    return () => controller.abort();
  }, [year]);

  if (failed && !stats) {
    return (
      <p className="scholar-status" role="status">
        The scholarship figures could not be loaded right now. Please try again later.
      </p>
    );
  }
  if (!stats) {
    return (
      <p className="scholar-status" role="status">
        Loading scholarship figures…
      </p>
    );
  }

  const loading = year !== null && stats.school_year !== year;

  return (
    <>
      <section className="scholar-block" aria-labelledby={`${ids}-numbers`}>
        <div className="scholar-block-head">
          <h2 id={`${ids}-numbers`}>Scholars by semester</h2>
          {stats.school_years.length > 0 && (
            <label className="scholar-year">
              <span>School year</span>
              <select
                value={stats.school_year ?? ''}
                onChange={(e) => setYear(e.target.value)}
                disabled={loading}
              >
                {stats.school_years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {stats.semesters.length === 0 ? (
          <p className="scholar-status">No scholar records for this school year yet.</p>
        ) : (
          stats.semesters.map((s) => (
            <div key={s.semester} className="scholar-semester" aria-busy={loading}>
              <h3>
                {stats.school_year}, {s.label}
              </h3>
              <dl className="scholar-stats">
                <div>
                  <dt>Scholars</dt>
                  <dd>{fmt.format(s.scholars)}</dd>
                </div>
                <div>
                  <dt>New grantees</dt>
                  <dd>{fmt.format(s.new_grantees)}</dd>
                </div>
                <div>
                  <dt>Renewing</dt>
                  <dd>{fmt.format(s.renewals)}</dd>
                </div>
                <div>
                  <dt>Qualified for payout</dt>
                  <dd>{fmt.format(s.qualified_for_payout)}</dd>
                </div>
              </dl>
            </div>
          ))
        )}
        <p className="scholar-note">
          Counts from the City Scholarship Program records, updated{' '}
          {new Date(stats.generated_at).toLocaleString('en-PH', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Manila',
          })}
          {stats.stale && ' (latest available; newer figures could not be loaded)'}. “Qualified for
          payout” means the scholarship office has approved the scholar for that semester’s payout.
        </p>
      </section>

      <section className="scholar-block" aria-labelledby={`${ids}-reqs`}>
        <h2 id={`${ids}-reqs`}>Requirements</h2>
        <div className="scholar-reqs">
          <div>
            <h3>New grantees</h3>
            <ul>
              {stats.requirements.initial.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Renewing scholars, every semester</h3>
            <ul>
              {stats.requirements.renewal.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
