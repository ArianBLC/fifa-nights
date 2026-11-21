import React from 'react';
import { Link } from 'react-router-dom';
import { model } from '../data/model.js';
import { Avatar, MedalChips, PageTitle, f2, pct, signed } from '../components/ui.jsx';

export default function Players() {
  // medals first (gold, silver, bronze); players level on medals (e.g. none) are sorted by win rate
  const rows = model.medals
    .map((m) => ({ ...m, ...model.allTime.find((r) => r.player === m.player) }))
    .sort((a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || b.winRate - a.winRate || a.player.localeCompare(b.player));
  return (
    <>
      <PageTitle icon="👥" sub={`${rows.length} players have taken part`}>Players</PageTitle>
      <div className="bgrid">
        {rows.map((r) => (
          <Link key={r.player} to={`/players/${encodeURIComponent(r.player)}`} className="bcard">
            <div className="bcard-top">
              <Avatar name={r.player} size={170} />
              <h2>{r.player}</h2>
              <div className="muted">{r.tournaments} tournament{r.tournaments > 1 ? 's' : ''}</div>
              <MedalChips gold={r.gold} silver={r.silver} bronze={r.bronze} />
            </div>
            <div className="bcard-stats">
              <div><b>{pct(r.winRate)}</b><span>Win rate</span></div>
              <div><b>{f2(r.ppg)}</b><span>Pts / game</span></div>
              <div><b>{r.gf}</b><span>Goals</span></div>
              <div><b>{signed(r.gd)}</b><span>Goal diff</span></div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
