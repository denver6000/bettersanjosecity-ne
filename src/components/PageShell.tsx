import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { T } from '@/i18n/LanguageContext';

interface PageShellProps {
  badge: string;
  badgeIcon: string;
  title: string;
  subtitle: string;
  /** Parent pages between Home and this one, e.g. the schedules above the estimator. */
  parents?: { href: string; label: string }[];
  children: ReactNode;
}

/** Breadcrumbs + page header + content section shared by every inner page. */
export default function PageShell({
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
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">
            <T k="breadcrumb-home">Home</T>
          </Link>
          <span>/</span>
          {parents.map((p) => (
            <Fragment key={p.href}>
              <Link href={p.href}>{p.label}</Link>
              <span>/</span>
            </Fragment>
          ))}
          <span aria-current="page">{badge}</span>
        </nav>
      </div>

      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="page-header-badge">
              <i className={`ph ${badgeIcon}`} /> {badge}
            </span>
            <h1>{title}</h1>
            <p className="page-header-desc">{subtitle}</p>
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
  title,
  icon = 'ph-hourglass',
  children,
  as: Heading = 'h3',
}: {
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
        <Heading>{title}</Heading>
        <p>{children}</p>
      </div>
    </div>
  );
}
