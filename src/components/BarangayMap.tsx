'use client';

import { useEffect, useRef, useState } from 'react';
import ComingSoon from '@/components/ComingSoon';
import { useLanguage } from '@/i18n/LanguageContext';
import data from '@/data/barangay-shapes.json';

type Box = [number, number, number, number];
const PAD = 0.12;
const FLY_MS = 600;

const cityBox = data.city.bbox as Box;
const ASPECT = (cityBox[2] - cityBox[0]) / (cityBox[3] - cityBox[1]);

/** viewBox [x, y, w, h] that frames a bbox with padding, at the map's fixed aspect ratio. */
function fit(b: Box): Box {
  let w = (b[2] - b[0]) * (1 + 2 * PAD);
  let h = (b[3] - b[1]) * (1 + 2 * PAD);
  if (w / h < ASPECT) w = h * ASPECT;
  else h = w / ASPECT;
  return [(b[0] + b[2]) / 2 - w / 2, (b[1] + b[3]) / 2 - h / 2, w, h];
}
const CITY_VIEW = fit(cityBox);

export default function BarangayMap() {
  const { t } = useLanguage();
  const svgRef = useRef<SVGSVGElement>(null);
  const viewRef = useRef<Box>(CITY_VIEW);
  const frameRef = useRef(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [labelId, setLabelId] = useState<string | null>(null);
  const [targetW, setTargetW] = useState(CITY_VIEW[2]);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  function setView(v: Box) {
    viewRef.current = v;
    svgRef.current?.setAttribute('viewBox', v.join(' '));
  }

  function flyTo(to: Box) {
    cancelAnimationFrame(frameRef.current);
    setTargetW(to[2]);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setView(to);
    const from = viewRef.current;
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / FLY_MS);
      const e = 1 - (1 - k) ** 3;
      setView(from.map((f, i) => f + (to[i] - f) * e) as Box);
      if (k < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
  }

  function select(id: string | null) {
    setSelectedId(id);
    const b = data.barangays.find((x) => x.id === id);
    flyTo(b ? fit(b.bbox as Box) : CITY_VIEW);
  }

  const selected = data.barangays.find((b) => b.id === selectedId);
  const labeled = data.barangays.filter((b) => b.id === selectedId || b.id === labelId);

  return (
    <div className="bm">
      <div className="bm-bar">
        <label className="bm-find">
          <span>{t('bm-find', 'Find a barangay')}</span>
          <select value={selectedId ?? ''} onChange={(e) => select(e.target.value || null)}>
            <option value="">{t('bm-all', 'Whole city')}</option>
            {data.barangays.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <svg
        ref={svgRef}
        className="bm-svg"
        viewBox={CITY_VIEW.join(' ')}
        style={{ aspectRatio: ASPECT }}
        role="group"
        aria-label={t('bm-map-label', 'Map of San Jose City barangays')}
        onKeyDown={(e) => e.key === 'Escape' && select(null)}
      >
        {data.barangays.map((b) => (
          <path
            key={b.id}
            d={b.path}
            className="bm-shape"
            data-tone={b.tone}
            fillRule="evenodd"
            tabIndex={0}
            role="button"
            aria-label={b.name}
            aria-pressed={b.id === selectedId}
            onClick={() => select(b.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                select(b.id);
              }
            }}
            onMouseEnter={() => setLabelId(b.id)}
            onMouseLeave={() => setLabelId(null)}
            onFocus={() => setLabelId(b.id)}
            onBlur={() => setLabelId(null)}
          />
        ))}
        {labeled.map((b) => (
          <text
            key={b.id}
            className="bm-label"
            x={b.centroid[0]}
            y={b.centroid[1]}
            textAnchor="middle"
            fontSize={targetW * 0.028}
          >
            {b.name}
          </text>
        ))}
      </svg>

      {selected && (
        <div className="bm-card">
          <div className="bm-card-head">
            <h3>
              {t('bm-barangay', 'Barangay')} {selected.name}
            </h3>
            <button type="button" className="bm-back" onClick={() => select(null)}>
              {t('bm-back', 'Back to city')}
            </button>
          </div>
          <div className="bm-tiles">
            {(
              [
                ['bm-pop', 'Population'],
                ['bm-captain', 'Captain'],
                ['bm-services', 'Services'],
              ] as const
            ).map(([k, label]) => (
              <div className="bm-tile" key={k}>
                <span>{t(k, label)}</span>
                <ComingSoon />
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="bm-note">
        {t(
          'bm-note',
          'Boundaries are indicative only. Source: NAMRIA and PSA via OCHA COD-AB (CC BY-IGO).'
        )}
      </p>
    </div>
  );
}
