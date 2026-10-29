import Link from 'next/link';
import { T } from '@/i18n/LanguageContext';
import { SITE } from '@/config/site';
import pkg from '../../../package.json';
import BrandLockup from './BrandLockup';

const RESOURCES = [
  { href: 'https://data.gov.ph', label: 'Open Data Philippines' },
  { href: 'https://www.foi.gov.ph/', label: 'Freedom of Information' },
  { href: 'https://blgf.gov.ph/', label: 'BLGF Portal' },
  { href: 'https://cmci.dti.gov.ph/', label: 'CMCI DTI Portal' },
];

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
          <div className="footer-column">
            <h4>
              <T k="home-quick-links">Quick Links</T>
            </h4>
            <ul className="footer-links-new">
              <li>
                <Link href="/business-taxes">Business Taxes and Fees</Link>
              </li>
              <li>
                <Link href="/business-taxes/estimator">Business Tax Estimator</Link>
              </li>
              <li>
                <Link href="/sitemap">
                  <T k="home-sitemap">Sitemap</T>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <T k="home-terms-of-use">Terms of Use</T>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <T k="home-privacy-policy">Privacy Policy</T>
                </Link>
              </li>
              <li>
                <Link href="/accessibility">
                  <T k="home-accessibility">Accessibility</T>
                </Link>
              </li>
              <li>
                <Link href="/faq">FAQ</Link>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>
              <T k="home-resources">Resources</T>
            </h4>
            <ul className="footer-links-new">
              {RESOURCES.map((r) => (
                <li key={r.href}>
                  <a href={r.href} target="_blank" rel="noopener noreferrer">
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-column">
            <div
              className="footer-cost"
              role="status"
              aria-label="Cost to the People of San Jose: Zero Pesos"
            >
              Cost to the People of San Jose = <span className="footer-cost-value">₱0</span>
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
            <span className="footer-copyright-text">&copy; 2026 Better San Jose</span>
            <span className="footer-copyright-license">MIT | CC BY 4.0</span>
            <span className="footer-copyright-disclaimer">
              All public information sourced from official government portals. Design based on{' '}
              <a
                href="https://github.com/BetterSolano/bettersolano"
                target="_blank"
                rel="noopener noreferrer"
              >
                BetterSolano.org
              </a>
              .
            </span>
            <span className="footer-version">
              <i className="ph ph-package" /> Ver. {pkg.version}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
