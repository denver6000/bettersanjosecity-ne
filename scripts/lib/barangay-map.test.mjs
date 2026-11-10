import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assignTones,
  chaikin,
  maxGapMeters,
  pointsToPath,
  ringToPoints,
  simplify,
  splitIntoArcs,
} from './barangay-map.mjs';

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

test('chaikin with maxCut keeps a long-segment corner within the cap', () => {
  const corner = [
    [0, 0],
    [1000, 0],
    [1000, 1000],
  ];
  assert.ok(maxGapMeters(corner, chaikin(corner, 1)) > 100);
  assert.ok(maxGapMeters(corner, chaikin(corner, 2, 20)) <= 20);
});

test('maxGapMeters is zero for identical lines and 5 for a line shifted 5 m', () => {
  const line = [
    [0, 0],
    [100, 0],
  ];
  assert.equal(maxGapMeters(line, line), 0);
  assert.equal(
    maxGapMeters(
      line,
      line.map(([x, y]) => [x, y + 5])
    ),
    5
  );
});

test('maxGapMeters sees a cut corner even though every smoothed point lies on the original line', () => {
  const corner = [
    [0, 0],
    [100, 0],
    [100, 100],
  ];
  assert.ok(maxGapMeters(corner, chaikin(corner, 1)) > 15);
});

test('simplify drops points within tolerance and keeps real corners', () => {
  assert.deepEqual(
    simplify(
      [
        [0, 0],
        [5, 0.1],
        [10, 0],
      ],
      1
    ),
    [
      [0, 0],
      [10, 0],
    ]
  );
  assert.equal(
    simplify(
      [
        [0, 0],
        [5, 5],
        [10, 0],
      ],
      1
    ).length,
    3
  );
});

test('simplify keeps a closed ring closed and non-degenerate', () => {
  const square = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
    [0, 0],
  ];
  const out = simplify(square, 1);
  assert.deepEqual(out[0], out.at(-1));
  assert.equal(out.length, 5);
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

const sq = (x0) => [
  [x0, 0],
  [x0 + 10, 0],
  [x0 + 10, 10],
  [x0, 10],
  [x0, 0],
];

test('splitIntoArcs gives two neighbours one shared border arc, used in opposite directions', () => {
  const { arcs, rings } = splitIntoArcs(
    new Map([
      ['a', [sq(0)]],
      ['b', [sq(10)]],
    ])
  );
  assert.equal(arcs.length, 3);
  const a = rings.get('a')[0];
  const b = rings.get('b')[0];
  const shared = a.filter((i) => b.includes(~i));
  assert.equal(shared.length, 1);
  for (const id of ['a', 'b']) {
    const pts = ringToPoints(rings.get(id)[0], arcs);
    assert.deepEqual(pts[0], pts.at(-1));
    assert.equal(pts.length, 5);
  }
});

test('splitIntoArcs keeps a lone ring as one closed arc', () => {
  const { arcs, rings } = splitIntoArcs(new Map([['a', [sq(0)]]]));
  assert.equal(arcs.length, 1);
  assert.deepEqual(arcs[0][0], arcs[0].at(-1));
  assert.equal(rings.get('a')[0].length, 1);
  assert.equal(ringToPoints(rings.get('a')[0], arcs).length, 5);
});

test('splitIntoArcs shares an enclave ring with its host even when the ring starts elsewhere', () => {
  const host = [
    [-10, -10],
    [30, -10],
    [30, 30],
    [-10, 30],
    [-10, -10],
  ];
  const hole = [...sq(0)].reverse();
  const island = [...sq(0).slice(2, 4), ...sq(0).slice(0, 2), sq(0)[2]];
  const { arcs, rings } = splitIntoArcs(
    new Map([
      ['host', [host, hole]],
      ['island', [island]],
    ])
  );
  assert.equal(arcs.length, 2);
  assert.equal(rings.get('host')[1][0], ~rings.get('island')[0][0]);
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
