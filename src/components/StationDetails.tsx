'use client';

import { SITE } from '@/config/site';
import { useLanguage } from '@/i18n/LanguageContext';
import { manilaDate, manilaTime, REFRESH_MS, useStation } from '@/lib/station';

const TYPES: Record<string, string> = { WEATHERSTATION: 'Automatic weather station' };

/** Everything KloudTrack tells us about the station itself, under the map. */
export default function StationDetails() {
  const { t, language } = useLanguage();
  const locale = language === 'fil' ? 'fil-PH' : 'en-PH';
  const tr = (s: string) =>
    t(
      `sd-${s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}`,
      s
    );
  const { station, status } = useStation();
  const fallback = SITE.weatherStation;
  const r = station?.reading;

  const rows: [string, string][] = [
    ['Station', station?.name ?? fallback.name],
    [
      'Status',
      status === 'live'
        ? tr('Online')
        : status === 'offline'
          ? tr('Offline')
          : status === 'loading'
            ? tr('Checking…')
            : tr('Unavailable'),
    ],
  ];
  // Technical fields residents rarely need; shown under a closed toggle.
  const more: [string, string][] = [];
  if (station) {
    if (station.address) rows.push(['Address', station.address]);
    else
      rows.push([
        'Location',
        [station.city, station.province, station.country].filter(Boolean).join(', '),
      ]);
    if (station.type)
      more.push(['Type', TYPES[station.type] ? tr(TYPES[station.type]) : station.type]);
    if (station.operator) more.push(['Operated by', station.operator]);
    more.push(['Station ID', station.id]);
  }
  if (r?.recorded_at) {
    rows.push([
      'Latest reading',
      `${manilaDate(r.recorded_at, locale)}, ${manilaTime(r.recorded_at, locale)}`,
    ]);
  }
  rows.push([
    'Refreshes',
    t('sd-refresh-note', 'Every {n} minutes while this page is open').replace(
      '{n}',
      String(REFRESH_MS / 60000)
    ),
  ]);
  more.push([
    'Coordinates',
    `${(station?.lat ?? fallback.lat).toFixed(6)}°N, ${(station?.lon ?? fallback.lon).toFixed(6)}°E`,
  ]);
  // KloudTrack reports 0 when the elevation hasn't been set.
  if (station?.elevation_m) more.push(['Elevation', `${Math.round(station.elevation_m)} m`]);
  if (station?.active_since) more.push(['Active since', manilaDate(station.active_since, locale)]);

  const list = (items: [string, string][]) =>
    items.map(([k, v]) => (
      <div key={k}>
        <dt>{tr(k)}</dt>
        <dd>{v}</dd>
      </div>
    ));

  return (
    <div className="station-panel">
      <dl className="station-details" aria-label={t('sd-aria', 'Weather station details')}>
        {list(rows)}
      </dl>
      <details className="station-more">
        <summary>{t('sd-more', 'More station details')}</summary>
        <dl className="station-details">{list(more)}</dl>
      </details>
    </div>
  );
}
