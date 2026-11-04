'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

const STORAGE_KEY = 'theme';

type Theme = 'light' | 'dark';

function effectiveTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === 'light' || set === 'dark') return set;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Header sun/moon button: overrides the OS theme and remembers the choice on this device. */
export default function ThemeToggle() {
  const { t } = useLanguage();
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(effectiveTheme());
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setTheme(effectiveTheme());
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  function toggle() {
    const next: Theme = effectiveTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Choice applies now but won't persist (private mode / blocked storage).
    }
  }

  return (
    <button
      type="button"
      className="theme-toggle btn btn-secondary"
      onClick={toggle}
      aria-label={
        theme === 'dark'
          ? t('theme-switch-light', 'Switch to light mode')
          : t('theme-switch-dark', 'Switch to dark mode')
      }
    >
      <i className="ph ph-moon" aria-hidden="true" />
      <i className="ph ph-sun" aria-hidden="true" />
    </button>
  );
}
