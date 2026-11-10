import test from 'node:test';
import assert from 'node:assert/strict';
import { birdPose, cloudX, fireflyTarget, rippleRate } from './hero-motion.ts';

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
