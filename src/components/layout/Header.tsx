'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV } from '@/config/site';
import { useLanguage } from '@/i18n/LanguageContext';
import { LANGUAGES } from '@/i18n/translations';
import { isActivePath } from '@/lib/nav';
import SiteSearch from '@/components/SiteSearch';
import BrandLockup from './BrandLockup';

/** The width at which header.css folds the nav into the menu panel. */
const FOLDED = '(max-width: 1199px)';

/**
 * Hold the page still behind the open menu at scroll position `y`, or release it back to `y`.
 * `y` is read when the button is tapped: by the time React re-renders, the opening nav has already
 * nudged the scroll (scroll anchoring), and each open/close would creep the page by that much.
 */
function pinPage(pinned: boolean, y: number) {
  const body = document.body;
  if (pinned) {
    body.style.top = `-${y}px`;
    body.classList.add('mobile-menu-open');
  } else if (body.classList.contains('mobile-menu-open')) {
    body.classList.remove('mobile-menu-open');
    body.style.top = '';
    window.scrollTo(0, y);
  }
}

export default function Header() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const scrollY = useRef(0);

  // The page lock follows the open state, so even a fast double tap leaves the page scrollable.
  useEffect(() => pinPage(open, scrollY.current), [open]);
  useEffect(() => () => pinPage(false, scrollY.current), []);

  // Arriving on another page closes the menu. The new page starts at its top, so the lock is
  // released here without scrolling back to where the old page was.
  useEffect(() => {
    scrollY.current = 0;
    setOpen(false);
  }, [pathname]);

  // While open: close on a click elsewhere, on Esc (back to the button), or once the full nav fits.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const node = e.target as Node;
      if (!navRef.current?.contains(node) && !buttonRef.current?.contains(node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onResize = () => !window.matchMedia(FOLDED).matches && setOpen(false);
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="logo-container">
          <BrandLockup />
        </div>

        <nav
          ref={navRef}
          className={open ? 'main-nav active' : 'main-nav'}
          aria-label={t('nav-main-aria', 'Main Navigation')}
        >
          <ul>
            {NAV.map(({ href, key, label }) => {
              const here = isActivePath(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={here ? 'active' : undefined}
                    aria-current={here ? 'page' : undefined}
                  >
                    {t(key, label)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="header-actions">
          <div className="lang-selector">
            {LANGUAGES.map(({ code, label, name }) => (
              <button
                key={code}
                type="button"
                className={`btn btn-secondary btn-sm lang-btn${language === code ? ' active' : ''}`}
                aria-pressed={language === code}
                aria-label={`${label} - ${name}`}
                onClick={() => setLanguage(code)}
              >
                {label}
              </button>
            ))}
          </div>
          <SiteSearch />
        </div>

        <button
          ref={buttonRef}
          type="button"
          className="mobile-menu-toggle btn btn-secondary"
          aria-expanded={open}
          aria-label={open ? t('nav-close-menu', 'Close menu') : t('nav-open-menu', 'Open menu')}
          onClick={() => {
            // Only an unlocked page has a real scroll position (a locked one reads 0).
            if (!document.body.classList.contains('mobile-menu-open'))
              scrollY.current = window.scrollY;
            setOpen((was) => !was);
          }}
        >
          <i className={`ph ${open ? 'ph-x' : 'ph-list'}`} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
