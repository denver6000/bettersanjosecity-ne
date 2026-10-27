import type { Metadata } from 'next';
import ErrorPage from '@/components/ErrorPage';

// Exported as 403.html; public/.htaccess points ErrorDocument 401/403 here.
export const metadata: Metadata = {
  title: 'Access Denied',
  robots: { index: false },
};

export default function Forbidden() {
  return (
    <ErrorPage
      code="403"
      title="Access Denied"
      desc="You do not have permission to view this page."
    />
  );
}
