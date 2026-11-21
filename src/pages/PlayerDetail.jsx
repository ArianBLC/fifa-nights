import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { model } from '../data/model.js';
import { playerProfile } from '../lib/stats.js';
import HeadToHeadView from '../components/HeadToHeadView.jsx';
import { Avatar, Badge, MatchLine, MedalChips, PlayerLink, Pos, StatBox, TrophyIcon, f2, pct, signed, tooltipStyle } from '../components/ui.jsx';

const GameText = ({ g }) => <>{g.gf}–{g.ga} vs {g.opp} <span className="muted">({g.t.name.replace('Fifa tournament', 'T')})</span></>;

export default function PlayerDetail() {
  const { name } = useParams();
  const nav = useNavigate();
  const [view, setView] = useState('ppg');
  const [oppFilter, setOppFilter] = useState('all');
  const [tFilter, setTFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [h2hOpp, setH2h] = useState(null);
  const prof = useMemo(() => (model.allPlayers.includes(name) ? playerProfile(model, name) : null), [name]);
  if (!prof) return <p>Player not found. <Link to="/players">Back</Link></p>;
  const { row: r, entries, games } = prof;

  const perT = entries.map((e) => ({
    t: `T${e.t.number}`, ppg: Number(e.ppg.toFixed(2)), gf: e.gf, ga: e.ga, gd: e.gd, pts: e.pts, pos: e.pos,
  }));
  // cumulative goal difference over every match played
  let cum = 0;
  const perGame = games.map((g, i) => { cum += g.gf - g.ga; return { n: i + 1, cumGD: cum, label: `${g.gf}-${g.ga} vs ${g.opp}` }; });

  const shown = games.filter((g) => (oppFilter === 'all' || g.opp === oppFilter) && (tFilter === 'all' || String(g.t.number) === tFilter));
  const PAGE_SIZE = 10;
  const pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const cur = Math.min(page, pages - 1);
  const pageGames = [...shown].reverse().slice(cur * PAGE_SIZE, (cur + 1) * PAGE_SIZE); // latest first
  const opponents = [...new Set(games.map((g) => g.opp))].sort();
  const o = prof.opps;
  const vsOpp = opponents.includes(h2hOpp) ? h2hOpp : opponents[0];

  return (
    <>
      <div className="banner">
        <div className="top">
          <Avatar name={name} size={160} />
          <div>
            <h1>{name}</h1>
            <div className="sub">
              All-time rank #{r.pos} of {model.allTime.length} · played {entries.length} of {model.tournaments.length} tournaments
            </div>
            <MedalChips gold={r.gold} silver={r.silver} bronze={r.bronze} />
            <div className="form" style={{ marginTop: 8 }}>
              {[...prof.form].reverse().map((g, i) => <Badge key={i} r={g.result} />)}
            </div>
          </div>
        </div>
        <div className="stats">
          <div><b>{r.p}</b><span>Matches</span></div>
          <div><b>{pct(r.winRate)}</b><span>Win rate</span></div>
          <div><b>{f2(r.ppg)}</b><span>Points / game</span></div>
          <div><b>{r.gf}</b><span>Goals for</span></div>
          <div><b>{f2(r.gfpg)}</b><span>Goals / game</span></div>
          <div><b>{signed(r.gd)}</b><span>Goal diff</span></div>
          <div><b>{prof.longestWin}</b><span>Best win streak</span></div>
          <div><b>{prof.cleanSheets}</b><span>Clean sheets</span></div>
        </div>
      </div>

      <div className="grid cols3" style={{ marginTop: 18 }}>
        <StatBox k="Titles" v={prof.titles} s={`${entries.length} tournaments`} />
        <StatBox k="Win rate" v={pct(r.winRate)} s={`${r.w}W ${r.d}D ${r.l}L`} />
        <StatBox k="Points per game" v={f2(r.ppg)} s={`${r.pts} pts total`} />
        <StatBox k="Goals" v={`${r.gf} : ${r.ga}`} s={`${signed(r.gd)} · ${f2(r.gfpg)} scored / game`} />
        <StatBox k="Clean sheets" v={prof.cleanSheets} s={pct(prof.cleanSheets / r.p) + ' of matches'} />
        <StatBox k="All-time rank" v={`#${r.pos} / ${model.allTime.length}`} s="by points per game" />
        <StatBox k="Longest win streak" v={prof.longestWin} s={`unbeaten run: ${prof.longestUnbeaten}`} />
        <StatBox k="Best tournament" v={`T${prof.bestT.t.number}`} s={`${f2(prof.bestT.ppg)} PPG · ${prof.bestT.pos}${['st','nd','rd'][prof.bestT.pos - 1] || 'th'} place`} />
        <StatBox k="Worst tournament" v={`T${prof.worstT.t.number}`} s={`${f2(prof.worstT.ppg)} PPG · ${prof.worstT.pos}${['st','nd','rd'][prof.worstT.pos - 1] || 'th'} place`} />
      </div>

      <section className="card">
        <h2>All tournaments</h2>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th className="left">Tournament</th><th>Pos</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th><th>PPG</th>
            </tr></thead>
            <tbody>
              {[...entries].reverse().map((e) => (
                <tr key={e.t.number} className="click" onClick={() => nav(`/tournaments/${e.t.number}`)}>
                  <td className="left"><b>{e.t.name}</b> {e.champion && <TrophyIcon />}</td>
                  <td><Pos n={e.pos} /> <span className="muted">/{e.of}</span></td>
                  <td>{e.p}</td><td>{e.w}</td><td>{e.d}</td><td>{e.l}</td><td>{e.gf}</td><td>{e.ga}</td>
                  <td>{signed(e.gd)}</td><td className="strong">{e.pts}</td><td>{f2(e.ppg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="muted" style={{ fontSize: '.8rem', marginTop: 6 }}>Click a row to open that tournament.</div>
      </section>

      <div className="grid cols2">
        <section className="card">
          <div className="head"><h2>Performance by tournament</h2></div>
          <div className="tabs">
            {[['ppg', 'Points / game'], ['goals', 'Goals for vs against'], ['gd', 'Goal difference']].map(([k, l]) =>
              <button key={k} className={'tab' + (view === k ? ' on' : '')} onClick={() => setView(k)}>{l}</button>)}
          </div>
          <div className="chartbox">
            <ResponsiveContainer>
              <BarChart data={perT}>
                <CartesianGrid stroke="#24382e" /><XAxis dataKey="t" stroke="#8fa89a" /><YAxis stroke="#8fa89a" />
                <Tooltip {...tooltipStyle} cursor={{ fill: '#ffffff10' }} />
                {view === 'ppg' && <Bar dataKey="ppg" name="Points per game" fill="#2ee07a" radius={4} />}
                {view === 'goals' && <><Legend /><Bar dataKey="gf" name="Goals for" fill="#2ee07a" radius={4} /><Bar dataKey="ga" name="Goals against" fill="#f0566a" radius={4} /></>}
                {view === 'gd' && <Bar dataKey="gd" name="Goal difference" fill="#4cc3ff" radius={4} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card">
          <h2>Final position by tournament</h2>
          <div className="chartbox">
            <ResponsiveContainer>
              <LineChart data={perT}>
                <CartesianGrid stroke="#24382e" /><XAxis dataKey="t" stroke="#8fa89a" />
                <YAxis stroke="#8fa89a" reversed domain={[1, 6]} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Line dataKey="pos" name="Position" stroke="#ffcf3f" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="card">
        <h2>Form over all matches</h2>
        <div className="muted" style={{ fontSize: '.85rem' }}>Cumulative goal difference, match by match</div>
        <div className="chartbox">
          <ResponsiveContainer>
            <LineChart data={perGame}>
              <CartesianGrid stroke="#24382e" /><XAxis dataKey="n" stroke="#8fa89a" /><YAxis stroke="#8fa89a" />
              <ReferenceLine y={0} stroke="#8fa89a" strokeDasharray="4 4" />
              <Tooltip {...tooltipStyle} formatter={(v) => [v, 'Cumulative GD']} labelFormatter={(n) => perGame[n - 1]?.label} />
              <Line dataKey="cumGD" stroke="#2ee07a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid cols2">
        <section className="card">
          <h2>Records & rivals</h2>
          <ul className="clean">
            <li><span className="muted">Biggest win</span><b>{prof.biggestWin ? <GameText g={prof.biggestWin} /> : '–'}</b></li>
            <li><span className="muted">Heaviest defeat</span><b>{prof.heaviestLoss ? <GameText g={prof.heaviestLoss} /> : '–'}</b></li>
            <li><span className="muted">Best record against</span><b><PlayerLink name={o[0].opp} size={22} /> {f2(o[0].ppg)} PPG</b></li>
            <li><span className="muted">Toughest opponent</span><b><PlayerLink name={o[o.length - 1].opp} size={22} /> {f2(o[o.length - 1].ppg)} PPG</b></li>
          </ul>
        </section>
        <section className="card">
          <h2>Record against each player</h2>
          <div className="table-wrap"><table>
            <thead><tr><th className="left">Opponent</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th /></tr></thead>
            <tbody>{o.map((x) => (
              <tr key={x.opp}>
                <td className="left"><PlayerLink name={x.opp} size={22} /></td>
                <td>{x.p}</td><td>{x.w}</td><td>{x.d}</td><td>{x.l}</td><td>{signed(x.gd)}</td>
                <td><a href="#h2h" className="muted" onClick={(e) => { e.preventDefault(); setH2h(x.opp); document.getElementById('h2h')?.scrollIntoView({ behavior: 'smooth' }); }}>Head to head ↓</a></td>
              </tr>))}</tbody>
          </table></div>
        </section>
      </div>

      <section className="card" id="h2h">
        <div className="head">
          <h2>⚔️ Head to Head</h2>
          <div className="h2h-pick">
            <b>{name}</b> <span className="muted">vs</span>
            <select value={vsOpp} onChange={(e) => setH2h(e.target.value)}>
              {opponents.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="muted">Pick an opponent to see your full record against them.</div>
      </section>
      <HeadToHeadView a={name} b={vsOpp} />

      <section className="card">
        <div className="head">
          <h2>Match history ({shown.length})</h2>
          <div className="h2h-pick">
            <select value={tFilter} onChange={(e) => { setTFilter(e.target.value); setPage(0); }}>
              <option value="all">All tournaments</option>
              {entries.map((e) => <option key={e.t.number} value={e.t.number}>{e.t.name}</option>)}
            </select>
            <select value={oppFilter} onChange={(e) => { setOppFilter(e.target.value); setPage(0); }}>
              <option value="all">All opponents</option>
              {opponents.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        {pageGames.map((g, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge r={g.result} />
            <div style={{ flex: 1 }}><MatchLine m={g.m} hl={name} /></div>
            <span className="muted" style={{ fontSize: '.78rem', minWidth: 28 }}>T{g.t.number}</span>
          </div>
        ))}
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
