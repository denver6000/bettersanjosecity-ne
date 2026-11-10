'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  birdPose,
  cloudX,
  fireflyTarget,
  rippleRate,
  stalkTarget,
  timelapseHour,
} from '@/lib/hero-motion';
import { lampOpacity, pokesAllowed } from '@/lib/hero-light';
import {
  OCCASIONS,
  occasionOn,
  seasonOn,
  parseOccasionOverride,
  type DateParts,
  type Tone,
} from '@/lib/occasions';
import { useForecast } from '@/lib/use-forecast';
import {
  bodies,
  hexToRgb,
  manilaNow,
  mix,
  parseSkyOverride,
  skyAt,
  weatherKind,
  weatherLook,
  type Weather,
} from '@/lib/sky';

import { OCCASION_ALT_KEYS, loadOccasion } from './occasions';
import { ANCHORS } from './occasions/anchors';
import { clock } from './occasions/clock';
import OccasionLayer from './occasions/OccasionLayer';
import type { ActiveId, OccasionContext } from './occasions/types';
import { useHeroLoop, usePrefersReducedMotion } from './useHeroLoop';

const ART = '/assets/images/hero/scene';
const SEASON_ART = '/assets/images/hero/occasions';

function preload(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(url));
    img.src = url;
  });
}
const LAPSE_MS = 14000;
const SHOWER_MS = 6000;

const CLOUDS: Record<Weather, [number, number, number][]> = {
  clear: [
    [420, 200, 1.1],
    [1050, 290, 0.9],
  ],
  cloudy: [
    [300, 170, 1.2],
    [620, 260, 1.4],
    [950, 190, 1.3],
    [1260, 300, 1.1],
    [420, 330, 1],
  ],
  rain: [
    [280, 150, 1.5],
    [620, 240, 1.8],
    [980, 170, 1.7],
    [1280, 290, 1.5],
    [430, 350, 1.4],
    [800, 380, 1.6],
  ],
  storm: [
    [280, 150, 1.5],
    [620, 240, 1.8],
    [980, 170, 1.7],
    [1280, 290, 1.5],
    [430, 350, 1.4],
    [800, 380, 1.6],
  ],
};

const STARS = Array.from({ length: 46 }, (_, i) => ({
  x: 40 + ((i * 389) % 1500),
  y: 20 + ((i * 173) % 340),
  r: i % 4 ? 2.5 : 4,
}));

const RAYS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * 30 * Math.PI) / 180;
  const tip = i % 2 ? 122 : 142;
  const p = (ang: number, r: number) =>
    `${(Math.cos(ang) * r).toFixed(1)},${(Math.sin(ang) * r).toFixed(1)}`;
  return `${p(a - 0.09, 96)} ${p(a, tip)} ${p(a + 0.09, 96)}`;
});

const RAIN = Array.from({ length: 130 }, (_, i) => ({
  x: ((i * 131) % 1800) - 100,
  y: ((i * 89) % 1150) - 160,
}));

const NS = 'http://www.w3.org/2000/svg';

const BIRDS = Array.from({ length: 5 }, (_, i) => ({
  index: i,
  y: 170 + i * 52,
  speed: 70 + i * 9,
  offset: i * 260,
  phase: i * 1.3,
}));

const FIREFLIES = Array.from({ length: 10 }, (_, i) => ({
  x: 300 + ((i * 211) % 1100),
  y: 620 + ((i * 97) % 300),
  phase: i,
}));

// Code-drawn rice stalks in front of the art; they lean away from the cursor.
const STALKS = Array.from({ length: 53 }, (_, i) => ({
  x: 10 + i * 30,
  h: 100 + ((i * 53) % 90),
  dark: i % 2 === 0,
  bend: 10 + (i % 3) * 3,
  phase: i * 0.7,
}));

