import type { Metadata } from 'next';
import PageShell, { DataPending } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Transparency',
  description: 'Budget, income, expenditure, and infrastructure project data of San Jose City.',
  alternates: { canonical: '/budget/' },
};

export default function BudgetPage() {
  return (
    <PageShell
      badge="Transparency"
      badgeIcon="ph-chart-pie"
      title="Budget & Transparency"
      subtitle="How the City Government of San Jose raises and spends public funds"
    >
      <div className="pending-grid">
        <DataPending title="Income & Expenditure" icon="ph-money">
          Annual revenue and spending from BLGF Statements of Receipts and Expenditures.
        </DataPending>
        <DataPending title="Annual Budget" icon="ph-wallet">
          Approved annual budget by sector and office.
        </DataPending>
        <DataPending title="Infrastructure Projects" icon="ph-traffic-cone">
          Ongoing and completed public works within the city.
        </DataPending>
      </div>
    </PageShell>
  );
}
