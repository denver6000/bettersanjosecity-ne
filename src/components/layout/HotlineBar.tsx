'use client';

import { useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SITE } from '@/config/site';

// TODO(data): drop the "coming soon" item once local hotlines are in SITE.hotlines.
const ITEM_COUNT = SITE.hotlines.length + 1;

export default function HotlineBar() {
  const itemsRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const isTabletOrBelow = useCallback(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches,
    []
  );

  // On tablet/mobile the items become a looping marquee (duplicated track).
  useEffect(() => {
    const container = itemsRef.current;
    if (!container) return;

    function buildMarquee() {
      if (!isTabletOrBelow() || trackRef.current || !container) return;
      const track = document.createElement('div');
      track.className = 'hotline-items-track';
      track.setAttribute('aria-label', 'Emergency contacts scrolling');

      const items = Array.from(container.children);
      while (container.firstChild) track.appendChild(container.firstChild);
      items.forEach((item) => {
        const clone = item.cloneNode(true) as HTMLElement;
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('tabindex', '-1');
        track.appendChild(clone);
      });
      container.appendChild(track);
      trackRef.current = track;
    }

    function destroyMarquee() {
      if (!trackRef.current || !container) return;
      const originals = Array.from(trackRef.current.children).slice(0, ITEM_COUNT);
      while (container.firstChild) container.removeChild(container.firstChild);
      originals.forEach((item) => container.appendChild(item));
      trackRef.current = null;
    }

    function handleResize() {
      if (isTabletOrBelow()) buildMarquee();
      else destroyMarquee();
    }

    handleResize();
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(handleResize, 150);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, [isTabletOrBelow]);

  return (
    <div className="hotline-bar">
      <div className="container">
        <div className="hotline-inner">
          <div className="hotline-items" ref={itemsRef}>
            {SITE.hotlines.map((h) => (
              <a key={h.tel} href={`tel:${h.tel}`} className="hotline-item">
                <i className={`bi ${h.icon}`} aria-hidden="true" />
                <span>
                  {h.label}: {h.number}
                </span>
              </a>
            ))}
            <Link href="/contact" className="hotline-item">
              <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
              <span>Local hotlines: coming soon</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
