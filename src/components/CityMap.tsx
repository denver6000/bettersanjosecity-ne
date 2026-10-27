'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { SITE } from '@/config/site';
import { useStation, type Station } from '@/lib/station';

const STATION = SITE.weatherStation;
const RADIUS_M = STATION.radiusKm * 1000;
// Bounding box of the coverage circle for the iframe fallback (1° lat ≈ 111.32 km).
const DLAT = STATION.radiusKm / 111.32;
const DLON = DLAT / Math.cos((STATION.lat * Math.PI) / 180);
const EMBED_URL =
  `https://www.openstreetmap.org/export/embed.html?bbox=${STATION.lon - DLON}%2C${STATION.lat - DLAT}%2C${STATION.lon + DLON}%2C${STATION.lat + DLAT}` +
  `&layer=mapnik&marker=${STATION.lat}%2C${STATION.lon}`;

function pinHtml(station: Station | null, live: boolean) {
  const t = live ? station?.reading?.temperature_c : null;
  return (
    `<span class="station-pin${live ? ' is-live' : ''}">` +
    `<span class="station-pin-head"><i class="bi bi-broadcast"></i></span>` +
    (t != null ? `<span class="station-pin-temp">${Math.round(t)}°C</span>` : '') +
    `</span>`
  );
}

/**
 * Leaflet map of the weather station and its 10 km coverage radius. Leaflet touches
 * `window` on import, so it is loaded dynamically inside the effect. Falls back to the
 * OSM embed iframe when tiles are blocked (some shared hosts inject a CSP that blocks
 * tile images).
 */
export default function CityMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [useIframe, setUseIframe] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const layersRef = useRef<{
    marker: import('leaflet').Marker;
    circle: import('leaflet').Circle;
    label: import('leaflet').Marker;
    L: typeof import('leaflet');
  } | null>(null);
  const { station, status } = useStation();

  useEffect(() => {
    if (useIframe || !containerRef.current) return;
    let map: import('leaflet').Map | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current) return;

      map = L.map(containerRef.current, {
        center: [STATION.lat, STATION.lon],
        zoom: 12,
        zoomSnap: 0.5, // lets fitBounds hug the radius more closely on small screens
        scrollWheelZoom: false,
        keyboard: true,
        keyboardPanDelta: 80,
      });

      const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      });
      let loaded = false;
      let errors = 0;
      tiles.on('tileload', () => {
        loaded = true;
      });
      tiles.on('tileerror', () => {
        if (!loaded && ++errors >= 3) setUseIframe(true);
      });
      tiles.addTo(map);

      const circle = L.circle([STATION.lat, STATION.lon], {
        radius: RADIUS_M,
        color: '#0032a0',
        weight: 2,
        dashArray: '6 6',
        fillColor: '#0032a0',
        fillOpacity: 0.07,
        interactive: false,
      }).addTo(map);

      // "10 km" tag on the circle's northern edge.
      const label = L.marker([STATION.lat + DLAT, STATION.lon], {
        icon: L.divIcon({
          className: 'station-radius-label',
          html: `<span>${STATION.radiusKm} km radius</span>`,
          iconSize: [96, 24],
          iconAnchor: [48, 12],
        }),
        interactive: false,
        keyboard: false,
      }).addTo(map);

      const marker = L.marker([STATION.lat, STATION.lon], {
        icon: L.divIcon({
          className: 'station-marker',
          html: pinHtml(null, false),
          iconSize: [44, 54],
          iconAnchor: [22, 54],
          popupAnchor: [0, -50],
        }),
        keyboard: true,
        title: STATION.name,
        zIndexOffset: 1000,
      })
        .bindPopup(`<strong>${STATION.name}</strong><br>KloudTrack weather station`)
        .addTo(map);

      const fit = () => map?.fitBounds(circle.getBounds(), { padding: [12, 12] });
      fit();
      layersRef.current = { marker, circle, label, L };
      setMapReady(true);

      // The map card stretches to the weather card's height after layout; re-measure
      // so Leaflet doesn't leave untiled grey areas, and keep the whole radius in view.
      resizeObserver = new ResizeObserver(() => {
        map?.invalidateSize();
        fit();
      });
      resizeObserver.observe(containerRef.current);
    });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      layersRef.current = null;
      setMapReady(false);
      map?.remove();
    };
  }, [useIframe]);

  // Refresh the pin (temperature, live state, exact position) with each reading.
  useEffect(() => {
    const layers = layersRef.current;
    if (!mapReady || !layers || !station) return;
    const { marker, circle, label, L } = layers;
    const live = status === 'live';
    const pos = L.latLng(station.lat, station.lon);
    marker.setLatLng(pos);
    circle.setLatLng(pos);
    label.setLatLng([station.lat + DLAT, station.lon]);
    marker.setIcon(
      L.divIcon({
        className: 'station-marker',
        html: pinHtml(station, live),
        iconSize: [44, 54],
        iconAnchor: [22, 54],
        popupAnchor: [0, -50],
      })
    );
    const t = station.reading?.temperature_c;
    marker.setPopupContent(
      `<strong>${station.name}</strong><br>${live ? 'Live' : 'Offline'} &middot; KloudTrack weather station` +
        (live && t != null ? `<br>${t.toFixed(1)}°C` : '') +
        `<br><small>${STATION.radiusKm} km radius shown</small>`
    );
  }, [mapReady, station, status]);

  if (useIframe) {
    return (
      <div id="map-container" data-map-loaded="iframe">
        <iframe
          className="map-iframe"
          src={EMBED_URL}
          title={`Map of the ${STATION.name} weather station`}
          loading="lazy"
          style={{ border: 0, display: 'block', width: '100%', height: '100%' }}
        />
      </div>
    );
  }

  return (
    <div
      id="map-container"
      ref={containerRef}
      role="application"
      aria-label={`Map of the ${STATION.name} weather station and the ${STATION.radiusKm} km area around it`}
      data-map-loaded="leaflet"
    />
  );
}
