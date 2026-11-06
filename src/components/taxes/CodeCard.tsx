'use client';

import { useId, useState, type ReactNode } from 'react';
import {
  codeAnchor,
  findBracket,
  type AppliesTo,
  type GraduatedCode,
  type RevenueCode,
} from '@/data/revenue';
import { useLanguage } from '@/i18n/LanguageContext';
import { isOpenEnded, num, percent, peso, plain } from '@/lib/tax-format';

function AppliesChips({ applies, retirement }: { applies: AppliesTo; retirement?: boolean }) {
  const { t } = useLanguage();
  const flags = [
    applies.new && { k: 'bt-chip-new', en: 'New' },
    applies.renewal && { k: 'bt-chip-renewal', en: 'Renewal' },
    applies.withEssential && { k: 'bt-chip-essential', en: 'With essential', alt: true },
    applies.higherValueComparison && { k: 'bt-chip-higher', en: 'Higher value comparison' },
  ].filter(Boolean) as { k: string; en: string; alt?: boolean }[];
  return (
    <ul className="chips" aria-label={t('bt-chips-aria', 'Marked on the schedule for')}>
      {flags.map((f) => (
        <li key={f.k} className={'chip' + (f.alt ? ' chip-alt' : '')}>
          {t(f.k, f.en)}
        </li>
      ))}
      {retirement === false && (
        <li className="chip chip-off">{t('bt-chip-no-retire', 'Not on retirement')}</li>
      )}
    </ul>
  );
}

function Wording({ code }: { code: RevenueCode }) {
  const { t } = useLanguage();
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
          ? t('bt-who-covers', 'Who this covers: {n} kinds of business').replace(
              '{n}',
              String(code.enumerated.length)
            )
          : t('bt-official-wording', 'Read the official wording')}
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
  const { t } = useLanguage();
  const id = useId();
  const value = parseAmount(raw);
  const isPeso = code.unit === 'peso';

  let message: ReactNode = null;
  if (raw.trim() !== '' && !Number.isFinite(value)) {
    message = (
      <span>
        {t('bt-type-number', 'Type a number, for example {n}.').replace(
          '{n}',
          isPeso ? '250000' : '120'
        )}
      </span>
    );
  } else if (result && 'gap' in result) {
    message = (
      <span>
        <strong>
          {isPeso
            ? t('bt-no-row-amount', 'No row in the printed schedule covers this amount.')
            : t('bt-no-row-area', 'No row in the printed schedule covers this area.')}
        </strong>
        {code.notes?.length ? ` ${t('bt-see-note', 'See the note below.')}` : ''}
      </span>
    );
  } else if (result) {
    const row = code.brackets[result.index];
    const range = `${isPeso ? peso(row.from) : plain(row.from)} ${
      isOpenEnded(row.to)
        ? t('bt-and-above', 'and above')
        : t('bt-range-to', 'to {n}').replace('{n}', isPeso ? peso(row.to) : plain(row.to))
    }`;
    message = (
      <span>
        {t('bt-row', 'Row {n} ({range}).')
          .replace('{n}', String(result.index + 1))
          .replace('{range}', range)}{' '}
        {row.amount > 0 && (
          <>
            {t('bt-printed-amount', 'Printed amount')} <strong>{peso(row.amount)}</strong>
            {row.rate > 0 ? (
              <>
                {' '}
                {t('bt-and-rate', 'and a rate of')} <strong>{percent(row.rate)}</strong>.
              </>
            ) : (
              '.'
            )}
          </>
        )}
        {row.amount === 0 && row.rate > 0 && (
          <>
            {t('bt-no-fixed', 'No fixed amount; printed rate')} <strong>{percent(row.rate)}</strong>
            .
          </>
        )}
      </span>
    );
  }

  return (
    <div className="finder">
      <label htmlFor={id} className="finder-label">
        {t('bt-find-row', 'Find your row')}
        <span>
          {isPeso
            ? t('bt-find-peso', 'Gross sales or receipts, in pesos')
            : t('bt-find-area', 'Business area')}
        </span>
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
        {message ?? (
          <span className="muted">
            {t('bt-row-lights', 'The matching row lights up in the table.')}
          </span>
        )}
      </p>
    </div>
  );
}

function GraduatedTable({ code, highlight }: { code: GraduatedCode; highlight: number | null }) {
  const { t } = useLanguage();
  const isPeso = code.unit === 'peso';
  // Whole-peso bounds drop the ".00" so wide schedules fit a phone; values are unchanged.
  const fmtRange = (n: number) => (Number.isInteger(n) ? plain(n) : num(n));
  return (
    <div className="table-scroll">
      <table className="rates">
        <caption className="sr-only">
          {t('bt-caption-rows', '{code} {title}: printed rows by {subject}')
            .replace('{code}', code.code)
            .replace('{title}', code.title)
            .replace('{subject}', code.subject.toLowerCase())}
        </caption>
        <thead>
          <tr>
            <th scope="col">
              {t('bt-from', 'From')}
              {isPeso ? ' (₱)' : ''}
            </th>
            <th scope="col">
              {t('bt-to', 'To')}
              {isPeso ? ' (₱)' : ''}
            </th>
            <th scope="col" className="num">
              {t('bt-g-amount', 'Amount')}
            </th>
            {code.showRate && (
              <th scope="col" className="num">
                {t('bt-g-rate', 'Rate')}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {code.brackets.map((r, i) => (
            <tr key={i} className={i === highlight ? 'is-match' : undefined}>
              <td>{fmtRange(r.from)}</td>
              <td>
                {isOpenEnded(r.to) ? (
                  <span className="open-ended">{t('bt-and-above', 'and above')}</span>
                ) : (
                  fmtRange(r.to)
                )}
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
  const { t } = useLanguage();
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
                {t('bt-based-on', 'Based on')} <strong>{code.subject.toLowerCase()}</strong> ·{' '}
                {t('bt-n-rows', '{n} printed rows').replace('{n}', String(code.brackets.length))}
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
            <dt>{t('bt-based-on', 'Based on')}</dt>
            <dd>{code.subject}</dd>
          </div>
          <div>
            <dt>{t('bt-tax-rate', 'Printed tax rate')}</dt>
            <dd className="big">{percent(code.rate)}</dd>
          </div>
          <div>
            <dt>{t('bt-tax-amount', 'Printed tax amount')}</dt>
            <dd>{peso(code.amount)}</dd>
          </div>
        </dl>
      )}

      {code.kind === 'fixed' && (
        <dl className="facts">
          <div>
            <dt>{t('bt-g-amount', 'Amount')}</dt>
            <dd className="big">{peso(code.amount)}</dd>
          </div>
          {code.subject && (
            <div>
              <dt>{t('bt-basis', 'Basis')}</dt>
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
                        {t('bt-g-amount', 'Amount')}
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
                  {t('bt-show-n', 'Show all {n} rows').replace('{n}', String(code.rows.length))}
                </button>
              )}
            </>
          );
        })()}

      {code.notes && (
        <aside className="note">
          <p className="note-head">{t('bt-as-printed', 'As printed')}</p>
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
