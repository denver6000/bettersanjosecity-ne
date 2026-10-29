import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell, { DataPending } from '@/components/PageShell';
import { SERVICE_CATEGORIES } from '@/config/site';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Directory of San Jose City government services, requirements, fees, and processing times.',
  alternates: { canonical: '/services/' },
};

export default function ServicesPage() {
  return (
    <PageShell
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
                <h3>{c.name}</h3>
                <p>{c.desc}</p>
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
        <DataPending title="Service details coming soon" icon="ph-notebook" as="h2">
          Requirements, fees, and step-by-step guides for each service are being compiled from the
          San Jose City Citizen&apos;s Charter.
        </DataPending>
      </div>
    </PageShell>
  );
}
