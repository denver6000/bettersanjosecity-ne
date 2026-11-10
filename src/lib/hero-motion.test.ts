import test from 'node:test';
import assert from 'node:assert/strict';
import {
  birdPose,
  cloudX,
  fireflyTarget,
  rippleRate,
  stalkTarget,
  timelapseHour,
  crawl,
  fireflyChasesCursor,
  raiseEase,
} from './hero-motion.ts';

test('cloudX advances faster in wind', () => {
  assert.equal(cloudX(100, 1, 0, 0), 103.6);
  assert.ok(cloudX(100, 1, 30, 0) > cloudX(100, 1, 0, 0));
});

test('cloudX wraps past 1850 to -320', () => {
  assert.equal(cloudX(1849, 1, 0, 0), -320);
});

test('birdPose is unscattered at 0 and moves up and right at 1', () => {
  const bird = { index: 0, y: 200, speed: 70, offset: 0, phase: 0 };
  const calm = birdPose(0, bird, 0);
  assert.deepEqual(calm, { x: -150, y: 200 });
  const scared = birdPose(0, bird, 1);
  assert.ok(scared.x > calm.x);
  assert.ok(scared.y < calm.y);
});

test('rippleRate depends on weather, rainfall and showers', () => {
  assert.equal(rippleRate('clear', 0, false), 0);
  assert.equal(rippleRate('cloudy', 5, false), 0);
  assert.equal(rippleRate('rain', 0, false), 4);
  assert.equal(rippleRate('rain', 4, false), 12);
  assert.equal(rippleRate('rain', 40, false), 12);
  assert.equal(rippleRate('storm', 0, false), 14);
  assert.equal(rippleRate('clear', 0, true), 7);
  assert.equal(rippleRate('rain', 4, true), 19);
});

test('fireflyTarget stays near its base', () => {
  const base = { x: 600, y: 700 };
  for (let t = 0; t < 60; t += 0.7) {
    const p = fireflyTarget(base, t, 2);
    assert.ok(Math.abs(p.x - base.x) <= 40 + 1e-9);
    assert.ok(Math.abs(p.y - base.y) <= 24 + 1e-9);
  }
});

test('stalkTarget leans away from the cursor', () => {
  assert.ok(stalkTarget(900, 1000, 800, true, 0, 0) < 0);
  assert.ok(stalkTarget(900, 800, 800, true, 0, 0) > 0);
  assert.ok(Math.abs(stalkTarget(1000, 1000, 800, true, 0, 0)) > 20);
});

test('stalkTarget is idle far from the cursor, with no cursor, and above the grass', () => {
  assert.ok(Math.abs(stalkTarget(0, 1500, 800, true, 3, 1)) <= 2.4);
  assert.ok(Math.abs(stalkTarget(900, null, null, true, 3, 1)) <= 2.4);
  assert.ok(Math.abs(stalkTarget(900, 900, 300, true, 3, 1)) <= 2.4);
});

test('timelapseHour returns to the real hour', () => {
  assert.equal(timelapseHour(12, 14000, 14000), 12);
  assert.equal(timelapseHour(12, 20000, 14000), 12);
  assert.equal(timelapseHour(12, 0, 14000), 12);
  assert.equal(timelapseHour(12, 7000, 14000), 0);
});

test('timelapseHour moves forward through the whole day', () => {
  let travelled = 0;
  let prev = timelapseHour(8, 0, 14000);
  for (let i = 1; i <= 9; i++) {
    const h = timelapseHour(8, (i / 10) * 14000, 14000);
    const step = (h - prev + 24) % 24;
    assert.ok(step >= 0 && step < 12);
    travelled += step;
    prev = h;
  }
  assert.ok(travelled > 20 && travelled < 24);
});

test('crawl keeps a figure visible when motion is reduced', () => {
  const r = crawl(0, 5, 520, true);
  assert.equal(r.fade, 1);
  assert.equal(r.dx, 260);
});

test('crawl fades at the ends of its span and moves on', () => {
  assert.equal(crawl(0, 5, 520, false).fade, 0);
  assert.equal(crawl(40, 5, 520, false).fade, 1);
  assert.equal(crawl(10, 5, 520, false).dx, 50);
});

test('fireflyChasesCursor is off on Remember days and by day', () => {
  assert.equal(fireflyChasesCursor('celebrate', 0.9, true), true);
  assert.equal(fireflyChasesCursor('remember', 0.9, true), false);
  assert.equal(fireflyChasesCursor(null, 0.4, true), false);
  assert.equal(fireflyChasesCursor(null, 0.9, false), false);
});

test('raiseEase rises at most 1/120 per second and never falls', () => {
  assert.equal(raiseEase(0.5, 1, 30), 0.75);
  assert.equal(raiseEase(0.9, 1, 30), 1);
  assert.equal(raiseEase(0.6, 0, 30), 0.6);
  assert.equal(raiseEase(0, 0.1, 30), 0.1);
});
