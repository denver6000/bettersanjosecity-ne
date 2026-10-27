'use client';

import { SITE } from '@/config/site';
import { manilaDate, manilaTime, REFRESH_MS, useStation } from '@/lib/station';

const TYPES: Record<string, string> = { WEATHERSTATION: 'Automatic weather station' };

/** Everything KloudTrack tells us about the station itself, under the map. */
export default function StationDetails() {
  const { station, status } = useStation();
  const fallback = SITE.weatherStation;
  const r = station?.reading;

  const rows: [string, string][] = [
    ['Station', station?.name ?? fallback.name],
    [
      'Status',
      status === 'live'
        ? 'Online'
        : status === 'offline'
          ? 'Offline'
          : status === 'loading'
            ? 'Checking…'
            : 'Unavailable',
    ],
  ];
  if (station) {
    if (station.type) rows.push(['Type', TYPES[station.type] ?? station.type]);
    if (station.operator) rows.push(['Operated by', station.operator]);
    rows.push(['Station ID', station.id]);
    if (station.address) rows.push(['Address', station.address]);
    else
      rows.push([
        'Location',
        [station.city, station.province, station.country].filter(Boolean).join(', '),
      ]);
  }
  rows.push([
    'Coordinates',
    `${(station?.lat ?? fallback.lat).toFixed(6)}°N, ${(station?.lon ?? fallback.lon).toFixed(6)}°E`,
  ]);
  // KloudTrack reports 0 when the elevation hasn't been set.
  if (station?.elevation_m) rows.push(['Elevation', `${Math.round(station.elevation_m)} m`]);
  if (station?.active_since) rows.push(['Active since', manilaDate(station.active_since)]);
  if (r?.recorded_at) {
    rows.push([
      'Latest reading',
      `${manilaDate(r.recorded_at)}, ${manilaTime(r.recorded_at)}${r.id ? ` (#${r.id})` : ''}`,
    ]);
  }
  rows.push(['Refreshes', `Every ${REFRESH_MS / 60000} minutes while this page is open`]);

  return (
    <dl className="station-details" aria-label="Weather station details">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
