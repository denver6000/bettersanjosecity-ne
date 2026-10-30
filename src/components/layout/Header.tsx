'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV } from '@/config/site';
import { useLanguage } from '@/i18n/LanguageContext';
import { LANGUAGES } from '@/i18n/translations';
import BrandLockup from './BrandLockup';

function isMobileNav(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 1199px)').matches;
}

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const scrollYRef = useRef(0);
  const isAnimatingRef = useRef(false);

  const lockBodyScroll = useCallback(() => {
    scrollYRef.current = window.scrollY;
    document.body.classList.add('mobile-menu-open');
    document.body.style.top = `-${scrollYRef.current}px`;
  }, []);

  const unlockBodyScroll = useCallback(() => {
    if (!document.body.classList.contains('mobile-menu-open')) return;
    document.body.classList.remove('mobile-menu-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollYRef.current);
  }, []);

  const closeMenu = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setMobileMenuOpen(false);
    unlockBodyScroll();
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 320);
  }, [unlockBodyScroll]);

  const openMenu = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setMobileMenuOpen(true);
    lockBodyScroll();
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 320);
  }, [lockBodyScroll]);

  // Close menu on route change
  useEffect(() => {
    isAnimatingRef.current = false;
    closeMenu();
  }, [pathname, closeMenu]);

  // Cleanup body scroll lock on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('mobile-menu-open');
      document.body.style.top = '';
    };
  }, []);

  // Click outside / Escape to close
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (!navRef.current?.contains(target) && !toggleRef.current?.contains(target)) closeMenu();
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeMenu();
        toggleRef.current?.focus();
      }
    }
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen, closeMenu]);

  // Close mobile menu on resize to desktop (debounced)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function handleResize() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!isMobileNav() && mobileMenuOpen) {
          isAnimatingRef.current = false;
          closeMenu();
        }
      }, 150);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen, closeMenu]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="logo-container">
          <BrandLockup />
        </div>

        <nav
          ref={navRef}
          className={`main-nav ${mobileMenuOpen ? 'active' : ''}`}
          aria-label="Main Navigation"
        >
          <ul>
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={active ? 'active' : undefined}
                    aria-current={active ? 'page' : undefined}
                  >
                    {t(item.key, item.label)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="header-actions">
          <div className="lang-selector">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                className={`btn btn-secondary btn-sm lang-btn ${language === lang.code ? 'active' : ''}`}
                onClick={() => setLanguage(lang.code)}
                aria-label={`Switch to ${lang.name}`}
                aria-pressed={language === lang.code}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="mobile-menu-toggle btn btn-secondary"
          onClick={() => (mobileMenuOpen ? closeMenu() : openMenu())}
          aria-label="Toggle Navigation"
          aria-expanded={mobileMenuOpen}
        >
          <i className={`ph ${mobileMenuOpen ? 'ph-x' : 'ph-list'}`} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
