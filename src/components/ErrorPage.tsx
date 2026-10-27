import Link from 'next/link';

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
        <h1 className="error-title">{title}</h1>
        <p className="error-desc">{desc}</p>
        <div className="error-actions">
          <Link href="/" className="btn btn-primary">
            Go to Homepage
          </Link>
          <Link href="/services" className="btn btn-secondary">
            Browse Services
          </Link>
        </div>
      </div>
    </section>
  );
}
