// Pure helpers for the hero art tooling: find the separate objects on a transparent sprite sheet,
// and compare two same-size alpha masks. No imports; alpha planes are Uint8Array (one byte per pixel).

/**
 * Connected blobs of pixels whose alpha is above `threshold`, as boxes. Blobs smaller than `minArea`
 * are ignored; boxes closer than `gap` px (both ways) are merged so a parol and its tail stay one
 * sprite. Sorted top-to-bottom, then left-to-right.
 */
export function findSprites(alpha, width, height, opts = {}) {
  const { threshold = 16, minArea = 400, gap = 8 } = opts;
  const seen = new Uint8Array(width * height);
  const boxes = [];
  const stack = new Int32Array(width * height);

  for (let start = 0; start < alpha.length; start++) {
    if (seen[start] || alpha[start] <= threshold) continue;
    let sp = 0;
    stack[sp++] = start;
    seen[start] = 1;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let area = 0;
    while (sp > 0) {
      const p = stack[--sp];
      const x = p % width;
      const y = (p - x) / width;
      area++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const q = ny * width + nx;
          if (!seen[q] && alpha[q] > threshold) {
            seen[q] = 1;
            stack[sp++] = q;
          }
        }
      }
    }
    if (area >= minArea)
      boxes.push({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1, area });
  }

  const apart = (a, b) =>
    Math.max(0, a.x - (b.x + b.w), b.x - (a.x + a.w)) >= gap ||
    Math.max(0, a.y - (b.y + b.h), b.y - (a.y + a.h)) >= gap;
  let merged = true;
  while (merged) {
    merged = false;
    outer: for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        if (apart(boxes[i], boxes[j])) continue;
        const a = boxes[i];
        const b = boxes[j];
        const x = Math.min(a.x, b.x);
        const y = Math.min(a.y, b.y);
        boxes[i] = {
          x,
          y,
          w: Math.max(a.x + a.w, b.x + b.w) - x,
          h: Math.max(a.y + a.h, b.y + b.h) - y,
          area: a.area + b.area,
        };
        boxes.splice(j, 1);
        merged = true;
        break outer;
      }
    }
  }
  return boxes.sort((a, b) => a.y - b.y || a.x - b.x);
}

/** Intersection over union of the opaque pixels of two same-size alpha planes, optionally in a region. */
export function maskIoU(a, b, region, width) {
  let inter = 0;
  let union = 0;
  const test = (i) => {
    const oa = a[i] > 16;
    const ob = b[i] > 16;
    if (oa && ob) inter++;
    if (oa || ob) union++;
  };
  if (region && width) {
    for (let y = region.y; y < region.y + region.h; y++)
      for (let x = region.x; x < region.x + region.w; x++) test(y * width + x);
  } else {
    for (let i = 0; i < a.length; i++) test(i);
  }
  return union === 0 ? 1 : inter / union;
}

/** Grows a binary mask by `radius` px in every direction (square window, separable). */
function dilate(bin, width, height, radius) {
  const tmp = new Uint8Array(bin.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let hit = 0;
      for (let k = Math.max(0, x - radius); k <= Math.min(width - 1, x + radius); k++) {
        if (bin[y * width + k]) {
          hit = 1;
          break;
        }
      }
      tmp[y * width + x] = hit;
    }
  }
  const out = new Uint8Array(bin.length);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let hit = 0;
      for (let k = Math.max(0, y - radius); k <= Math.min(height - 1, y + radius); k++) {
        if (tmp[k * width + x]) {
          hit = 1;
          break;
        }
      }
      out[y * width + x] = hit;
    }
  }
  return out;
}

/**
 * How well two alpha masks agree once a thin edge fringe is forgiven: the smaller of "the share of
 * A's pixels within `radius` px of B" and "the share of B's pixels within `radius` px of A", inside
 * an optional region. A 1 to 3 px fringe (thin palm fronds) scores about 1; a real drift scores low.
 */
export function maskOverlap(a, b, region, width, radius = 3) {
  const height = a.length / width;
  const A = a.map((v) => (v > 16 ? 1 : 0));
  const B = b.map((v) => (v > 16 ? 1 : 0));
  const dA = dilate(A, width, height, radius);
  const dB = dilate(B, width, height, radius);
  const r = region ?? { x: 0, y: 0, w: width, h: height };
  let nA = 0;
  let nB = 0;
  let aNearB = 0;
  let bNearA = 0;
  for (let y = r.y; y < r.y + r.h; y++) {
    for (let x = r.x; x < r.x + r.w; x++) {
      const i = y * width + x;
      if (A[i]) {
        nA++;
        if (dB[i]) aNearB++;
      }
      if (B[i]) {
        nB++;
        if (dA[i]) bNearA++;
      }
    }
  }
  return Math.min(nA ? aNearB / nA : 1, nB ? bNearA / nB : 1);
}
