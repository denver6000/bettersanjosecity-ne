'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
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

const ART = '/assets/images/hero/scene';

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

export default function HeroScene() {
  const { t } = useLanguage();
  const { forecast, retry } = useForecast();
  // Neutral first render (golden morning, clear); the real sky is applied after hydration.
  const [hour, setHour] = useState(8);
  const [override, setOverride] = useState<{ hour?: number; weather?: Weather }>({});

  const retryRef = useRef(retry);
  retryRef.current = retry;

  useEffect(() => {
    const o = parseSkyOverride(window.location.search);
    setOverride(o);
    const tick = () => setHour(o.hour ?? manilaNow().hour);
    tick();
    const clock = setInterval(tick, 30 * 1000);
    const refresh = setInterval(() => retryRef.current(), 10 * 60 * 1000);
    return () => {
      clearInterval(clock);
      clearInterval(refresh);
    };
  }, []);

  const weather: Weather = override.weather ?? weatherKind(forecast?.code);
  const look = weatherLook(weather);
  const sky = skyAt(hour);
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

  const { sun, moon } = bodies(hour);
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
  const rainCount = weather === 'storm' ? 130 : weather === 'rain' ? 60 : 0;

  const tinted = (href: string) => (
    <g filter="url(#hero-tint)">
      <image href={href} width={1586} height={992} />
    </g>
  );

  return (
    <svg
      className="hero-scene"
      viewBox="0 0 1586 992"
      preserveAspectRatio="xMaxYMid slice"
      role="img"
      aria-label={t(
        'hero-scene-alt',
        'Illustrated rice fields of San Jose City that follow the real time and weather'
      )}
      data-sky-hour={hour.toFixed(1)}
      data-weather={weather}
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

      <g opacity={starOpacity} fill="#fff">
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} />
        ))}
      </g>

      {sun && (
        <g transform={`translate(${sun.x} ${sun.y})`} opacity={sunOpacity}>
          <g fill={mix(sunColor, '#ffffff', 0.25)}>
            {RAYS.map((p, i) => (
              <polygon key={i} points={p} />
            ))}
          </g>
          <circle r={74} fill={sunColor} />
        </g>
      )}
      {moon && <path d={moonPath} fill="#f4f1d8" opacity={moonOpacity} />}

      <g fill={cloud}>
        {CLOUDS[weather].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s * 3.4})`}>
            <ellipse cx={0} cy={0} rx={26} ry={9} />
            <ellipse cx={-14} cy={-6} rx={14} ry={10} />
            <ellipse cx={6} cy={-10} rx={17} ry={12} />
            <ellipse cx={22} cy={-3} rx={12} ry={8} />
          </g>
        ))}
      </g>

      {tinted(`${ART}/hills.webp`)}
      {tinted(`${ART}/paddies.webp`)}

      <circle cx={1340} cy={556} r={16} fill="#ffd25a" opacity={Math.max(0, night - 0.2) / 0.8} />

      {tinted(`${ART}/foreground.webp`)}

      {rainCount > 0 && (
        <g stroke="#e4ecf5" strokeWidth={3} strokeLinecap="round" opacity={0.75}>
          {RAIN.slice(0, rainCount).map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={p.x - 18} y2={p.y + 60} />
          ))}
        </g>
      )}
    </svg>
  );
}
