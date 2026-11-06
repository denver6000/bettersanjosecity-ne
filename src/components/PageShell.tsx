import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { T } from '@/i18n/LanguageContext';

interface PageShellProps {
  /** i18n key prefix: pg-<k>-badge / -title / -sub. */
  k?: string;
  badge: string;
  badgeIcon: string;
  title: string;
  subtitle: string;
  /** Parent pages between Home and this one, e.g. the schedules above the estimator. */
  parents?: { href: string; label: string; k?: string }[];
  children: ReactNode;
}

/** Breadcrumbs + page header + content section shared by every inner page. */
export default function PageShell({
  k,
  badge,
  badgeIcon,
  title,
  subtitle,
  parents = [],
  children,
}: PageShellProps) {
  return (
    <>
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
      </div>

      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="page-header-badge">
              <i className={`ph ${badgeIcon}`} /> {k ? <T k={`pg-${k}-badge`}>{badge}</T> : badge}
            </span>
            <h1>{k ? <T k={`pg-${k}-title`}>{title}</T> : title}</h1>
            <p className="page-header-desc">{k ? <T k={`pg-${k}-sub`}>{subtitle}</T> : subtitle}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">{children}</div>
      </section>
    </>
  );
}

export function DataPending({
  k,
  title,
  icon = 'ph-hourglass',
  children,
  as: Heading = 'h3',
}: {
  /** i18n key prefix: <k>-t (title) and <k>-d (body, which must be a plain string). */
  k?: string;
  title: string;
  icon?: string;
  children: ReactNode;
  as?: 'h2' | 'h3';
}) {
  return (
    <div className="data-pending">
      <div className="data-pending-icon">
        <i className={`ph-duotone ${icon}`} aria-hidden="true" />
      </div>
      <div>
        <Heading>{k ? <T k={`${k}-t`}>{title}</T> : title}</Heading>
        <p>{k ? <T k={`${k}-d`}>{children as string}</T> : children}</p>
      </div>
    </div>
  );
}
