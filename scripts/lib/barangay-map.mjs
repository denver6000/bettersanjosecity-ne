// Geometry helpers for scripts/build-barangay-map.mjs. Points are planar [x, y] in metres.

const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const same = (a, b) => a[0] === b[0] && a[1] === b[1];
const key = (p) => `${p[0]},${p[1]}`;
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1];

// Cuts each segment at k from both ends: a quarter of it, but never more than maxCut metres.
function cut(p, q, maxCut) {
  const k = Math.min(0.25, maxCut / (Math.hypot(q[0] - p[0], q[1] - p[1]) || 1));
  return [lerp(p, q, k), lerp(p, q, 1 - k)];
}

function pass(points, maxCut) {
  if (points.length > 2 && same(points[0], points.at(-1))) {
    const ring = points.slice(0, -1);
    const out = ring.flatMap((p, i) => cut(p, ring[(i + 1) % ring.length], maxCut));
    return [...out, out[0]];
  }
  const out = [points[0]];
  for (let i = 0; i < points.length - 1; i++) out.push(...cut(points[i], points[i + 1], maxCut));
  out.push(points.at(-1));
  return out;
}

/**
 * Chaikin corner cutting. An open arc keeps both ends; a closed ring is smoothed around its seam.
 * `maxCut` (metres) stops a corner between two long straight segments being rounded off hugely.
 */
export function chaikin(points, passes, maxCut = Infinity) {
  let out = points;
  for (let i = 0; i < passes; i++) out = pass(out, maxCut);
  return out;
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
 * Largest gap in metres between two lines, measured both ways: smoothed points to the original
 * line and original points to the smoothed line (a cut corner only shows in the second).
 */
export function maxGapMeters(original, smoothed) {
  return Math.max(maxDistTo(smoothed, original), maxDistTo(original, smoothed));
}

function dpOpen(pts, tol) {
  if (pts.length < 3) return pts;
  const a = pts[0];
  const b = pts.at(-1);
  let worst = 0;
  let at = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = distToSegment(pts[i], a, b);
    if (d > worst) {
      worst = d;
      at = i;
    }
  }
  if (worst <= tol) return [a, b];
  return [...dpOpen(pts.slice(0, at + 1), tol), ...dpOpen(pts.slice(at), tol).slice(1)];
}

/** Douglas-Peucker. Keeps both ends; a closed ring is split at its farthest point first. */
export function simplify(points, tol) {
  if (!(points.length > 3 && same(points[0], points.at(-1)))) return dpOpen(points, tol);
  let at = 0;
  let far = 0;
  points.forEach((p, i) => {
    const d = Math.hypot(p[0] - points[0][0], p[1] - points[0][1]);
    if (d > far) {
      far = d;
      at = i;
    }
  });
  return [...dpOpen(points.slice(0, at + 1), tol), ...dpOpen(points.slice(at), tol).slice(1)];
}

/**
 * Splits polygons into arcs so a border shared by two polygons becomes ONE arc, which can then be
 * simplified and smoothed once. `polygons` maps id to rings (closed, first point repeated last).
 * Returns the unique arcs and, per id, each ring as signed arc indices (`~i` = arc i reversed).
 */
export function splitIntoArcs(polygons) {
  const edgeKey = (p, q) => [key(p), key(q)].sort().join('|');
  const owners = new Map();
  const loops = [];
  for (const [id, rings] of polygons) {
    for (const ring of rings) {
      const pts = ring.slice(0, -1);
      loops.push({ id, pts });
      pts.forEach((p, i) => {
        const e = edgeKey(p, pts[(i + 1) % pts.length]);
        if (!owners.has(e)) owners.set(e, new Set());
        owners.get(e).add(id);
      });
    }
  }
  const sig = (p, q) => [...owners.get(edgeKey(p, q))].sort().join(',');

  const arcs = [];
  const index = new Map();
  const intern = (pts) => {
    const fwd = pts.map(key).join(';');
    const rev = [...pts].reverse().map(key).join(';');
    const canon = fwd <= rev ? fwd : rev;
    let i = index.get(canon);
    if (i === undefined) {
      i = arcs.length;
      arcs.push(fwd <= rev ? pts : [...pts].reverse());
      index.set(canon, i);
    }
    return fwd <= rev ? i : ~i;
  };

  const rings = new Map([...polygons.keys()].map((id) => [id, []]));
  for (const { id, pts } of loops) {
    const n = pts.length;
    const at = (i) => pts[((i % n) + n) % n];
    const breaks = pts.flatMap((_, i) =>
      sig(at(i - 1), at(i)) === sig(at(i), at(i + 1)) ? [] : [i]
    );
    const ring = [];
    if (breaks.length === 0) {
      const m = pts.reduce((best, p, i) => (cmp(p, pts[best]) < 0 ? i : best), 0);
      const rot = pts.map((_, i) => at(m + i));
      ring.push(intern([...rot, rot[0]]));
    } else {
      breaks.forEach((from, k) => {
        const to = k + 1 < breaks.length ? breaks[k + 1] : breaks[0] + n;
        ring.push(intern(Array.from({ length: to - from + 1 }, (_, j) => at(from + j))));
      });
    }
    rings.get(id).push(ring);
  }
  return { arcs, rings };
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