export default function HeroScene() {
  const { t } = useLanguage();
  const { forecast, failed, retry } = useForecast();
  // Neutral first render (golden morning, clear); the real sky is applied after hydration.
  const [hour, setHour] = useState(8);
  const [override, setOverride] = useState<{ hour?: number; weather?: Weather }>({});
  const [lapseHour, setLapseHour] = useState<number | null>(null);
  const [showerCloud, setShowerCloud] = useState<number | null>(null);
  // The date is unknown until after hydration, so no occasion is chosen on the neutral first render.
  const [date, setDate] = useState<DateParts | null>(null);
  const [occOverride, setOccOverride] = useState<ReturnType<typeof parseOccasionOverride>>({});
  const [devPin, setDevPin] = useState(false);
  const [seasonReady, setSeasonReady] = useState<string | null>(null);

  // The farming season changes the paddies (and, in planting, the foreground). The variant is shown
  // only once it has loaded; if it fails, the plain scene stays.
  const season = occOverride.season ?? (date ? seasonOn(date) : 'growing');
  const paddiesUrl = `${SEASON_ART}/season-${season}/paddies-${season}.webp`;
  const foregroundUrl = `${SEASON_ART}/season-planting/foreground-planting.webp`;
  const seasonShown = season !== 'growing' && seasonReady === season;

  const retryRef = useRef(retry);
  retryRef.current = retry;

  const reduced = usePrefersReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const ripplesRef = useRef<SVGGElement>(null);
  const showerEl = useRef<SVGGElement | null>(null);
  const cloudEls = useRef<(SVGGElement | null)[]>([]);
  const birdEls = useRef<(SVGGElement | null)[]>([]);
  const fireflyEls = useRef<(SVGCircleElement | null)[]>([]);
  const stalkEls = useRef<(SVGGElement | null)[]>([]);
  const cloudPos = useRef<number[]>([]);
  const fireflyPos = useRef(FIREFLIES.map((f) => ({ x: f.x, y: f.y })));
  const fireflyVel = useRef(FIREFLIES.map(() => ({ x: 0, y: 0 })));
  const stalkAngle = useRef<number[]>([]);
  const cursor = useRef<{ x: number; y: number } | null>(null);
  const lastMove = useRef(0);
  const scatter = useRef(0);
  const lapse = useRef<{ t0: number; real: number } | null>(null);
  const lapseFrames = useRef(0);
  const rippleDebt = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  // HERO_GATE only runs on a full page load. When the visitor navigates here from another page,
  // hide the neutral first frame before it paints; the reveal effect below clears this.
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-hero-pending', '');
  }, []);

  useEffect(() => {
    const o = parseSkyOverride(window.location.search);
    setOverride(o);
    const oo = parseOccasionOverride(window.location.search);
    setOccOverride(oo);
    if (process.env.NODE_ENV !== 'production')
      setDevPin(new URLSearchParams(window.location.search).get('on') === 'test-pin');
    const tick = () => {
      const m = manilaNow();
      setHour(o.hour ?? m.hour);
      setDate(oo.date ?? { year: m.year, month: m.month, day: m.day });
    };
    tick();
    const clock = setInterval(tick, 30 * 1000);
    const refresh = setInterval(() => retryRef.current(), 10 * 60 * 1000);
    return () => {
      clearInterval(clock);
      clearInterval(refresh);
    };
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  useEffect(() => {
    if (season === 'growing') return;
    let alive = true;
    const urls = season === 'planting' ? [paddiesUrl, foregroundUrl] : [paddiesUrl];
    Promise.all(urls.map(preload))
      .then(() => alive && setSeasonReady(season))
      .catch(() => {
        // A missing variant leaves the plain scene as it is.
      });
    return () => {
      alive = false;
    };
  }, [season, paddiesUrl, foregroundUrl]);

  // Reveal once the real weather is known (cached, fetched, failed, or overridden), or after a
  // moment, so a reload at night never shows the neutral morning scene first (see HERO_GATE).
  useEffect(() => {
    const reveal = () => document.documentElement.removeAttribute('data-hero-pending');
    if (
      (override.weather || forecast || failed) &&
      (season === 'growing' || seasonReady === season)
    ) {
      reveal();
      return;
    }
    const id = setTimeout(reveal, 1200);
    return () => clearTimeout(id);
  }, [override.weather, forecast, failed, season, seasonReady]);

  const shownHour = lapseHour ?? hour;
  const weather: Weather = override.weather ?? weatherKind(forecast?.code);

  // Which occasion is drawn: a dev fixture, an override, or the calendar for San Jose's date.
  const active: { id: ActiveId; tone: Tone } | null = devPin
    ? { id: 'test-pin', tone: 'celebrate' }
    : occOverride.occasion === 'none'
      ? null
      : occOverride.occasion
        ? {
            id: occOverride.occasion,
            tone: OCCASIONS.find((o) => o.id === occOverride.occasion)?.tone ?? 'celebrate',
          }
        : date
          ? occasionOn(date)
          : null;
  const tone: Tone | null = active?.tone ?? null;
  const pokesOk = pokesAllowed(tone, reduced);

  const look = weatherLook(weather);
  const sky = skyAt(shownHour);
  const night = sky.night;

  const grey = mix('#9aa4ae', '#1c2438', night);
  const top = mix(sky.top, grey, look.greyMix);
  const band = mix(sky.band, grey, look.greyMix * 0.9);
  const mid = mix(top, band, 0.5);
  const rgb = hexToRgb(sky.tint).map((v) => (v / 255) * look.brightness);
  const tintMatrix = `${rgb[0]} 0 0 0 0 0 ${rgb[1]} 0 0 0 0 0 ${rgb[2]} 0 0 0 0 0 1 0`;
  const cloud = mix(
    mix('#ffffff', '#2a3a66', night * 0.8),
    mix(grey, '#2b3340', weather === 'rain' || weather === 'storm' ? 0.3 : 0),
    look.greyMix * 0.8
  );
  const stormCloud = mix(cloud, '#2b3340', 0.55);

  const { sun, moon } = bodies(shownHour);
  const sunColor = sun
    ? mix('#f9c92a', '#f26b3a', Math.pow(1 - Math.sin(Math.PI * sun.t), 1.6))
    : '';
  const sunOpacity = Math.max(0, 1 - look.greyMix * 1.25);
  const moonOpacity = night > 0.5 ? Math.max(0, 1 - look.greyMix * 1.1) : 0;
  const starOpacity = Math.max(0, (night - 0.4) / 0.6) * (1 - look.greyMix);
  const r = 62;
  const moonPath = moon
    ? `M${moon.x},${moon.y - r} A${r},${r} 0 1 0 ${moon.x},${moon.y + r} A${r * 0.75},${r} 0 1 1 ${moon.x},${moon.y - r}Z`
    : '';
  const precipitation = forecast?.precipitation ?? 0;
  const windKmh = forecast?.windSpeed ?? 8;
  const rainCount =
    weather === 'storm'
      ? 130
      : weather === 'rain'
        ? Math.round(40 + Math.min(1, precipitation / 4) * 70)
        : 0;
  const birdsOpacity = (1 - night) * (weather === 'clear' || weather === 'cloudy' ? 1 : 0);

  useEffect(() => {
    cloudPos.current = CLOUDS[weather].map((c) => c[0]);
    setShowerCloud(null);
  }, [weather]);

  const later = (fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
  };

  function toScene(e: { clientX: number; clientY: number }) {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }

  const skyPoke = (e: MouseEvent<SVGSVGElement>) => {
    if (!pokesOk || !active) return;
    const p = toScene(e);
    if (!p) return;
    loadOccasion(active.id)
      .then((l) => l.module.pokes?.sky?.(p))
      .catch(() => {});
  };

  const startLapse = (e: MouseEvent) => {
    e.stopPropagation();
    if (!pokesOk || lapse.current) return;
    lapse.current = { t0: performance.now(), real: hour };
  };

  const startShower = (e: MouseEvent, i: number) => {
    e.stopPropagation();
    if (!pokesOk || showerCloud !== null) return;
    setShowerCloud(i);
    later(() => setShowerCloud(null), SHOWER_MS);
  };

  const scareBirds = (e: MouseEvent) => {
    e.stopPropagation();
    if (pokesOk) scatter.current = 1;
  };

  const burstFireflies = () => {
    if (!pokesOk || night <= 0.5 || !cursor.current) return;
    fireflyVel.current.forEach((v) => {
      const a = Math.random() * Math.PI * 2;
      const s = 300 + Math.random() * 400;
      v.x = Math.cos(a) * s;
      v.y = Math.sin(a) * s;
    });
  };

  useHeroLoop(
    (now, dt) => {
      const tSec = now / 1000;
      const c = cursor.current;
      clock.tick(now);

      // Sun-click time-lapse: the sky runs through a day and lands back on the real hour.
      const lp = lapse.current;
      if (lp) {
        const elapsed = now - lp.t0;
        if (elapsed >= LAPSE_MS) {
          lapse.current = null;
          setLapseHour(null);
        } else if (lapseFrames.current++ % 2 === 0) {
          setLapseHour(timelapseHour(lp.real, elapsed, LAPSE_MS));
        }
      }

      CLOUDS[weather].forEach((cl, i) => {
        const el = cloudEls.current[i];
        if (!el) return;
        const x = cloudX(cloudPos.current[i] ?? cl[0], dt, windKmh, i);
        cloudPos.current[i] = x;
        el.setAttribute('transform', `translate(${x.toFixed(1)} ${cl[1]}) scale(${cl[2] * 3.4})`);
        if (i === showerCloud)
          showerEl.current?.setAttribute('transform', `translate(${x.toFixed(1)} ${cl[1]})`);
      });

      scatter.current = Math.max(0, scatter.current - dt * 0.35);
      BIRDS.forEach((b, i) => {
        const p = birdPose(tSec, b, scatter.current);
        birdEls.current[i]?.setAttribute(
          'transform',
          `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`
        );
      });

      FIREFLIES.forEach((f, i) => {
        const el = fireflyEls.current[i];
        if (!el) return;
        const pos = fireflyPos.current[i];
        const vel = fireflyVel.current[i];
        let goal = fireflyTarget(f, tSec, f.phase);
        if (c && night > 0.5 && Math.hypot(c.x - pos.x, c.y - pos.y) < 520) {
          goal = {
            x: c.x + Math.sin(f.phase * 2 + tSec / 0.7) * 60,
            y: c.y + Math.cos(f.phase * 3 + tSec / 0.8) * 40,
          };
        }
        pos.x += vel.x * dt + (goal.x - pos.x) * Math.min(1, dt * 1.6);
        pos.y += vel.y * dt + (goal.y - pos.y) * Math.min(1, dt * 1.6);
        vel.x *= 1 - Math.min(1, dt * 3);
        vel.y *= 1 - Math.min(1, dt * 3);
        el.setAttribute('cx', pos.x.toFixed(1));
        el.setAttribute('cy', pos.y.toFixed(1));
        el.setAttribute('opacity', (0.5 + 0.5 * Math.sin(tSec * 3.3 + f.phase)).toFixed(2));
      });

      const moving = now - lastMove.current < 250;
      STALKS.forEach((s, i) => {
        const el = stalkEls.current[i];
        if (!el) return;
        const target =
          stalkTarget(s.x, c?.x ?? null, c?.y ?? null, moving, tSec, s.phase) *
          (tone === 'remember' ? 0.6 : 1);
        const prev = stalkAngle.current[i] ?? 0;
        const a = prev + (target - prev) * Math.min(1, dt * 9);
        stalkAngle.current[i] = a;
        el.setAttribute('transform', `translate(${s.x} 992) rotate(${a.toFixed(2)})`);
      });

      rippleDebt.current += rippleRate(weather, precipitation, showerCloud !== null) * dt;
      while (rippleDebt.current >= 1) {
        rippleDebt.current -= 1;
        const group = ripplesRef.current;
        if (!group) break;
        const e = document.createElementNS(NS, 'ellipse');
        e.setAttribute('class', 'hero-ripple');
        e.setAttribute('cx', String(300 + Math.random() * 1250));
        e.setAttribute('cy', String(640 + Math.random() * 250));
        e.setAttribute('rx', '34');
        e.setAttribute('ry', '9');
        e.setAttribute('fill', 'none');
        e.setAttribute('stroke', '#e4ecf5');
        e.setAttribute('stroke-width', '3');
        group.appendChild(e);
        later(() => e.remove(), 1300);
      }
    },
    !reduced,
    svgRef
  );

  const tinted = (href: string) => (
    <g filter="url(#hero-tint)" pointerEvents="none">
      <image href={href} width={1586} height={992} />
    </g>
  );

  const baseLabel =
    'Illustrated rice fields of San Jose City that follow the real time and weather';
  const sceneLabel =
    active && active.id !== 'test-pin'
      ? t(OCCASION_ALT_KEYS[active.id], baseLabel)
      : t('hero-scene-alt', baseLabel);

  const occCtx: Omit<OccasionContext, 'tSec' | 'manifest' | 'assetBase'> = {
    night,
    windKmh,
    hour: shownHour,
    date: date ?? { year: 2000, month: 1, day: 1 },
    reduced,
    weatherGrey: look.greyMix,
    pokes: pokesOk,
  };
  const occ = active?.id ?? null;

  const poke = pokesOk ? 'hero-poke' : undefined;

  return (
    <svg
      ref={svgRef}
      className="hero-scene"
      viewBox="0 0 1586 992"
      preserveAspectRatio="xMaxYMid slice"
      role="img"
      aria-label={sceneLabel}
      data-sky-hour={shownHour.toFixed(1)}
      data-weather={weather}
      data-occasion={active?.id ?? 'none'}
      data-season={season}
      onPointerMove={(e) => {
        if (e.pointerType === 'touch' || reduced) return;
        const p = toScene(e);
        if (!p) return;
        cursor.current = p;
        lastMove.current = performance.now();
      }}
      onPointerLeave={() => {
        cursor.current = null;
      }}
      onClick={(e) => {
        burstFireflies();
        skyPoke(e);
      }}
    >
      <defs>
        <filter
          id="hero-tint"
          colorInterpolationFilters="sRGB"
          x="0"
          y="0"
          width="100%"
          height="100%"
        >
          <feColorMatrix type="saturate" values={String(look.saturation)} />
          <feColorMatrix type="matrix" values={tintMatrix} />
        </filter>
      </defs>

      <rect width={1586} height={992} fill={top} />
      <rect y={300} width={1586} height={400} fill={mid} />
      <rect y={430} width={1586} height={300} fill={band} />

      <g opacity={starOpacity} fill="#fff" pointerEvents="none">
        {STARS.map((s, i) => (
          <circle
            key={i}
            className="hero-star"
            cx={s.x}
            cy={s.y}
            r={s.r}
            style={{ animationDelay: `${-(i % 9) * 0.33}s` }}
          />
        ))}
      </g>

      {sun && (
        <g
          className={poke}
          transform={`translate(${sun.x} ${sun.y})`}
          opacity={sunOpacity}
          pointerEvents={sunOpacity > 0.3 ? 'auto' : 'none'}
          onClick={pokesOk ? startLapse : undefined}
        >
          <g className="hero-poke-in">
            <circle r={150} fill="transparent" />
            <g className="hero-rays" fill={mix(sunColor, '#ffffff', 0.25)}>
              {RAYS.map((p, i) => (
                <polygon key={i} points={p} />
              ))}
            </g>
            <circle className="hero-sun-disc" r={74} fill={sunColor} />
          </g>
        </g>
      )}
      {moon && (
        <g
          className={poke}
          opacity={moonOpacity}
          pointerEvents={moonOpacity > 0.3 ? 'auto' : 'none'}
          onClick={pokesOk ? startLapse : undefined}
        >
          <path className="hero-poke-in" d={moonPath} fill="#f4f1d8" />
        </g>
      )}

      <g fill={cloud}>
        {CLOUDS[weather].map(([x, y, s], i) => (
          <g
            key={`${weather}-${i}`}
            className={poke}
            ref={(el) => {
              cloudEls.current[i] = el;
              if (el && !el.hasAttribute('transform'))
                el.setAttribute('transform', `translate(${x} ${y}) scale(${s * 3.4})`);
            }}
            onClick={pokesOk ? (e) => startShower(e, i) : undefined}
          >
            <g className="hero-poke-in" fill={showerCloud === i ? stormCloud : undefined}>
              <ellipse cx={0} cy={0} rx={26} ry={9} />
              <ellipse cx={-14} cy={-6} rx={14} ry={10} />
              <ellipse cx={6} cy={-10} rx={17} ry={12} />
              <ellipse cx={22} cy={-3} rx={12} ry={8} />
            </g>
          </g>
        ))}
      </g>

      {showerCloud !== null && (
        <g
          ref={(el) => {
            showerEl.current = el;
            const c = CLOUDS[weather][showerCloud];
            if (el && c && !el.hasAttribute('transform'))
              el.setAttribute(
                'transform',
                `translate(${cloudPos.current[showerCloud] ?? c[0]} ${c[1]})`
              );
          }}
          pointerEvents="none"
        >
          {Array.from({ length: 16 }, (_, j) => {
            const w = (CLOUDS[weather][showerCloud]?.[2] ?? 1) * 14.5;
            return (
              <line
                key={j}
                className="hero-shower-line"
                x1={(j - 7.5) * w}
                y1={30}
                x2={(j - 7.5) * w - 14}
                y2={70}
                stroke="#dbe8f4"
                strokeWidth={3}
                strokeLinecap="round"
                style={{ animationDelay: `${-(j % 5) * 0.16}s` }}
              />
            );
          })}
        </g>
      )}

      {!reduced && (
        <g opacity={birdsOpacity} pointerEvents={birdsOpacity > 0.3 ? 'auto' : 'none'}>
          {BIRDS.map((b, i) => (
            <g
              key={i}
              className={poke}
              ref={(el) => {
                birdEls.current[i] = el;
              }}
              onClick={scareBirds}
            >
              <rect x={-34} y={-30} width={68} height={50} fill="transparent" />
              <g className="hero-poke-in">
                <path
                  className="hero-wing"
                  d="M-30 0 q15 -22 30 0 q15 -22 30 0"
                  fill="none"
                  stroke="#2a3a55"
                  strokeWidth={i % 2 ? 5 : 6}
                  strokeLinecap="round"
                  style={{ animationDelay: `${-i * 0.11}s` }}
                />
              </g>
            </g>
          ))}
        </g>
      )}

      <OccasionLayer slot="behindHills" occasion={occ} ctx={occCtx} />
      {tinted(`${ART}/hills.webp`)}
      <OccasionLayer slot="betweenHillsAndPaddies" occasion={occ} ctx={occCtx} />
      {tinted(seasonShown ? paddiesUrl : `${ART}/paddies.webp`)}
      <OccasionLayer slot="betweenPaddiesAndForeground" occasion={occ} ctx={occCtx} />

      <g ref={ripplesRef} pointerEvents="none" />

      <circle
        cx={ANCHORS.hutWindow[0]}
        cy={ANCHORS.hutWindow[1]}
        r={16}
        fill="#ffd25a"
        opacity={lampOpacity(night, look.greyMix)}
        pointerEvents="none"
      />

      {!reduced && (
        <g opacity={Math.max(0, night - 0.5) * (weather === 'storm' ? 0 : 1)} pointerEvents="none">
          {FIREFLIES.map((f, i) => (
            <circle
              key={i}
              ref={(el) => {
                fireflyEls.current[i] = el;
              }}
              cx={f.x}
              cy={f.y}
              r={6}
              fill="#f6e27a"
            />
          ))}
        </g>
      )}

      {tinted(seasonShown && season === 'planting' ? foregroundUrl : `${ART}/foreground.webp`)}

      <g filter="url(#hero-tint)" pointerEvents="none">
        {STALKS.map((s, i) => (
          <g
            key={i}
            ref={(el) => {
              stalkEls.current[i] = el;
              if (el && !el.hasAttribute('transform'))
                el.setAttribute('transform', `translate(${s.x} 992)`);
            }}
          >
            <path
              d={`M0 0 Q${s.bend} ${-s.h * 0.55} 5 ${-s.h}`}
              fill="none"
              stroke={s.dark ? '#1d6a2c' : '#2f8f35'}
              strokeWidth={s.dark ? 9 : 7}
              strokeLinecap="round"
            />
            {[0, 1, 2, 3].map((k) => (
              <ellipse
                key={k}
                cx={5 + k * 1.5}
                cy={-s.h + 10 + k * 17}
                rx={7}
                ry={16}
                transform={`rotate(${18 + k * 6} ${5 + k * 1.5} ${-s.h + 10 + k * 17})`}
                fill={
                  season === 'planting'
                    ? k % 2
                      ? '#3f9a45'
                      : '#4fae4a'
                    : k % 2
                      ? '#e8a400'
                      : '#f2b100'
                }
              />
            ))}
          </g>
        ))}
      </g>

      <OccasionLayer slot="frontOfForeground" occasion={occ} ctx={occCtx} />

      {rainCount > 0 && (
        <g
          className="hero-rain"
          stroke="#e4ecf5"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.75}
          pointerEvents="none"
        >
          {RAIN.slice(0, rainCount).map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={p.x - 18} y2={p.y + 60} />
          ))}
        </g>
      )}

      {weather === 'storm' && !reduced && (
        <>
          <polygon
            className="hero-bolt"
            fill="#fff8d0"
            points="950,0 880,230 940,230 850,470 1010,200 950,200 1010,0"
          />
          <rect className="hero-flash" width={1586} height={992} fill="#fff8d0" />
        </>
      )}
    </svg>
  );
}
