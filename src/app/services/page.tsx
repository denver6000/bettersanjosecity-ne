import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell, { DataPending } from '@/components/PageShell';
import { T } from '@/i18n/LanguageContext';
import { SERVICE_CATEGORIES } from '@/config/site';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Directory of San Jose City government services, requirements, fees, and processing times.',
  alternates: { canonical: '/services/' },
};

export default function ServicesPage() {
  return (
    <PageShell
      k="services"
      badge="Services"
      badgeIcon="ph-squares-four"
      title="City Services"
      subtitle="Requirements, fees, and processing times for services of the City Government of San Jose"
    >
      <div className="home-services-grid">
        {SERVICE_CATEGORIES.map((c) => {
          const body = (
            <>
              <div className="home-service-icon">
                <i className={`ph-duotone ${c.icon}`} />
              </div>
              <div className="home-service-content">
                <h3>
                  <T k={`svc-${slug(c.name)}`}>{c.name}</T>
                </h3>
                <p>
                  <T k={`svc-${slug(c.name)}-d`}>{c.desc}</T>
                </p>
              </div>
            </>
          );
          return 'href' in c ? (
            <Link href={c.href} className="home-service-card" key={c.name}>
              {body}
            </Link>
          ) : (
            <div className="home-service-card" key={c.name}>
              {body}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 24 }}>
        <DataPending
          k="services-service-details-coming-soon"
          title="Service details coming soon"
          icon="ph-notebook"
          as="h2"
        >
          Requirements, fees, and step-by-step guides for each service are being compiled from the
          San Jose City Citizen&apos;s Charter.
        </DataPending>
      </div>
    </PageShell>
  );
}
