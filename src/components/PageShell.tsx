import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { T } from '@/i18n/LanguageContext';

interface PageShellProps {
  /** i18n key prefix: pg-<k>-badge (breadcrumb) / -title / -sub. */
  k?: string;
  /** Short label for the breadcrumb. */
  badge: string;
  title: string;
  subtitle: string;
  /** Parent pages between Home and this one, e.g. the schedules above the estimator. */
  parents?: { href: string; label: string; k?: string }[];
  /** The page's sections; three or more add an "On this page" list on wide screens. */
  sections?: { id: string; k: string; label: string }[];
  children: ReactNode;
}

/** Breadcrumbs, title and intro on the page background, then the content shared by every inner page. */
export default function PageShell({
  k,
  badge,
  title,
  subtitle,
  parents = [],
  sections = [],
  children,
}: PageShellProps) {
  const toc = sections.length >= 3;
  return (
    <>
      <div className="page-intro">
        <div className="container">
          <span id="crumb-label" className="sr-only">
            <T k="breadcrumb-aria">Breadcrumb</T>
          </span>
          <nav className="breadcrumbs" aria-labelledby="crumb-label">
            <Link href="/">
              <T k="breadcrumb-home">Home</T>
            </Link>
            <span>/</span>
            {parents.map((p) => (
              <Fragment key={p.href}>
                <Link href={p.href}>{p.k ? <T k={p.k}>{p.label}</T> : p.label}</Link>
                <span>/</span>
              </Fragment>
            ))}
            <span aria-current="page">{k ? <T k={`pg-${k}-badge`}>{badge}</T> : badge}</span>
          </nav>
          <h1>{k ? <T k={`pg-${k}-title`}>{title}</T> : title}</h1>
          <p className="page-intro-lead">{k ? <T k={`pg-${k}-sub`}>{subtitle}</T> : subtitle}</p>
        </div>
      </div>

      <section className="section page-main">
        <div className={`container page-body${toc ? ' has-toc' : ''}`}>
          {toc && (
            <nav className="page-toc" aria-labelledby="toc-label">
              <p id="toc-label" className="page-toc-label">
                <T k="on-this-page">On this page</T>
              </p>
              <ul>
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}>
                      <T k={s.k}>{s.label}</T>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <div className="page-content">{children}</div>
        </div>
      </section>
    </>
  );
}

/** One honest note for content that isn't ready: what is coming, without empty cards. */
export function PendingNote({
  items,
}: {
  /** i18n key prefix per item: <k>-t (title) and <k>-d (description). */
  items: { k: string; title: string; desc: string }[];
}) {
  return (
    <div className="pending-note" role="note">
      <i className="ph-duotone ph-hourglass" aria-hidden="true" />
      <div>
        <p className="pending-note-lead">
          <T k="pending-note">We&apos;re still gathering this information. Coming to this page:</T>
        </p>
        <ul>
          {items.map((i) => (
            <li key={i.k}>
              <strong>
                <T k={`${i.k}-t`}>{i.title}</T>
              </strong>{' '}
              <T k={`${i.k}-d`}>{i.desc}</T>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
