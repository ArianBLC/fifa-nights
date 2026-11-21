// Pure stats logic. No React / DOM in here so it can be tested with `node --test`.

export const WIN_POINTS = 3;

const blank = (player) => ({ player, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 });

export function applyMatch(row, gf, ga) {
  row.p++; row.gf += gf; row.ga += ga; row.gd = row.gf - row.ga;
  if (gf > ga) { row.w++; row.pts += WIN_POINTS; }
  else if (gf === ga) { row.d++; row.pts += 1; }
  else row.l++;
}

/** Head-to-head points of a over b inside a match list. */
function h2hPoints(matches, a, b) {
  let pa = 0, pb = 0;
  for (const m of matches) {
    let ga, gb;
    if (m.home === a && m.away === b) { ga = m.hg; gb = m.ag; }
    else if (m.home === b && m.away === a) { ga = m.ag; gb = m.hg; }
    else continue;
    if (ga > gb) pa += 3; else if (ga < gb) pb += 3; else { pa++; pb++; }
  }
  return pa - pb;
}

/** League table: points, goal difference, goals scored, head-to-head, name. */
export function standings(matches) {
  const rows = new Map();
  const get = (n) => rows.get(n) || rows.set(n, blank(n)).get(n);
  for (const m of matches) {
    applyMatch(get(m.home), m.hg, m.ag);
    applyMatch(get(m.away), m.ag, m.hg);
  }
  const list = [...rows.values()].sort((a, b) =>
    b.pts - a.pts || b.gd - a.gd || b.gf - a.gf ||
    -h2hPoints(matches, a.player, b.player) || a.player.localeCompare(b.player));
  list.forEach((r, i) => { r.pos = i + 1; r.ppg = r.p ? r.pts / r.p : 0; });
  return list;
}

/** Result of a match from the perspective of `player`, or null. */
export function perspective(m, player) {
  if (m.home === player) return { opp: m.away, gf: m.hg, ga: m.ag };
  if (m.away === player) return { opp: m.home, gf: m.ag, ga: m.hg };
  return null;
}
const res = (gf, ga) => (gf > ga ? 'W' : gf < ga ? 'L' : 'D');

