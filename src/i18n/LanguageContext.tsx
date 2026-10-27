'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { translations, type Language } from './translations';

const STORAGE_KEY = 'selectedLang';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  /** Translation for `key`, or `fallback` (then the key) when missing. */
  t: (key: string, fallback?: string) => string;
}

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
    document.documentElement.lang = language;
  }, [language]);

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
