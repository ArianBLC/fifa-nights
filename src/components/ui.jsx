import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export function Avatar({ name, size = 36 }) {
  const [broken, setBroken] = useState(false);
  const style = { width: size, height: size, fontSize: size * 0.4 };
  if (broken) return <span className="avatar fallback" style={style}>{name.slice(0, 2).toUpperCase()}</span>;
  return (
    <img className="avatar" style={style} alt={name} loading="lazy"
      src={`${import.meta.env.BASE_URL}avatars/${encodeURIComponent(name)}.png`}
      onError={() => setBroken(true)} />
  );
}

export function PlayerLink({ name, size = 28, hideName }) {
  return (
    <Link to={`/players/${encodeURIComponent(name)}`} className="player">
      <Avatar name={name} size={size} />{!hideName && <span>{name}</span>}
    </Link>
  );
}

export function PageTitle({ children, icon, sub }) {
  return (
    <header className="page-banner">
      {icon && <div className="icon">{icon}</div>}
      <div>
        <h1>{children}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
    </header>
  );
}

export const Pos = ({ n }) => <span className={`pos ${n <= 3 ? 'p' + n : ''}`}>{n}</span>;
export const Badge = ({ r }) => <span className={`badge ${r}`}>{r}</span>;
export const signed = (n) => (n > 0 ? `+${n}` : `${n}`);
export const f2 = (n) => n.toFixed(2);
export const pct = (n) => `${Math.round(n * 100)}%`;
export const TrophyIcon = () => <span className="trophy" title="Champion">🏆</span>;

export function StatBox({ k, v, s }) {
  return <div className="stat"><div className="k">{k}</div><div className="v">{v}</div>{s && <div className="s">{s}</div>}</div>;
}

export function StandingsTable({ rows, highlight }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>
          <th>#</th><th className="left">Player</th><th>P</th><th>W</th><th>D</th><th>L</th>
          <th>GF</th><th>GA</th><th>GD</th><th>Pts</th>
        </tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.player} className={r.player === highlight ? 'hl' : ''}>
              <td><Pos n={r.pos} /></td>
              <td className="left"><PlayerLink name={r.player} /> {r.pos === 1 && <TrophyIcon />}</td>
              <td>{r.p}</td><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td>
              <td>{r.gf}</td><td>{r.ga}</td><td>{signed(r.gd)}</td><td className="strong">{r.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MedalChips({ gold, silver, bronze }) {
  return (
    <div className="chips">
      <span className="chip" title="Gold">🥇 {gold}</span>
      <span className="chip" title="Silver">🥈 {silver}</span>
      <span className="chip" title="Bronze">🥉 {bronze}</span>
    </div>
  );
}

export function MedalCabinet({ rows }) {
  return (
    <div className="cabinet">
      {rows.map((m) => (
        <div className="item" key={m.player}>
          <PlayerLink name={m.player} size={64} hideName />
          <div><b>{m.player}</b></div>
          <div className="t">{'🥇'.repeat(m.gold)}{'🥈'.repeat(m.silver)}{'🥉'.repeat(m.bronze)}</div>
        </div>
      ))}
    </div>
  );
}

export function MedalTable({ rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>#</th><th className="left">Player</th><th>🥇 Gold</th><th>🥈 Silver</th><th>🥉 Bronze</th><th>Total</th><th>Tourn.</th></tr></thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.player}>
              <td><Pos n={m.pos} /></td>
              <td className="left"><PlayerLink name={m.player} /></td>
              <td className="strong">{m.gold}</td><td className="strong">{m.silver}</td><td className="strong">{m.bronze}</td>
              <td>{m.total}</td><td className="muted">{m.tournaments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MatchLine({ m, hl }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center', padding: '6px 0' }}>
      <div style={{ textAlign: 'right', fontWeight: hl === m.home ? 800 : 400 }}><PlayerLink name={m.home} size={22} /></div>
      <span className="result">{m.hg} – {m.ag}</span>
      <div style={{ fontWeight: hl === m.away ? 800 : 400 }}><PlayerLink name={m.away} size={22} /></div>
    </div>
  );
}

export function Countdown({ to }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const diff = target - now;
  if (diff <= 0) return <div className="countdown"><div className="unit"><div className="num">🎮</div><div className="lbl">It's game time!</div></div></div>;
  const s = Math.floor(diff / 1000);
  const units = [['Days', Math.floor(s / 86400)], ['Hours', Math.floor(s / 3600) % 24], ['Min', Math.floor(s / 60) % 60], ['Sec', s % 60]];
  return (
    <div className="countdown">
      {units.map(([l, v]) => <div className="unit" key={l}><div className="num">{String(v).padStart(2, '0')}</div><div className="lbl">{l}</div></div>)}
    </div>
  );
}

export const chartColors = ['#2ee07a', '#ffcf3f', '#4cc3ff', '#ff7a59', '#b58cff', '#ff5fa2', '#9be15d', '#e0e0e0'];
export const tooltipStyle = { contentStyle: { background: '#121f19', border: '1px solid #24382e', borderRadius: 8 }, labelStyle: { color: '#8fa89a' } };
