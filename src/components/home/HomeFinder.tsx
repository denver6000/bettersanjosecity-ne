'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { INTENTS, destination, type Intent } from '@/lib/finder';
import { T, useLanguage } from '@/i18n/LanguageContext';

// "I need to ___": the visitor finishes the sentence and gets one card with one button.
export default function HomeFinder() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<Intent | null>(null);
  const [keyPicks, setKeyPicks] = useState(0);
  const goRef = useRef<HTMLAnchorElement>(null);

  // Only a keyboard pick moves focus (so keyboard users skip the other choices); mouse clicks never do.
  // A counter, not a flag, so picking the same choice again still refocuses.
  useEffect(() => {
    if (keyPicks > 0) goRef.current?.focus({ preventScroll: true });
  }, [keyPicks]);

  return (
    <section className="home-sec home-finder" aria-labelledby="home-finder-h">
      <div className="container">
        <h2 id="home-finder-h" className="home-finder-sentence" data-reveal>
          <T k="finder-lead">I need to</T>{' '}
          <span className="home-finder-blank">{selected ? t(selected.key) : ''}</span>
        </h2>

        <div
          className="home-finder-choices"
          role="group"
          aria-label={t('finder-label')}
          data-reveal-children
        >
          {INTENTS.map((intent) => (
            <button
              type="button"
              key={intent.id}
              className="home-finder-pill"
              aria-pressed={selected?.id === intent.id}
              onClick={(e) => {
                if (e.detail === 0) setKeyPicks((n) => n + 1);
                setSelected(intent);
              }}
            >
              <i className={`ph-duotone ${intent.icon}`} aria-hidden="true" />
              {t(intent.key)}
            </button>
          ))}
        </div>

        <div className="home-finder-result" aria-live="polite">
          {selected && (
            <div className="home-card home-finder-card" key={selected.id}>
              <i className={`ph-duotone ${selected.icon} home-finder-icon`} aria-hidden="true" />
              <div className="home-finder-body">
                <p className="home-finder-title">{t(selected.titleKey)}</p>
                {selected.soon && (
                  <p className="home-finder-soon">
                    <T k="finder-soon">Not online yet. City Hall can help.</T>
                  </p>
                )}
              </div>
              <Link
                ref={goRef}
                href={destination(selected)}
                className="btn btn-primary home-finder-go"
              >
                {selected.soon ? (
                  <T k="finder-contact">Contact City Hall</T>
                ) : (
                  <T k="finder-go">Go</T>
                )}
                <i className="ph-bold ph-arrow-right" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>

        <Link href="/services" className="home-more home-finder-all">
          <T k="home-all-services">All services</T>
          <i className="ph-bold ph-arrow-right" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
