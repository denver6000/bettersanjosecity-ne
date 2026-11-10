import type { Metadata } from 'next';
import ErrorPage from '@/components/ErrorPage';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <ErrorPage
      code="404"
      title="Page not found"
      desc="The page you are looking for does not exist yet or has moved. Better San Jose is still being built, so please check back soon."
    />
  );
}
