// Trophy definitions and evaluation. Each trophy has 5 tiers (thresholds in order).
export const TIERS = ['wood', 'bronze', 'silver', 'gold', 'diamond'];
export const TIER_LABEL = { wood: 'Wood', bronze: 'Bronze', silver: 'Silver', gold: 'Gold', diamond: 'Diamond' };

const count = (games, pred) => games.filter(pred).length;
const best = (games, pred) => {
  let top = 0, cur = 0;
  for (const g of games) { cur = pred(g) ? cur + 1 : 0; top = Math.max(top, cur); }
  return top;
};

// `icon` is the file prefix in public/Trophies/<icon>-<tier>.png (missing files fall back to the emoji).
export const TROPHIES = [
  { id: 'striker', icon: 'striker', emoji: '⚽', name: 'The Striker', req: 'Total goals scored', unit: 'goals',
    thresholds: [50, 100, 200, 350, 500], measure: ({ games }) => games.reduce((s, g) => s + g.gf, 0) },
  { id: 'wall', icon: 'wall', emoji: '🧱', name: 'The Wall', req: 'Total clean sheets', unit: 'clean sheets',
    thresholds: [5, 10, 20, 30, 50], measure: ({ games }) => count(games, (g) => g.ga === 0) },
  { id: 'champion', icon: 'champion', emoji: '🏆', name: 'The Champion', req: 'Total matches won', unit: 'wins',
    thresholds: [10, 25, 50, 75, 100], measure: ({ games }) => count(games, (g) => g.result === 'W') },
  { id: 'veteran', icon: 'veteran', emoji: '🎖️', name: 'The Veteran', req: 'Total matches played', unit: 'matches',
    thresholds: [25, 50, 100, 150, 200], measure: ({ games }) => games.length },
  { id: 'unstoppable', icon: 'unstoppable', emoji: '🔥', name: 'Unstoppable', req: 'Consecutive wins', unit: 'in a row',
    thresholds: [5, 10, 15, 20, 30], measure: ({ games }) => best(games, (g) => g.result === 'W') },
  { id: 'destroyer', icon: 'destroyer', emoji: '⚔️', name: 'The Destroyer', req: 'Wins by 5+ goals', unit: 'big wins',
    thresholds: [3, 5, 10, 15, 25], measure: ({ games }) => count(games, (g) => g.gf - g.ga >= 5) },
  { id: 'fortress', icon: 'fortress', emoji: '🏰', name: 'The Fortress', req: 'Consecutive clean sheets', unit: 'in a row',
    thresholds: [2, 3, 4, 5, 7], measure: ({ games }) => best(games, (g) => g.ga === 0) },
  { id: 'survivor', icon: 'survivor', emoji: '🛡️', name: 'The Survivor', req: 'Consecutive unbeaten matches', unit: 'in a row',
    thresholds: [5, 10, 15, 20, 30], measure: ({ games }) => best(games, (g) => g.result !== 'L') },
  { id: 'nightking', icon: 'night-king', emoji: '🫡', name: 'The Night King', req: 'FIFA nights attended', unit: 'nights',
    thresholds: [3, 5, 7, 10, 15], measure: ({ entries }) => entries.length },
  { id: 'parkthebus', icon: 'park-the-bus', emoji: '🚌', name: 'Park the Bus', req: 'Matches won 1–0', unit: '1–0 wins',
    thresholds: [1, 3, 5, 10, 20], measure: ({ games }) => count(games, (g) => g.gf === 1 && g.ga === 0) },
  { id: 'diplomat', icon: 'diplomat', emoji: '🤝', name: 'The Diplomat', req: 'Total matches drawn', unit: 'draws',
    thresholds: [5, 10, 15, 25, 40], measure: ({ games }) => count(games, (g) => g.result === 'D') },
  { id: 'humble', icon: 'humble', emoji: '🏳️', name: 'The Humble One', req: 'Losses by 5+ goals', unit: 'heavy losses',
    thresholds: [1, 5, 10, 20, 30], measure: ({ games }) => count(games, (g) => g.ga - g.gf >= 5) },
  { id: 'amirslayer', icon: 'amir-slayer', emoji: '👑', name: 'Amir Slayer', req: 'Matches won against Amir', unit: 'wins vs Amir',
    thresholds: [1, 3, 5, 8, 12], measure: ({ games }) => count(games, (g) => g.opp === 'Amir' && g.result === 'W') },
  { id: 'nightmare', icon: 'punching-bag', emoji: '🥊', name: 'The Punching Bag', req: 'Consecutive losses', unit: 'in a row',
    thresholds: [5, 10, 20, 30, 50], measure: ({ games }) => best(games, (g) => g.result === 'L') },
];

/** Index of the highest tier reached (-1 = none) for a value. */
export function tierIndex(thresholds, value) {
  let idx = -1;
  thresholds.forEach((t, i) => { if (value >= t) idx = i; });
  return idx;
}

/** Evaluate every trophy for a player profile (from playerProfile()). */
export function computeTrophies(prof) {
  return TROPHIES.map((t) => {
    const value = t.measure(prof);
    const idx = tierIndex(t.thresholds, value);
    const next = idx + 1 < TIERS.length ? t.thresholds[idx + 1] : null;
    const prev = idx >= 0 ? t.thresholds[idx] : 0;
    return {
      ...t, value, idx,
      tier: idx >= 0 ? TIERS[idx] : null,
      nextTier: next === null ? null : TIERS[idx + 1],
      next,
      progress: next === null ? 1 : (value - prev) / (next - prev),
      remaining: next === null ? 0 : next - value,
      max: idx === TIERS.length - 1,
    };
  });
}

export const trophySummary = (list) => ({
  earned: list.reduce((s, t) => s + t.idx + 1, 0),
  total: list.length * TIERS.length,
  score: list.reduce((s, t) => s + t.idx + 1, 0),
});
