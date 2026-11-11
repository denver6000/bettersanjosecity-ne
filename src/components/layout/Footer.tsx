import type { ReactNode } from 'react';
import Link from 'next/link';
import { T } from '@/i18n/LanguageContext';
import { SITE } from '@/config/site';
import pkg from '../../../package.json';
import BrandLockup from './BrandLockup';

type FooterLink = { href: string; label: string; k?: string };

/** Pages on this site, in footer order. */
const QUICK_LINKS: FooterLink[] = [
  { href: '/business-taxes', k: 'foot-business-taxes', label: 'Business taxes and fees' },
  { href: '/business-taxes/estimator', k: 'foot-estimator', label: 'Business tax estimator' },
  { href: '/sitemap', k: 'home-sitemap', label: 'Sitemap' },
  { href: '/terms', k: 'home-terms-of-use', label: 'Terms of use' },
  { href: '/privacy', k: 'home-privacy-policy', label: 'Privacy policy' },
  { href: '/accessibility', k: 'home-accessibility', label: 'Accessibility' },
  { href: '/faq', label: 'FAQ' },
];

/** National portals, opened in a new tab. */
const RESOURCES: FooterLink[] = [
  { href: 'https://data.gov.ph', label: 'Open Data Philippines' },
  { href: 'https://www.foi.gov.ph/', k: 'foot-foi', label: 'Freedom of Information' },
  { href: 'https://blgf.gov.ph/', label: 'BLGF Portal' },
  { href: 'https://cmci.dti.gov.ph/', label: 'CMCI DTI Portal' },
];

const text = ({ k, label }: FooterLink) => (k ? <T k={k}>{label}</T> : label);

function LinkColumn({
  titleKey,
  title,
  children,
}: {
  titleKey: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="footer-column">
      <h2>
        <T k={titleKey}>{title}</T>
      </h2>
      <ul className="footer-links-new">{children}</ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main-new">
          <div className="footer-brand">
            <BrandLockup footer />
            <p className="footer-tagline">
              <T k="footer-tagline">{SITE.tagline}</T>
            </p>
          </div>

          <LinkColumn titleKey="home-quick-links" title="Quick links">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{text(l)}</Link>
              </li>
            ))}
          </LinkColumn>

          <LinkColumn titleKey="home-resources" title="Resources">
            {RESOURCES.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer">
                  {text(l)}
                </a>
              </li>
            ))}
          </LinkColumn>

          <div className="footer-column">
            <div className="footer-cost" role="status">
              <T k="foot-cost">Cost to the People of San Jose =</T>{' '}
              <span className="footer-cost-value">₱0</span>
            </div>
            <div className="footer-partners">
              <a
                href="https://bettergov.ph"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BetterGov.ph"
              >
                <img
                  src="/assets/images/logo/bettergov-footer.svg"
                  alt="BetterGov.ph"
                  className="footer-partner-logo"
                  width={120}
                  height={28}
                  loading="lazy"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom-new">
          <div className="footer-copyright">
            <span className="footer-copyright-text">&copy; 2026 {SITE.name}</span>
            <span className="footer-copyright-license">MIT | CC BY 4.0</span>
            <span className="footer-copyright-credits">
              <T k="foot-credits">Built by Kurt Vincent F. Fariñas and Denver M. Ballesteros</T>
            </span>
            <span className="footer-copyright-disclaimer">
              <T k="foot-disclaimer">
                Information on this site comes from official government sources.
              </T>
            </span>
            <span className="footer-version">
              <i className="ph ph-package" aria-hidden="true" /> Ver. {pkg.version}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
