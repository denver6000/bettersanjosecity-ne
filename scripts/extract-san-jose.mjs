// One-off: cut San Jose City's barangays out of the full-resolution PSGC shapefile.
// Usage: node scripts/extract-san-jose.mjs <dir with PH_Adm4_BgySubMuns.{shp,shx,dbf}>
// Writes scripts/source/san-jose-city-barangays.json (rings as [lon, lat]; all parts per barangay).
// Source: faeldon/philippines-psgc-shapefiles v1.0.1 (MIT); boundaries NAMRIA and PSA via OCHA COD-AB, CC BY-IGO.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) {
  console.error('usage: node scripts/extract-san-jose.mjs <shapefile dir>');
  process.exit(1);
}
const CITY = 304926000;
const base = join(dir, 'PH_Adm4_BgySubMuns');
const dbf = readFileSync(`${base}.dbf`);
const shx = readFileSync(`${base}.shx`);
const shp = readFileSync(`${base}.shp`);

const count = dbf.readUInt32LE(4);
const headerLen = dbf.readUInt16LE(8);
const recLen = dbf.readUInt16LE(10);
const fields = [];
for (let o = 32; dbf[o] !== 0x0d; o += 32) {
  fields.push({
    name: dbf.toString('latin1', o, o + 11).replace(/\0.*$/, ''),
    len: dbf[o + 16],
  });
}
console.log('dbf fields:', fields.map((f) => f.name).join(', '));

function attrs(i) {
  let o = headerLen + i * recLen + 1;
  const row = {};
  for (const f of fields) {
    row[f.name] = dbf.toString('utf8', o, o + f.len).trim();
    o += f.len;
  }
  return row;
}

function parts(i) {
  const at = shx.readUInt32BE(100 + i * 8) * 2;
  const c = at + 8;
  if (shp.readInt32LE(c) !== 5) throw new Error(`record ${i} is not a polygon`);
  const nParts = shp.readInt32LE(c + 36);
  const nPoints = shp.readInt32LE(c + 40);
  const starts = Array.from({ length: nParts }, (_, k) => shp.readInt32LE(c + 44 + k * 4));
  const p0 = c + 44 + nParts * 4;
  const pts = Array.from({ length: nPoints }, (_, k) => [
    shp.readDoubleLE(p0 + k * 16),
    shp.readDoubleLE(p0 + k * 16 + 8),
  ]);
  return starts.map((s, k) => pts.slice(s, k + 1 < nParts ? starts[k + 1] : nPoints));
}

const features = [];
for (let i = 0; i < count; i++) {
  const a = attrs(i);
  if (Number(a.adm3_psgc) !== CITY || a.geo_level !== 'Bgy') continue;
  features.push({ id: a.adm4_psgc, name: a.adm4_en, geomSrc: a.geom_src, rings: parts(i) });
}
console.log(
  `${features.length} barangays,`,
  features.reduce((s, f) => s + f.rings.flat().length, 0),
  'points'
);
writeFileSync(
  'scripts/source/san-jose-city-barangays.json',
  JSON.stringify({ psgc: CITY, source: 'faeldon/philippines-psgc-shapefiles v1.0.1', features })
);
