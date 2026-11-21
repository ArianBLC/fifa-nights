import React from 'react';
import { Link } from 'react-router-dom';
import { model, nextNight } from '../data/model.js';
import { Countdown, MedalCabinet, PlayerLink, f2, pct } from '../components/ui.jsx';
import { TournamentGrid } from '../components/TournamentCard.jsx';

const RECENT = 3; // always show the 3 most recent tournaments

export default function Home() {
  const leaders = model.allTime.slice(0, 8);
  const when = new Date(nextNight.date);
  const dateStr = when.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = when.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return (
    <>
      <section className="hero">
        <div className="muted">NEXT FIFA NIGHT</div>
        <h1>{dateStr} · {timeStr}</h1>
        <Countdown to={nextNight.date} />
        {nextNight.note && <div className="muted">{nextNight.note}</div>}
      </section>

      <section className="card">
        <div className="head"><h2>🏟️ Recent tournaments</h2><Link to="/tournaments" className="muted">View all {model.tournaments.length} →</Link></div>
        <TournamentGrid limit={RECENT} />
      </section>

      <section className="card">
        <div className="head"><h2>🏛️ Medal cabinet</h2><Link to="/hall-of-fame" className="muted">Full Hall of Fame →</Link></div>
        <MedalCabinet rows={model.medals.filter((m) => m.total > 0).slice(0, 5)} />
      </section>

      <section className="card">
        <div className="head"><h2>📊 All-time leaders</h2><Link to="/all-time" className="muted">Full table →</Link></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th className="left">Player</th><th>🏆</th><th>P</th><th>Win%</th><th>PPG</th></tr></thead>
            <tbody>
              {leaders.map((r) => (
                <tr key={r.player}>
                  <td>{r.pos}</td>
                  <td className="left"><PlayerLink name={r.player} size={24} /></td>
                  <td>{r.titles}</td><td>{r.p}</td><td>{pct(r.winRate)}</td><td className="strong">{f2(r.ppg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="muted" style={{ fontSize: '.8rem', marginTop: 6 }}>Ranked by points per game, so missing a few nights doesn't hurt.</div>
      </section>

    </>
  );
}
