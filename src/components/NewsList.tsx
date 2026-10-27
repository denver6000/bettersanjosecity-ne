import Link from 'next/link';
import { formatDate, news, safeUrl } from '@/lib/data';
import { DataPending } from './PageShell';

const EMPTY = 'News and advisories from the City Government of San Jose will appear here.';

/** Three latest items for the homepage. */
export function HomeNews() {
  const items = news.slice(0, 3);
  if (!items.length) {
    return (
      <DataPending title="No updates yet" icon="bi-newspaper">
        {EMPTY}
      </DataPending>
    );
  }
  return (
    <>
      {items.map((a) => {
        const url = safeUrl(a.url);
        return (
          <article className="home-news-card" key={a.id}>
            <div className="home-news-meta">
              <span className={`home-news-badge home-news-badge--${a.badge ?? 'info'}`}>
                {a.category}
              </span>
              <span className="home-news-date">{formatDate(a.date)}</span>
            </div>
            <h3>
              {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {a.title}
                </a>
              ) : (
                <Link href="/news">{a.title}</Link>
              )}
            </h3>
            <p>{a.summary}</p>
          </article>
        );
      })}
    </>
  );
}

/** Full list for /news. */
export function NewsGrid() {
  if (!news.length) {
    return (
      <DataPending title="No updates yet" icon="bi-newspaper" as="h2">
        {EMPTY}
      </DataPending>
    );
  }
  return (
    <div className="news-grid" id="news-grid">
      {news.map((a) => {
        const url = safeUrl(a.url);
        return (
          <article className="news-card" key={a.id} aria-label={a.title}>
            <div className="news-card-header">
              <span className={`badge badge-${a.badge ?? 'info'}`}>{a.category}</span>
              <span className="news-card-date">{formatDate(a.date)}</span>
            </div>
            <div className="news-card-body">
              <h3 className="news-card-title">
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {a.title}
                  </a>
                ) : (
                  a.title
                )}
              </h3>
              <p className="news-card-desc">{a.summary}</p>
            </div>
            {url && (
              <div className="news-card-footer">
                <a
                  className="news-card-source"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {a.source || 'Read more'} <i className="bi bi-arrow-right" aria-hidden="true" />
                </a>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
