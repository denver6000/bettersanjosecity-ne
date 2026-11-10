// Builds src/data/barangay-shapes.json from scripts/source/san-jose-city-barangays.json
// (cut from the full-resolution PSGC shapefile by scripts/extract-san-jose.mjs).
// Boundaries: NAMRIA and PSA via OCHA COD-AB, CC BY-IGO.
// Usage: node scripts/build-barangay-map.mjs [--tol=12] [--passes=2]
import { readFileSync, writeFileSync } from 'node:fs';
import {
  assignTones,
  chaikin,
  maxGapMeters,
  pointsToPath,
  ringToPoints,
  simplify,
  splitIntoArcs,
} from './lib/barangay-map.mjs';

const SOURCE = 'scripts/source/san-jose-city-barangays.json';
const OUT = 'src/data/barangay-shapes.json';
const MAX_DRIFT_M = 40;
const MAX_TONES = 5;
const arg = (name, dflt) =>
  Number(process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? dflt);
const TOL = arg('tol', 15);
const PASSES = arg('passes', 2);
const CUT = arg('cut', 25);

const EXPECTED = [
  'A. Pascual',
  'Abar 1st',
  'Abar 2nd',
  'Bagong Sikat',
  'Caanawan',
  'Calaocan',
  'Camanacsacan',
  'Canuto Ramos Pob.',
  'Crisanto Sanchez Pob.',
  'Culaylay',
  'Dizol',
  'Ferdinand E. Marcos Pob.',
  'Kaliwanagan',
  'Kita-Kita',
  'Malasin',
  'Manicla',
  'Palestina',
  'Parang Mangga',
  'Pinili',
  'Porais',
  'Rafael Rueda, Sr. Pob.',
  'Raymundo Eugenio Pob.',
  'San Agustin',
  'San Juan',
  'San Mauricio',
  'Santo Niño 1st',
  'Santo Niño 2nd',
  'Santo Niño 3rd',
  'Santo Tomas',
  'Sibut',
  'Sinipit Bubon',
  'Tabulac',
  'Tayabo',
  'Tondod',
  'Tulat',
  'Villa Floresta',
  'Villa Joson',
  'Villa Marina',
];
const NAME_FIX = { 'Abar Ist': 'Abar 1st' };

function fail(msg) {
  console.error(`build-barangay-map: ${msg}`);
  process.exit(1);
}

const { features } = JSON.parse(readFileSync(SOURCE, 'utf8'));
const { arcs, rings } = splitIntoArcs(new Map(features.map((f) => [f.id, f.rings])));

let worst = { m: 0, arc: -1 };
const smoothed = arcs.map((a, i) => {
  const s = chaikin(simplify(a, TOL), PASSES, CUT);
  const m = maxGapMeters(a, s);
  if (m > worst.m) worst = { m, arc: i };
  return s;
});
const inPts = arcs.reduce((n, a) => n + a.length, 0);
const outPts = smoothed.reduce((n, a) => n + a.length, 0);
console.log(
  `tol=${TOL} m, passes=${PASSES}: ${arcs.length} arcs, ${inPts} -> ${outPts} points, worst drift ${worst.m.toFixed(1)} m (arc ${worst.arc})`
);
if (worst.m > MAX_DRIFT_M)
  fail(`drift ${worst.m.toFixed(1)} m on arc ${worst.arc} exceeds ${MAX_DRIFT_M} m`);

const all = smoothed.flat();
const minX = Math.min(...all.map((p) => p[0]));
const maxY = Math.max(...all.map((p) => p[1]));
const flat = smoothed.map((a) => a.map(([x, y]) => [x - minX, maxY - y]));

const bboxOf = (pts) => {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
};
const r1 = (v) => Math.round(v * 10) / 10;

function centroid(pts) {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const f = x0 * y1 - x1 * y0;
    a += f;
    cx += (x0 + x1) * f;
    cy += (y0 + y1) * f;
  }
  return a === 0 ? bboxOf(pts).slice(0, 2) : [cx / (3 * a), cy / (3 * a)];
}

const arcOwners = new Map();
const items = features.map((f) => {
  const polys = rings.get(f.id).map((ring) => ringToPoints(ring, flat));
  for (const idx of rings.get(f.id).flat()) {
    const k = idx < 0 ? ~idx : idx;
    arcOwners.set(k, [...(arcOwners.get(k) ?? []), f.id]);
  }
  const outer = polys.reduce((best, p) => (p.length > best.length ? p : best), polys[0]);
  return {
    id: f.id,
    name: NAME_FIX[f.name] ?? f.name,
    path: polys.map(pointsToPath).join(''),
    bbox: bboxOf(polys.flat()).map(r1),
    centroid: centroid(outer).map(r1),
  };
});

const adjacency = new Map(items.map((i) => [i.id, new Set()]));
for (const ids of arcOwners.values())
  for (const a of ids) for (const b of ids) if (a !== b) adjacency.get(a).add(b);
const tones = assignTones(adjacency, MAX_TONES);

const barangays = items
  .map((i) => ({ ...i, tone: tones.get(i.id) }))
  .sort((a, b) => a.name.localeCompare(b.name));

const names = barangays.map((b) => b.name);
const missing = EXPECTED.filter((n) => !names.includes(n));
const extra = names.filter((n) => !EXPECTED.includes(n));
if (barangays.length !== 38 || missing.length || extra.length) {
  fail(
    `expected 38 named barangays; got ${barangays.length}, missing [${missing}], unexpected [${extra}]`
  );
}
if (barangays.some((b) => !b.path)) fail('a barangay has an empty path');

const out = {
  attribution: 'NAMRIA and PSA via OCHA COD-AB (CC BY-IGO)',
  city: { bbox: bboxOf(flat.flat()).map(r1) },
  barangays,
};
writeFileSync(OUT, JSON.stringify(out));
console.log(
  `${barangays.length} barangays, tones used: ${Math.max(...tones.values()) + 1}, wrote ${OUT}`
);
