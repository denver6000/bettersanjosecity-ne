import test from 'node:test';
import assert from 'node:assert/strict';
import { findSprites, maskIoU } from './sprites.mjs';

const W = 200;
const H = 160;
const blank = () => new Uint8Array(W * H);
function rect(a, x, y, w, h) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) a[j * W + i] = 255;
}

test('findSprites finds separate blobs in reading order', () => {
  const a = blank();
  rect(a, 120, 10, 30, 30); // top right
  rect(a, 10, 10, 30, 30); // top left
  rect(a, 10, 100, 30, 30); // bottom left
  const s = findSprites(a, W, H);
  assert.deepEqual(
    s.map((b) => [b.x, b.y, b.w, b.h]),
    [
      [10, 10, 30, 30],
      [120, 10, 30, 30],
      [10, 100, 30, 30],
    ]
  );
  assert.equal(s[0].area, 900);
});

test('findSprites ignores specks below minArea', () => {
  const a = blank();
  rect(a, 10, 10, 30, 30);
  rect(a, 100, 100, 5, 5);
  assert.equal(findSprites(a, W, H).length, 1);
  assert.equal(findSprites(a, W, H, { minArea: 10 }).length, 2);
});

test('findSprites merges blobs closer than the gap and keeps distant ones apart', () => {
  const near = blank();
  rect(near, 10, 10, 30, 30);
  rect(near, 45, 10, 30, 30); // 5 px apart
  assert.equal(findSprites(near, W, H).length, 1);
  assert.deepEqual(
    (({ x, y, w, h }) => [x, y, w, h])(findSprites(near, W, H)[0]),
    [10, 10, 65, 30]
  );
  const far = blank();
  rect(far, 10, 10, 30, 30);
  rect(far, 60, 10, 30, 30); // 20 px apart
  assert.equal(findSprites(far, W, H).length, 2);
});

test('findSprites returns no sprites for an empty image', () => {
  assert.deepEqual(findSprites(blank(), W, H), []);
});

test('maskIoU is 1 for identical masks, 0 for disjoint ones, and respects the region', () => {
  const a = blank();
  rect(a, 10, 10, 30, 30);
  assert.equal(maskIoU(a, a), 1);
  const b = blank();
  rect(b, 100, 100, 30, 30);
  assert.equal(maskIoU(a, b), 0);

  const c = blank();
  rect(c, 10, 10, 30, 30);
  rect(c, 150, 100, 30, 30); // extra blob outside the region
  const region = { x: 0, y: 0, w: 100, h: 100 };
  assert.equal(maskIoU(a, c, region, W), 1);
  assert.ok(maskIoU(a, c) < 1);
});
