import Link from 'next/link';
import { T } from '@/i18n/LanguageContext';

export default function ErrorPage({
  code,
  title,
  desc,
}: {
  code: string;
  title: string;
  desc: string;
}) {
  return (
    <section
      className="error-page"
      style={{
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <div className="container" style={{ textAlign: 'center' }}>
        <span className="error-code">{code}</span>
        <h1 className="error-title">
          <T k={`err-${code}-t`}>{title}</T>
        </h1>
        <p className="error-desc">
          <T k={`err-${code}-d`}>{desc}</T>
        </p>
        <div className="error-actions">
          <Link href="/" className="btn btn-primary">
            <T k="err-home">Go to Homepage</T>
          </Link>
          <Link href="/services" className="btn btn-secondary">
            <T k="err-services">Browse services</T>
          </Link>
        </div>
      </div>
    </section>
  );
}