/** Full computed model from the raw tournaments list. */
export function buildModel(raw) {
  const tournaments = raw.map((t) => {
    const matches = t.matches.map((m, i) => ({ ...m, idx: i + 1, tNumber: t.number }));
    const table = standings(matches);
    const players = table.map((r) => r.player);
    return {
      ...t, matches, table, players,
      champion: table[0]?.player,
      runnerUp: table[1]?.player,
      third: table[2]?.player,
      lastPlace: table[table.length - 1]?.player,
      goals: matches.reduce((s, m) => s + m.hg + m.ag, 0),
    };
  });

  const allPlayers = [...new Set(tournaments.flatMap((t) => t.players))].sort();
  const allMatches = tournaments.flatMap((t) => t.matches.map((m) => ({ ...m, tName: t.name })));

  // all-time table
  const at = new Map();
  for (const m of allMatches) {
    for (const [pl, gf, ga] of [[m.home, m.hg, m.ag], [m.away, m.ag, m.hg]]) {
      if (!at.has(pl)) at.set(pl, blank(pl));
      applyMatch(at.get(pl), gf, ga);
    }
  }
  const titles = Object.fromEntries(allPlayers.map((p) => [p, 0]));
  const spoons = { ...titles };
  const played = { ...titles };
  tournaments.forEach((t) => {
    titles[t.champion]++;
    if (t.players.length > 2) spoons[t.lastPlace]++;
    t.players.forEach((p) => played[p]++);
  });
  // medals: gold = 1st, silver = 2nd, bronze = 3rd in a tournament
  const medalMap = Object.fromEntries(allPlayers.map((p) => [p, { player: p, gold: 0, silver: 0, bronze: 0 }]));
  tournaments.forEach((t) => {
    if (t.table[0]) medalMap[t.table[0].player].gold++;
    if (t.table[1]) medalMap[t.table[1].player].silver++;
    if (t.table[2]) medalMap[t.table[2].player].bronze++;
  });
  const medals = Object.values(medalMap)
    .map((m) => ({ ...m, total: m.gold + m.silver + m.bronze, tournaments: played[m.player], winRate: at.get(m.player).w / at.get(m.player).p }))
    .sort((a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || b.winRate - a.winRate || a.player.localeCompare(b.player));
  medals.forEach((m, i) => { m.pos = i + 1; });

  const allTime = [...at.values()].map((r) => ({
    ...r,
    ...medalMap[r.player],
    ppg: r.pts / r.p,
    winRate: r.w / r.p,
    gfpg: r.gf / r.p,
    titles: titles[r.player],
    spoons: spoons[r.player],
    tournaments: played[r.player],
  })).sort((a, b) => b.ppg - a.ppg || b.gd - a.gd || a.player.localeCompare(b.player));
  allTime.forEach((r, i) => { r.pos = i + 1; });

  return { tournaments, allPlayers, allMatches, allTime, titles, medals };
}

/** Everything the player profile needs. */
export function playerProfile(model, player) {
  const row = model.allTime.find((r) => r.player === player);
  const entries = []; // per tournament
  const games = []; // chronological matches from this player's view
  for (const t of model.tournaments) {
    const r = t.table.find((x) => x.player === player);
    if (!r) continue;
    entries.push({
      t, pos: r.pos, of: t.players.length, ...r, champion: r.pos === 1,
    });
    for (const m of t.matches) {
      const v = perspective(m, player);
      if (v) games.push({ ...v, result: res(v.gf, v.ga), t, m, home: m.home === player });
    }
  }

  // streaks
  const streak = (pred) => {
    let best = 0, cur = 0;
    for (const g of games) { cur = pred(g) ? cur + 1 : 0; best = Math.max(best, cur); }
    return best;
  };
  const longestWin = streak((g) => g.result === 'W');
  const longestUnbeaten = streak((g) => g.result !== 'L');
  const cleanSheets = games.filter((g) => g.ga === 0).length;

  const byMargin = [...games].sort((a, b) => (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf);
  const biggestWin = byMargin[0] && byMargin[0].gf > byMargin[0].ga ? byMargin[0] : null;
  const worst = byMargin[byMargin.length - 1];
  const heaviestLoss = worst && worst.gf < worst.ga ? worst : null;

  const bestT = [...entries].sort((a, b) => b.ppg - a.ppg || a.pos - b.pos)[0];
  const worstT = [...entries].sort((a, b) => a.ppg - b.ppg || b.pos - a.pos)[0];

  // opponents
  const opp = new Map();
  for (const g of games) {
    if (!opp.has(g.opp)) opp.set(g.opp, { opp: g.opp, ...blank(g.opp) });
    applyMatch(opp.get(g.opp), g.gf, g.ga);
  }
  const opps = [...opp.values()].map((o) => ({ ...o, ppg: o.pts / o.p }))
    .sort((a, b) => b.ppg - a.ppg || b.gd - a.gd);

  return {
    player, row, entries, games, longestWin, longestUnbeaten, cleanSheets,
    biggestWin, heaviestLoss, bestT, worstT, opps,
    form: games.slice(-10).reverse(),
    titles: model.titles[player],
  };
}

export function headToHead(model, a, b) {
  const matches = model.allMatches.filter(
    (m) => (m.home === a && m.away === b) || (m.home === b && m.away === a));
  const ra = blank(a), rb = blank(b);
  for (const m of matches) {
    const va = perspective(m, a);
    applyMatch(ra, va.gf, va.ga);
    applyMatch(rb, va.ga, va.gf);
  }
  return { matches, a: ra, b: rb };
}

/** Hall-of-fame records across everything. */
export function records(model) {
  const out = {};
  const ms = model.allMatches;
  const top = (arr, key, n = 1) => [...arr].sort((x, y) => key(y) - key(x)).slice(0, n);
  out.biggestWins = top(ms, (m) => Math.abs(m.hg - m.ag) * 100 + Math.max(m.hg, m.ag), 3);
  out.highestScoring = top(ms, (m) => (m.hg + m.ag) * 100 + Math.abs(m.hg - m.ag), 3);
  out.mostGoalsByPlayerInMatch = top(
    ms.flatMap((m) => [{ player: m.home, goals: m.hg, m }, { player: m.away, goals: m.ag, m }]),
    (x) => x.goals, 3);

  const entries = model.tournaments.flatMap((t) => t.table.map((r) => ({ ...r, t })));
  out.mostPoints = top(entries, (r) => r.pts * 1000 + r.gd, 3);
  out.bestPpg = top(entries, (r) => r.ppg * 1000 + r.gd, 3);
  out.mostGoalsInTournament = top(entries, (r) => r.gf, 3);
  out.bestDefence = [...entries].sort((x, y) => x.ga / x.p - y.ga / y.p || y.pts - x.pts).slice(0, 3);
  out.invincibles = entries.filter((r) => r.pos === 1 && r.l === 0);
  out.biggestMargin = [...model.tournaments.filter((t) => t.table.length > 1)]
    .map((t) => ({ t, margin: t.table[0].pts - t.table[1].pts }))
    .sort((a, b) => b.margin - a.margin).slice(0, 3);

  // longest streaks across all matches
  const streaks = (pred) => model.allPlayers.map((p) => {
    let best = 0, cur = 0;
    for (const t of model.tournaments) for (const m of t.matches) {
      const v = perspective(m, p); if (!v) continue;
      cur = pred(v) ? cur + 1 : 0; best = Math.max(best, cur);
    }
    return { player: p, n: best };
  }).sort((a, b) => b.n - a.n).slice(0, 3);
  out.winStreaks = streaks((v) => v.gf > v.ga);
  out.unbeatenStreaks = streaks((v) => v.gf >= v.ga);
  return out;
}
