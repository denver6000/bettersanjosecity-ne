'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export default function PWAManager() {
  const [showUpdate, setShowUpdate] = useState(false);
  const waitingWorker = useRef<ServiceWorker | null>(null);

  const handleUpdate = useCallback(() => {
    waitingWorker.current?.postMessage({ type: 'SKIP_WAITING' });
    setShowUpdate(false);
  }, []);

  useEffect(() => {
    // No custom install banner: just stop the browser's own mini-infobar from appearing.
    const onBeforeInstall = (e: Event) => e.preventDefault();
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

      // First visit: the new worker claims the page, which is not an update, so don't reload it.
      const hadController = !!navigator.serviceWorker.controller;
      let refreshing = false;
      const onControllerChange = () => {
        if (!hadController || refreshing) return;
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
