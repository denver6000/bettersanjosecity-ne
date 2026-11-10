import type { Metadata } from 'next';
import ErrorPage from '@/components/ErrorPage';

// Exported as 500.html; public/.htaccess points ErrorDocument 500/502/503 here.
export const metadata: Metadata = {
  title: 'Something went wrong',
  robots: { index: false },
};

export default function ServerError() {
  return (
    <ErrorPage
      code="500"
      title="Something went wrong"
      desc="The server ran into a problem. Please try again in a few minutes."
    />
  );
}
