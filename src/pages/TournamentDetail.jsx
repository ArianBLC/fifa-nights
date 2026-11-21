import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { model } from '../data/model.js';
import { MatchLine, PlayerLink, StandingsTable, StatBox, chartColors, tooltipStyle } from '../components/ui.jsx';
import { perspective } from '../lib/stats.js';

export default function TournamentDetail() {
  const { n } = useParams();
  const t = model.tournaments.find((x) => x.number === Number(n));
  if (!t) return <p>Tournament not found. <Link to="/tournaments">Back</Link></p>;
  const idx = model.tournaments.indexOf(t);
  const prev = model.tournaments[idx - 1], next = model.tournaments[idx + 1];

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
  const topScorer = [...t.table].sort((a, b) => b.gf - a.gf)[0];
  const bestDef = [...t.table].sort((a, b) => a.ga - b.ga)[0];

  return (
    <>
      <div className="head" style={{ marginTop: 18 }}>
        <div>{prev && <Link to={`/tournaments/${prev.number}`} className="muted">← {prev.name}</Link>}</div>
        <div>{next && <Link to={`/tournaments/${next.number}`} className="muted">{next.name} →</Link>}</div>
      </div>
      <h1>{t.name}</h1>
      <div className="grid cols3">
        <StatBox k="Champion" v={<PlayerLink name={t.champion} size={30} />} s={`${t.table[0].pts} points`} />
        <StatBox k="Players / matches" v={`${t.players.length} / ${t.matches.length}`} />
        <StatBox k="Goals" v={t.goals} s={`${(t.goals / t.matches.length).toFixed(2)} per match`} />
        <StatBox k="Most goals" v={<PlayerLink name={topScorer.player} size={30} />} s={`${topScorer.gf} scored`} />
        <StatBox k="Best defence" v={<PlayerLink name={bestDef.player} size={30} />} s={`${bestDef.ga} conceded`} />
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
        <h2>All results</h2>
        {t.matches.map((m) => <MatchLine key={m.idx} m={m} />)}
      </section>
    </>
  );
}
