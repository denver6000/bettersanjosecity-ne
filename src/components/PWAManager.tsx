'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function sessionGet(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function sessionSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Storage blocked; the banner may reappear on the next page.
  }
}

export default function PWAManager() {
  const [showInstall, setShowInstall] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const waitingWorker = useRef<ServiceWorker | null>(null);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    setShowInstall(false);
  }, []);

  const handleUpdate = useCallback(() => {
    waitingWorker.current?.postMessage({ type: 'SKIP_WAITING' });
    setShowUpdate(false);
  }, []);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as unknown as { standalone?: boolean }).standalone;
      if (!isStandalone && !sessionGet('pwa-install-dismissed')) setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // The service worker is only registered in production builds; in `next dev`
    // its caching would serve stale bundles.
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      let interval: ReturnType<typeof setInterval> | undefined;
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        interval = setInterval(() => reg.update(), 30 * 60 * 1000);
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              waitingWorker.current = newWorker;
              setShowUpdate(true);
            }
          });
        });
      });

      let refreshing = false;
      const onControllerChange = () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      };
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

      return () => {
        clearInterval(interval);
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
        window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  return (
    <>
      {showInstall && (
        <div className="pwa-install-banner" role="alert" aria-live="polite">
          <div className="pwa-install-content">
            <i className="ph ph-download-simple" aria-hidden="true" />
            <span>Install Better San Jose for quick access to services.</span>
          </div>
          <div className="pwa-install-actions">
            <button
              className="pwa-install-btn"
              onClick={handleInstall}
              aria-label="Install Better San Jose app"
            >
              Install
            </button>
            <button
              className="pwa-install-dismiss"
              onClick={() => {
                sessionSet('pwa-install-dismissed', '1');
                setShowInstall(false);
              }}
              aria-label="Dismiss install prompt"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      {showUpdate && (
        <div className="sw-update-banner" role="alert" aria-live="polite">
          <span>A new version is available.</span>
          <button className="sw-update-btn" onClick={handleUpdate} aria-label="Update now">
            Update
          </button>
          <button
            className="sw-update-dismiss"
            onClick={() => setShowUpdate(false)}
            aria-label="Dismiss update notice"
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
}
