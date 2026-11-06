'use client';

import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { translations, type Language } from './translations';

const STORAGE_KEY = 'selectedLang';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  /** Translation for `key`, or `fallback` (then the key) when missing. */
  t: (key: string, fallback?: string) => string;
}

/** Route -> i18n key of its tab title, for the pages whose static <title> is English. */
const TITLE_KEYS: Record<string, string> = {
  '/services': 'nav-services',
  '/business-taxes': 'foot-business-taxes',
  '/business-taxes/estimator': 'foot-estimator',
  '/government': 'nav-government',
  '/statistics': 'nav-statistics',
  '/legislative': 'nav-legislative',
  '/budget': 'nav-transparency',
  '/news': 'nav-news',
  '/contact': 'nav-contact',
  '/scholarship': 'sitemap-scholarship',
  '/faq': 'sitemap-faq',
  '/privacy': 'home-privacy-policy',
  '/terms': 'home-terms-of-use',
  '/accessibility': 'home-accessibility',
  '/sitemap': 'home-sitemap',
  '/403': 'err-403-t',
  '/500': 'err-500-t',
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLang(): Language | null {
  // localStorage throws in Safari private mode and when site data is blocked.
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' || saved === 'fil' ? saved : null;
  } catch {
    return null;
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always 'en' on the server/first render so static HTML hydrates cleanly.
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const browser = navigator.language.split('-')[0].toLowerCase();
    const initial = readStoredLang() ?? (browser === 'fil' || browser === 'tl' ? 'fil' : 'en');
    setLanguageState(initial);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    // Reveal the page once the language the head script was waiting for is on screen.
    if (root.getAttribute('data-lang-pending') === language)
      root.removeAttribute('data-lang-pending');
  }, [language]);

  // The static <title> is English. Re-apply the translated one, and again whenever Next rewrites it.
  const pathname = usePathname();
  useEffect(() => {
    const key = TITLE_KEYS[pathname.replace(/\/$/, '') || '/'];
    if (!key) return;
    const want = `${translations[language][key] ?? translations.en[key]} | Better San Jose`;
    const apply = () => {
      if (document.title !== want) document.title = want;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [pathname, language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Preference won't persist, but the switch still applies.
    }
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) =>
      translations[language][key] ?? translations.en[key] ?? fallback ?? key,
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}

/** Translatable text for server components: `<T k="nav-home">Home</T>`. */
export function T({ k, children }: { k: string; children?: string }) {
  const { t } = useLanguage();
  return <>{t(k, children)}</>;
}
