import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assignTones,
  chaikin,
  decodeTopology,
  maxDriftMeters,
  pointsToPath,
  ringToPoints,
} from './barangay-map.mjs';

test('decodeTopology applies transform and deltas', () => {
  const topo = {
    transform: { scale: [0.5, 0.5], translate: [10, 20] },
    arcs: [
      [
        [2, 2],
        [2, 0],
        [0, 2],
      ],
    ],
    objects: {},
  };
  assert.deepEqual(decodeTopology(topo).arcs[0], [
    [11, 21],
    [12, 21],
    [12, 22],
  ]);
});

test('chaikin keeps both ends of an open arc', () => {
  const line = [
    [0, 0],
    [10, 0],
    [10, 10],
  ];
  const out = chaikin(line, 2);
  assert.deepEqual(out[0], [0, 0]);
  assert.deepEqual(out.at(-1), [10, 10]);
  assert.ok(out.length > line.length);
});

test('chaikin on a 2-point arc returns the same straight line end points', () => {
  const out = chaikin(
    [
      [0, 0],
      [4, 4],
    ],
    2
  );
  assert.deepEqual(out[0], [0, 0]);
  assert.deepEqual(out.at(-1), [4, 4]);
  for (const [x, y] of out) assert.equal(x, y);
});

test('chaikin closes a closed ring without a corner at the seam', () => {
  const square = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
    [0, 0],
  ];
  const out = chaikin(square, 1);
  assert.deepEqual(out[0], out.at(-1));
  assert.ok(!out.some(([x, y]) => x === 0 && y === 0));
});

test('maxDriftMeters is zero for identical lines and about 111 m for a 0.001 degree latitude offset', () => {
  const line = [
    [121, 15.8],
    [121.01, 15.8],
  ];
  assert.equal(maxDriftMeters(line, line), 0);
  const shifted = line.map(([x, y]) => [x, y + 0.001]);
  const d = maxDriftMeters(line, shifted);
  assert.ok(d > 110 && d < 113, `got ${d}`);
});

test('ringToPoints reverses a negative arc index', () => {
  const arcs = [
    [
      [0, 0],
      [1, 0],
    ],
    [
      [1, 1],
      [1, 0],
    ],
  ];
  assert.deepEqual(ringToPoints([0, ~1], arcs), [
    [0, 0],
    [1, 0],
    [1, 1],
  ]);
});

test('pointsToPath rounds to one decimal and closes with Z', () => {
  assert.equal(
    pointsToPath([
      [0.04, 1.26],
      [10, 20.449],
      [5.55, 5],
    ]),
    'M0 1.3L10 20.4L5.6 5Z'
  );
});

const k4 = new Map([
  ['a', new Set(['b', 'c', 'd'])],
  ['b', new Set(['a', 'c', 'd'])],
  ['c', new Set(['a', 'b', 'd'])],
  ['d', new Set(['a', 'b', 'c'])],
]);

test('assignTones never gives neighbours the same tone', () => {
  const tones = assignTones(k4, 4);
  for (const [id, nbrs] of k4) for (const n of nbrs) assert.notEqual(tones.get(id), tones.get(n));
});

test('assignTones throws when maxTones is too small', () => {
  assert.throws(() => assignTones(k4, 3));
});
