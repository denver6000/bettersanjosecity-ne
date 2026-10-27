import Link from 'next/link';

/**
 * Header: emblem + "BetterLGU / San Jose City" wordmark (the logo's own lettering is
 * unreadable at header size). Footer (`footer`): the full stacked logo on a white card,
 * since its blue and gold lose contrast on the dark footer.
 */
export default function BrandLockup({ footer = false }: { footer?: boolean }) {
  if (footer) {
    return (
      <Link href="/" className="brand-card" aria-label="BetterLGU San Jose City home">
        <img
          src="/assets/images/logo/logo-full.png"
          alt="BetterLGU San Jose City"
          className="brand-card-logo"
          width={168}
          height={160}
          loading="lazy"
        />
      </Link>
    );
  }

  return (
    <Link href="/" className="brand-lockup" aria-label="BetterLGU San Jose City home">
      <img
        src="/assets/images/logo/logo-emblem.png"
        alt=""
        className="brand-logo"
        width={58}
        height={56}
      />
      <span className="brand-wordmark">
        <span className="brand-name">BetterLGU</span>
        <span className="brand-sub">San Jose City</span>
      </span>
    </Link>
  );
}
