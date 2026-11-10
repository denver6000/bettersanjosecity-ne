// Geometry helpers for scripts/build-barangay-map.mjs. Points are [x, y]; lon/lat unless noted.

const M_PER_DEG = 111320;

/** Applies the topology transform and delta-decodes every arc into [lon, lat] points. */
export function decodeTopology(topo) {
  const { scale, translate } = topo.transform;
  const arcs = topo.arcs.map((arc) => {
    let x = 0;
    let y = 0;
    return arc.map(([dx, dy]) => {
      x += dx;
      y += dy;
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
    });
  });
  return { arcs, objects: topo.objects };
}

const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const same = (a, b) => a[0] === b[0] && a[1] === b[1];

function pass(points) {
  const closed = points.length > 2 && same(points[0], points.at(-1));
  if (closed) {
    const ring = points.slice(0, -1);
    const out = ring.flatMap((p, i) => {
      const q = ring[(i + 1) % ring.length];
      return [lerp(p, q, 0.25), lerp(p, q, 0.75)];
    });
    return [...out, out[0]];
  }
  const out = [points[0]];
  for (let i = 0; i < points.length - 1; i++) {
    out.push(lerp(points[i], points[i + 1], 0.25), lerp(points[i], points[i + 1], 0.75));
  }
  out.push(points.at(-1));
  return out;
}

/** Chaikin corner cutting. An open arc keeps both ends; a closed ring is smoothed around its seam. */
export function chaikin(points, passes) {
  let out = points;
  for (let i = 0; i < passes; i++) out = pass(out);
  return out;
}

/** Equirectangular projection to metres around (lat0, lon0); y is flipped so north is up. */
export function projector(lat0, lon0) {
  const cos = Math.cos((lat0 * Math.PI) / 180);
  return ([lon, lat]) => [(lon - lon0) * M_PER_DEG * cos, -(lat - lat0) * M_PER_DEG];
}

function distToSegment(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  const k =
    len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
  return Math.hypot(p[0] - (a[0] + k * dx), p[1] - (a[1] + k * dy));
}

function maxDistTo(points, line) {
  let worst = 0;
  for (const p of points) {
    let best = Infinity;
    for (let i = 0; i < line.length - 1; i++)
      best = Math.min(best, distToSegment(p, line[i], line[i + 1]));
    worst = Math.max(worst, best);
  }
  return worst;
}

/**
 * Largest gap in metres between the two lines, measured both ways: smoothed points to the
 * original line and original points to the smoothed line (a cut corner only shows in the second).
 */
export function maxDriftMeters(original, smoothed) {
  const lat0 = original.reduce((s, p) => s + p[1], 0) / original.length;
  const project = projector(lat0, original[0][0]);
  const o = original.map(project);
  const s = smoothed.map(project);
  return Math.max(maxDistTo(s, o), maxDistTo(o, s));
}

/** Joins a ring's arcs in order; a negative index `i` is arc `~i` reversed. */
export function ringToPoints(ring, arcs) {
  const out = [];
  for (const idx of ring) {
    const arc = idx >= 0 ? arcs[idx] : [...arcs[~idx]].reverse();
    out.push(...(out.length ? arc.slice(1) : arc));
  }
  return out;
}

const r1 = (v) => Math.round(v * 10) / 10;

/** SVG path `M x y L x y … Z` with coordinates rounded to one decimal. */
export function pointsToPath(points) {
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${r1(x)} ${r1(y)}`).join('') + 'Z';
}

/** Greedy colouring, most neighbours first. Throws when more than `maxTones` are needed. */
export function assignTones(adjacency, maxTones) {
  const tones = new Map();
  const ids = [...adjacency.keys()].sort((a, b) => adjacency.get(b).size - adjacency.get(a).size);
  for (const id of ids) {
    const used = new Set([...adjacency.get(id)].map((n) => tones.get(n)));
    let t = 0;
    while (used.has(t)) t++;
    if (t >= maxTones) throw new Error(`assignTones: ${id} needs tone ${t}, max is ${maxTones}`);
    tones.set(id, t);
  }
  return tones;
}
