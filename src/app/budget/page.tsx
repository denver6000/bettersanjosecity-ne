import type { Metadata } from 'next';
import PageShell, { PendingNote } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Transparency',
  description: 'Budget, income, expenditure, and infrastructure project data of San Jose City.',
  alternates: { canonical: '/budget/' },
};

export default function BudgetPage() {
  return (
    <PageShell
      k="budget"
      badge="Transparency"
      title="Budget & transparency"
      subtitle="How the City Government of San Jose raises and spends public funds"
    >
      <PendingNote
        items={[
          {
            k: 'budget-income-expenditure',
            title: 'Income & expenditure',
            desc: 'Annual revenue and spending from BLGF Statements of Receipts and Expenditures.',
          },
          {
            k: 'budget-annual-budget',
            title: 'Annual budget',
            desc: 'Approved annual budget by sector and office.',
          },
          {
            k: 'budget-infrastructure-projects',
            title: 'Infrastructure projects',
            desc: 'Ongoing and completed public works within the city.',
          },
        ]}
      />
    </PageShell>
  );
}
