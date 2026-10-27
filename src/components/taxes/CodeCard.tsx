'use client';

import { useId, useState, type ReactNode } from 'react';
import {
  codeAnchor,
  findBracket,
  type AppliesTo,
  type GraduatedCode,
  type RevenueCode,
} from '@/data/revenue';
import { isOpenEnded, num, percent, peso, plain } from '@/lib/tax-format';

function AppliesChips({ applies, retirement }: { applies: AppliesTo; retirement?: boolean }) {
  const flags = [
    applies.new && 'New',
    applies.renewal && 'Renewal',
    applies.withEssential && 'With essential',
    applies.higherValueComparison && 'Higher value comparison',
  ].filter(Boolean) as string[];
  return (
    <ul className="chips" aria-label="Marked on the schedule for">
      {flags.map((f) => (
        <li key={f} className={'chip' + (f === 'With essential' ? ' chip-alt' : '')}>
          {f}
        </li>
      ))}
      {retirement === false && <li className="chip chip-off">Not on retirement</li>}
    </ul>
  );
}

function Wording({ code }: { code: RevenueCode }) {
  if (!code.description && !code.enumerated) return null;
  const long = !!code.enumerated || (code.description?.join(' ').length ?? 0) > 260;
  const body = (
    <>
      {code.description?.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {code.enumerated && (
        <ol className="enum">
          {code.enumerated.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ol>
      )}
    </>
  );
  if (!long) return <div className="wording">{body}</div>;
  return (
    <details className="wording wording-collapsible">
      <summary>
        {code.enumerated
          ? `Who this covers: ${code.enumerated.length} kinds of business`
          : 'Read the official wording'}
      </summary>
      {body}
    </details>
  );
}

type FinderResult = ReturnType<typeof findBracket>;

function parseAmount(raw: string): number {
  return raw.trim() === '' ? NaN : Number(raw.replace(/[,₱\s]/g, ''));
}

function BracketFinder({
  code,
  raw,
  setRaw,
  result,
}: {
  code: GraduatedCode;
  raw: string;
  setRaw: (v: string) => void;
  result: FinderResult;
}) {
  const id = useId();
  const value = parseAmount(raw);
  const isPeso = code.unit === 'peso';

  let message: ReactNode = null;
  if (raw.trim() !== '' && !Number.isFinite(value)) {
    message = <span>Type a number, for example {isPeso ? '250000' : '120'}.</span>;
  } else if (result && 'gap' in result) {
    message = (
      <span>
        <strong>No row in the printed schedule covers this {isPeso ? 'amount' : 'area'}.</strong>
        {code.notes?.length ? ' See the note below.' : ''}
      </span>
    );
  } else if (result) {
    const row = code.brackets[result.index];
    const range = `${isPeso ? peso(row.from) : plain(row.from)} ${
      isOpenEnded(row.to) ? 'and above' : `to ${isPeso ? peso(row.to) : plain(row.to)}`
    }`;
    message = (
      <span>
        Row {result.index + 1} ({range}).{' '}
        {row.amount > 0 && (
          <>
            Printed amount <strong>{peso(row.amount)}</strong>
            {row.rate > 0 ? (
              <>
                {' '}
                and a rate of <strong>{percent(row.rate)}</strong>.
              </>
            ) : (
              '.'
            )}
          </>
        )}
        {row.amount === 0 && row.rate > 0 && (
          <>
            No fixed amount; printed rate <strong>{percent(row.rate)}</strong>.
          </>
        )}
      </span>
    );
  }

  return (
    <div className="finder">
      <label htmlFor={id} className="finder-label">
        Find your row
        <span>{isPeso ? 'Gross sales or receipts, in pesos' : 'Business area'}</span>
      </label>
      <div className="finder-row">
        {isPeso && <span className="finder-prefix">₱</span>}
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          placeholder={isPeso ? '250,000' : '120'}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          className={isPeso ? 'has-prefix' : ''}
        />
      </div>
      <p className="finder-result" aria-live="polite">
        {message ?? <span className="muted">The matching row lights up in the table.</span>}
      </p>
    </div>
  );
}

function GraduatedTable({ code, highlight }: { code: GraduatedCode; highlight: number | null }) {
  const isPeso = code.unit === 'peso';
  // Whole-peso bounds drop the ".00" so wide schedules fit a phone; values are unchanged.
  const fmtRange = (n: number) => (Number.isInteger(n) ? plain(n) : num(n));
  return (
    <div className="table-scroll">
      <table className="rates">
        <caption className="sr-only">
          {code.code} {code.title}: printed rows by {code.subject.toLowerCase()}
        </caption>
        <thead>
          <tr>
            <th scope="col">From{isPeso ? ' (₱)' : ''}</th>
            <th scope="col">To{isPeso ? ' (₱)' : ''}</th>
            <th scope="col" className="num">
              Amount
            </th>
            {code.showRate && (
              <th scope="col" className="num">
                Rate
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {code.brackets.map((r, i) => (
            <tr key={i} className={i === highlight ? 'is-match' : undefined}>
              <td>{fmtRange(r.from)}</td>
              <td>
                {isOpenEnded(r.to) ? <span className="open-ended">and above</span> : fmtRange(r.to)}
              </td>
              <td className="num">{peso(r.amount)}</td>
              {code.showRate && (
                <td className="num">
                  {r.rate > 0 ? percent(r.rate) : <span className="dash">–</span>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CodeCard({
  code,
  rowFilter,
  filterRows,
  query,
}: {
  code: RevenueCode;
  /** Indexes of tiered rows that match the active search. */
  rowFilter?: number[];
  filterRows?: boolean;
  query?: string;
}) {
  const [finderRaw, setFinderRaw] = useState('');
  const [showAll, setShowAll] = useState(false);

  return (
    <article className="code-card" id={codeAnchor(code.code)}>
      <header className="code-head">
        <span className="code-pill">{code.code}</span>
        <h3>{code.title}</h3>
        <AppliesChips
          applies={code.applies}
          retirement={code.kind === 'fixed' ? code.retirement : undefined}
        />
      </header>

      <Wording code={code} />

      {code.kind === 'graduated' &&
        (() => {
          const value = parseAmount(finderRaw);
          const result = Number.isFinite(value) ? findBracket(code.brackets, value) : null;
          const highlight = result && 'index' in result ? result.index : null;
          return (
            <>
              <p className="basis">
                Based on <strong>{code.subject.toLowerCase()}</strong> · {code.brackets.length}{' '}
                printed rows
              </p>
              <div className="graduated">
                <GraduatedTable code={code} highlight={highlight} />
                <BracketFinder code={code} raw={finderRaw} setRaw={setFinderRaw} result={result} />
              </div>
            </>
          );
        })()}

      {code.kind === 'flat-rate' && (
        <dl className="facts">
          <div>
            <dt>Based on</dt>
            <dd>{code.subject}</dd>
          </div>
          <div>
            <dt>Printed tax rate</dt>
            <dd className="big">{percent(code.rate)}</dd>
          </div>
          <div>
            <dt>Printed tax amount</dt>
            <dd>{peso(code.amount)}</dd>
          </div>
        </dl>
      )}

      {code.kind === 'fixed' && (
        <dl className="facts">
          <div>
            <dt>Amount</dt>
            <dd className="big">{peso(code.amount)}</dd>
          </div>
          {code.subject && (
            <div>
              <dt>Basis</dt>
              <dd>{code.subject}</dd>
            </div>
          )}
        </dl>
      )}

      {code.kind === 'tiered' &&
        (() => {
          const filtering =
            !!filterRows &&
            !!rowFilter &&
            rowFilter.length > 0 &&
            rowFilter.length < code.rows.length &&
            !showAll;
          const rows = code.rows
            .map((r, i) => ({ ...r, i }))
            .filter((r) => !filtering || rowFilter!.includes(r.i));
          return (
            <>
              <div className="table-scroll">
                <table className="rates tiered">
                  <caption className="sr-only">
                    {code.code} {code.title}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">{code.column}</th>
                      <th scope="col" className="num">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.i}
                        className={query && rowFilter?.includes(r.i) ? 'is-match' : undefined}
                      >
                        <td>{r.label}</td>
                        <td className="num">{peso(r.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtering && (
                <button type="button" className="link-btn" onClick={() => setShowAll(true)}>
                  Show all {code.rows.length} rows
                </button>
              )}
            </>
          );
        })()}

      {code.notes && (
        <aside className="note">
          <p className="note-head">As printed</p>
          <ul>
            {code.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  );
}
