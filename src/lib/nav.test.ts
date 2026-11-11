import test from 'node:test';
import assert from 'node:assert/strict';
import { isActivePath } from './nav.ts';

test('home only matches home', () => {
  assert.equal(isActivePath('/', '/'), true);
  assert.equal(isActivePath('/services', '/'), false);
});

test('exact and nested paths match', () => {
  assert.equal(isActivePath('/government', '/government'), true);
  assert.equal(isActivePath('/government/', '/government'), true);
  assert.equal(isActivePath('/business-taxes/estimator', '/business-taxes'), true);
});

test('prefix without a slash does not match', () => {
  assert.equal(isActivePath('/business-taxesx', '/business-taxes'), false);
});
