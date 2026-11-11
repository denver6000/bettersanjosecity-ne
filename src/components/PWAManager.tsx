'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

const UPDATE_CHECK_MS = 30 * 60 * 1000;

/**
 * Registers the offline worker (production builds only: under `next dev` it would cache stale bundles)
 * and offers a new version once one has downloaded. The new version takes over when the visitor
 * presses Update; the page then reloads once.
 */
export default function PWAManager() {
  const { t } = useLanguage();
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // No install banner of our own, and none from the browser either.
    const noInstallPrompt = (e: Event) => e.preventDefault();
    window.addEventListener('beforeinstallprompt', noInstallPrompt);
    const cleanup = () => window.removeEventListener('beforeinstallprompt', noInstallPrompt);
    if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') return cleanup;

    const sw = navigator.serviceWorker;
    // A page that had no worker yet is just being claimed on its first visit: no reload for that.
    const wasControlled = Boolean(sw.controller);
    let reloaded = false;
    const onTakeover = () => {
      if (!wasControlled || reloaded) return;
      reloaded = true;
      window.location.reload();
    };
    sw.addEventListener('controllerchange', onTakeover);

    let timer: ReturnType<typeof setInterval> | undefined;
    sw.register('/sw.js').then((reg) => {
      const offer = (worker: ServiceWorker | null) => worker && sw.controller && setWaiting(worker);
      offer(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const incoming = reg.installing;
        incoming?.addEventListener('statechange', () => {
          if (incoming.state === 'installed') offer(incoming);
        });
      });
      timer = setInterval(() => reg.update(), UPDATE_CHECK_MS);
    });

    return () => {
      cleanup();
      clearInterval(timer);
      sw.removeEventListener('controllerchange', onTakeover);
    };
  }, []);

  if (!waiting) return null;
  return (
    <div className="sw-update-banner" role="alert" aria-live="polite">
      <span>{t('sw-update-text', 'A new version is available.')}</span>
      <button
        className="sw-update-btn"
        onClick={() => {
          waiting.postMessage({ type: 'SKIP_WAITING' });
          setWaiting(null);
        }}
      >
        {t('sw-update-btn', 'Update')}
      </button>
      <button
        className="sw-update-dismiss"
        onClick={() => setWaiting(null)}
        aria-label={t('sw-update-dismiss', 'Dismiss update notice')}
      >
        &times;
      </button>
    </div>
  );
}
