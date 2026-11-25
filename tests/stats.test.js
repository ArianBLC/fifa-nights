import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { standings, buildModel, headToHead, playerProfile } from '../src/lib/stats.js';

test('points, goal difference and ordering', () => {
  const t = standings([
    { home: 'A', away: 'B', hg: 2, ag: 0 },
    { home: 'B', away: 'C', hg: 1, ag: 1 },
    { home: 'C', away: 'A', hg: 0, ag: 3 },
  ]);
  assert.deepEqual(t.map((r) => [r.player, r.pts, r.gd]), [['A', 6, 5], ['B', 1, -2], ['C', 1, -3]]);
});

test('tie broken by goal difference then goals scored', () => {
  const t = standings([
    { home: 'A', away: 'B', hg: 1, ag: 0 }, // A 3, B 0
    { home: 'B', away: 'C', hg: 5, ag: 0 }, // B 3, C 0
    { home: 'C', away: 'A', hg: 1, ag: 0 }, // C 3, A 0
  ]);
  // all 3 pts; gd: A +0, B +4, C -4
  assert.deepEqual(t.map((r) => r.player), ['B', 'A', 'C']);
});

test('real data: champions of tournaments 1-3', () => {
  const p = new URL('../src/data/generated.json', import.meta.url);
  if (!fs.existsSync(p)) return; // run `npm run import` first
  const model = buildModel(JSON.parse(fs.readFileSync(p)).tournaments);
  assert.deepEqual(model.tournaments.map((t) => t.champion), ['Amir', 'Murat', 'Amir']);
  const t2 = model.tournaments[1].table;
  assert.equal(t2[0].pts, 19); assert.equal(t2[0].gd, 22);
  assert.equal(t2[1].player, 'Arian'); assert.equal(t2[1].gd, 20);
  assert.equal(model.tournaments[2].table[0].pts, 28);
});

test('head-to-head and profile are consistent', () => {
  const p = new URL('../src/data/generated.json', import.meta.url);
  if (!fs.existsSync(p)) return;
  const model = buildModel(JSON.parse(fs.readFileSync(p)).tournaments);
  const h = headToHead(model, 'Arian', 'Murat');
  assert.equal(h.a.pts + h.b.pts, (h.a.w + h.b.w) * 3 + h.a.d * 2);
  assert.equal(h.a.w, h.b.l);
  const prof = playerProfile(model, 'Mehran');
  assert.equal(prof.entries.length, 2); // skipped tournament 1
  assert.equal(prof.row.p, 18);
});

test('trophies: tier boundaries and streaks', async () => {
  const { tierIndex, computeTrophies } = await import('../src/lib/trophies.js');
  const th = [50, 100, 200, 500, 1000];
  assert.equal(tierIndex(th, 49), -1);
  assert.equal(tierIndex(th, 50), 0);
  assert.equal(tierIndex(th, 999), 3);
  assert.equal(tierIndex(th, 1000), 4);

  const g = (gf, ga, opp = 'X') => ({ gf, ga, opp, result: gf > ga ? 'W' : gf < ga ? 'L' : 'D' });
  const games = [g(1, 0), g(2, 0), g(6, 0, 'Amir'), g(0, 0), g(0, 5), g(0, 1), g(0, 2)];
  const out = Object.fromEntries(computeTrophies({ games, entries: [1, 2, 3, 4, 5] }).map((t) => [t.id, t]));
  assert.equal(out.unstoppable.value, 3);      // best win streak
  assert.equal(out.fortress.value, 4);         // clean sheets in a row
  assert.equal(out.survivor.value, 4);         // unbeaten run
  assert.equal(out.nightmare.value, 3);        // losses in a row
  assert.equal(out.parkthebus.value, 1);
  assert.equal(out.destroyer.value, 1);
  assert.equal(out.humble.value, 1);
  assert.equal(out.amirslayer.value, 1);
  assert.equal(out.nightking.tier, 'bronze');
  assert.equal(out.wall.value, 4);
});
