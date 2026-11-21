import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { model, nextNight } from '../data/model.js';
import { Countdown, MedalCabinet, PlayerLink, StandingsTable, TrophyIcon, f2, pct, signed } from '../components/ui.jsx';

export function TournamentsOverview({ limit }) {
  const [open, setOpen] = useState(null);
  const list = [...model.tournaments].reverse().slice(0, limit);
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>
          <th className="left">Tournament</th><th className="left">🥇 Champion</th><th className="left">🥈 2nd</th>
          <th className="left">🥉 3rd</th><th>Players</th><th>Goals</th><th />
        </tr></thead>
        <tbody>
          {list.map((t) => (
            <React.Fragment key={t.number}>
              <tr className="click" onClick={() => setOpen(open === t.number ? null : t.number)}>
                <td className="left"><Link to={`/tournaments/${t.number}`} onClick={(e) => e.stopPropagation()}><b>{t.name}</b></Link></td>
                <td className="left"><PlayerLink name={t.champion} size={24} /> <span className="muted">{t.table[0].pts} pts</span></td>
                <td className="left"><PlayerLink name={t.runnerUp} size={24} /></td>
                <td className="left">{t.third ? <PlayerLink name={t.third} size={24} /> : '–'}</td>
                <td>{t.players.length}</td><td>{t.goals}</td>
                <td className="muted">{open === t.number ? '▲' : '▼'}</td>
              </tr>
              {open === t.number && (
                <tr><td colSpan={7} style={{ background: 'var(--panel2)', padding: 12 }}><StandingsTable rows={t.table} /></td></tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Home() {
  const latest = model.tournaments[model.tournaments.length - 1];
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
        <div className="head"><h2>🏛️ Medal cabinet</h2><Link to="/hall-of-fame" className="muted">Full Hall of Fame →</Link></div>
        <MedalCabinet rows={model.medals.filter((m) => m.total > 0).slice(0, 5)} />
      </section>

      <div className="grid cols2">
        <section className="card">
          <div className="head"><h2>🏟️ Latest podium</h2><Link to={`/tournaments/${latest.number}`} className="muted">{latest.name} →</Link></div>
          <div className="podium">
            {[1, 0, 2].filter((i) => latest.table[i]).map((i) => {
              const r = latest.table[i];
              return (
                <div key={r.player} className={`step s${i + 1}`}>
                  <span style={{ fontSize: '1.6rem' }}>{['🥇', '🥈', '🥉'][i]}</span>
                  <PlayerLink name={r.player} size={i === 0 ? 72 : 56} hideName />
                  <b><Link to={`/players/${encodeURIComponent(r.player)}`}>{r.player}</Link></b>
                  <span className="muted">{r.pts} pts · GD {signed(r.gd)}</span>
                  <div className="block">{i + 1}</div>
                </div>
              );
            })}
          </div>
          <div className="muted" style={{ fontSize: '.8rem', textAlign: 'center', marginTop: 8 }}>
            {latest.players.length} players · {latest.matches.length} matches · {latest.goals} goals
          </div>
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
      </div>

      <section className="card">
        <div className="head"><h2>🏟️ Last {Math.min(7, model.tournaments.length)} tournaments</h2><Link to="/tournaments" className="muted">View all →</Link></div>
        <TournamentsOverview limit={7} />
        <div className="muted" style={{ fontSize: '.8rem', marginTop: 6 }}>Click a row to peek at the final table.</div>
      </section>
    </>
  );
}
