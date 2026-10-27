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
      badgeIcon="bi-pie-chart-fill"
      title="Budget & Transparency"
      subtitle="How the City Government of San Jose raises and spends public funds"
    >
      <div className="pending-grid">
        <DataPending title="Income & Expenditure" icon="bi-cash-stack">
          Annual revenue and spending from BLGF Statements of Receipts and Expenditures.
        </DataPending>
        <DataPending title="Annual Budget" icon="bi-wallet2">
          Approved annual budget by sector and office.
        </DataPending>
        <DataPending title="Infrastructure Projects" icon="bi-cone-striped">
          Ongoing and completed public works within the city.
        </DataPending>
      </div>
    </PageShell>
  );
}
