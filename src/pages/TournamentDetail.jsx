import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { model } from '../data/model.js';
import { Avatar, MatchLine, StandingsTable, chartColors, tooltipStyle } from '../components/ui.jsx';
import { Podium } from '../components/TournamentCard.jsx';
import { perspective } from '../lib/stats.js';

export default function TournamentDetail() {
  const { n } = useParams();
  const [page, setPage] = useState(0);
  useEffect(() => { setPage(0); }, [n]); // back to the newest matches when switching tournament
  const t = model.tournaments.find((x) => x.number === Number(n));
  if (!t) return <p>Tournament not found. <Link to="/tournaments">Back</Link></p>;
  const PAGE_SIZE = 5;
  const pages = Math.max(1, Math.ceil(t.matches.length / PAGE_SIZE));
  const cur = Math.min(page, pages - 1);
  const pageMatches = [...t.matches].reverse().slice(cur * PAGE_SIZE, (cur + 1) * PAGE_SIZE); // latest first

  // points race: cumulative points after each player's k-th game
  const per = Object.fromEntries(t.players.map((p) => [p, 0]));
  const seen = Object.fromEntries(t.players.map((p) => [p, 0]));
  const series = {};
  t.players.forEach((p) => { series[p] = [0]; });
  t.matches.forEach((m) => {
    t.players.forEach((p) => {
      const v = perspective(m, p); if (!v) return;
      per[p] += v.gf > v.ga ? 3 : v.gf === v.ga ? 1 : 0; seen[p]++;
      series[p][seen[p]] = per[p];
    });
  });
  const maxG = Math.max(...Object.values(seen));
  const data = Array.from({ length: maxG + 1 }, (_, i) => Object.fromEntries([['game', i], ...t.players.map((p) => [p, series[p][i]])]));
  const topScorer =[...t.table].sort((a, b) => b.gf - a.gf)[0];
  const bestDef = [...t.table].sort((a, b) => a.ga - b.ga)[0];
  // biggest margin; winner shown first (a draw has no winner, so home side goes first)
  const bigWin = [...t.matches].sort((a, b) => Math.abs(b.hg - b.ag) - Math.abs(a.hg - a.ag) || (b.hg + b.ag) - (a.hg + a.ag))[0];
  const homeWon = bigWin.hg >= bigWin.ag;
  const winner = homeWon ? bigWin.home : bigWin.away;
  const loser = homeWon ? bigWin.away : bigWin.home;

  return (
    <>
      <header className="tbanner" style={{ marginTop: 18 }}>
        <h1>Fifa tournament {t.number}</h1>
        <div className="tcard-date">{t.month} {t.year}</div>
        <div className="tcard-icons">
          <span>👥 {t.players.length} players</span>
          <span>⚽ {t.matches.length} matches</span>
          <span>🥅 {t.goals} goals</span>
          <span>📈 {(t.goals / t.matches.length).toFixed(1)} per match</span>
        </div>
        <Podium t={t} scale={1.4} />
      </header>

      <div className="awards">
        <div className="award">
          <div className="atitle">🎯 Best attack</div>
          <Avatar name={topScorer.player} size={64} />
          <b>{topScorer.player}</b>
          <span className="muted">{topScorer.gf} goals scored</span>
        </div>
        <div className="award">
          <div className="atitle">🧱 Best defence</div>
          <Avatar name={bestDef.player} size={64} />
          <b>{bestDef.player}</b>
          <span className="muted">{bestDef.ga} goals conceded</span>
        </div>
        <div className="award">
          <div className="atitle">🔥 Biggest win</div>
          <div className="avs">
            <div className="av"><Avatar name={winner} size={56} /><b>{winner}</b></div>
            <div className="abig">{Math.max(bigWin.hg, bigWin.ag)}–{Math.min(bigWin.hg, bigWin.ag)}</div>
            <div className="av loser"><Avatar name={loser} size={56} /><b>{loser}</b></div>
          </div>
        </div>
      </div>

      <section className="card"><h2>Final table</h2><StandingsTable rows={t.table} /></section>

      <section className="card">
        <h2>Points race</h2>
        <div className="muted" style={{ fontSize: '.85rem' }}>Cumulative points after each player's n-th game</div>
        <div className="chartbox">
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid stroke="#24382e" />
              <XAxis dataKey="game" stroke="#8fa89a" /><YAxis stroke="#8fa89a" />
              <Tooltip {...tooltipStyle} /><Legend />
              {t.players.map((p, i) => <Line key={p} dataKey={p} stroke={chartColors[i % chartColors.length]} strokeWidth={2} dot={false} />)}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card">
        <h2>Results ({t.matches.length})</h2>
        {pageMatches.map((m) => <MatchLine key={m.idx} m={m} />)}
        {pages > 1 && (
          <div className="pager">
            <button className="tab" disabled={cur === 0} onClick={() => setPage(cur - 1)}>← Newer</button>
            <span className="muted">Page {cur + 1} of {pages}</span>
            <button className="tab" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Older →</button>
          </div>
        )}
      </section>
    </>
  );
}
