import React from 'react';
import { Link } from 'react-router-dom';
import { model, recs } from '../data/model.js';
import { Avatar, MatchLine, MedalCabinet, MedalTable, PageTitle, PlayerLink, f2, signed } from '../components/ui.jsx';

const T = ({ t }) => <Link to={`/tournaments/${t.number}`} className="muted">T{t.number}</Link>;

function Rec({ title, children }) {
  return <section className="card" style={{ marginTop: 0 }}><h3>{title}</h3><ul className="clean">{children}</ul></section>;
}

export default function HallOfFame() {
  const cabinet = model.medals.filter((m) => m.total > 0);
  const spoons = model.allTime.filter((r) => r.spoons > 0).sort((a, b) => b.spoons - a.spoons);
  return (
    <>
      <PageTitle icon="🏛️" sub="Medals, champions and records">Hall of Fame</PageTitle>
      <section className="card">
        <h2>Medal table</h2>
        <MedalTable rows={model.medals} />
        <div className="muted" style={{ fontSize: '.8rem', marginTop: 6 }}>🥇 champion · 🥈 runner-up · 🥉 third place, counted per tournament.</div>
      </section>

      <section className="card">
        <h2>Medal cabinet</h2>
        <MedalCabinet rows={cabinet} />
      </section>

      <section className="card">
        <h2>Champions</h2>
        <div className="cgrid">
          {[...model.tournaments].reverse().map((t) => {
            const c = t.table[0];
            return (
              <Link key={t.number} to={`/tournaments/${t.number}`} className="ccard">
                <div className="ctitle">{t.name}</div>
                <div className="cbody">
                  <div className="crown">👑</div>
                  <Avatar name={t.champion} size={120} />
                  <h3>{t.champion}</h3>
                  <div className="cpts"><b>{c.pts}</b> pts</div>
                  <div className="muted">{c.w}W {c.d}D {c.l}L · GD {signed(c.gd)}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid cols2" style={{ marginTop: 18 }}>
        <Rec title="🔥 Biggest wins">
          {recs.biggestWins.map((m, i) => <li key={i}><div style={{ flex: 1 }}><MatchLine m={m} /></div><T t={{ number: m.tNumber }} /></li>)}
        </Rec>
        <Rec title="🎯 Highest-scoring matches">
          {recs.highestScoring.map((m, i) => <li key={i}><div style={{ flex: 1 }}><MatchLine m={m} /></div><T t={{ number: m.tNumber }} /></li>)}
        </Rec>
        <Rec title="⚽ Most goals by one player in a match">
          {recs.mostGoalsByPlayerInMatch.map((x, i) => <li key={i}><PlayerLink name={x.player} size={24} /><span><b>{x.goals}</b> goals vs {x.player === x.m.home ? x.m.away : x.m.home} <T t={{ number: x.m.tNumber }} /></span></li>)}
        </Rec>
        <Rec title="💯 Most points in a tournament">
          {recs.mostPoints.map((r, i) => <li key={i}><PlayerLink name={r.player} size={24} /><span><b>{r.pts}</b> pts ({r.p} games) <T t={r.t} /></span></li>)}
        </Rec>
        <Rec title="📈 Best points per game in a tournament">
          {recs.bestPpg.map((r, i) => <li key={i}><PlayerLink name={r.player} size={24} /><span><b>{f2(r.ppg)}</b> PPG <T t={r.t} /></span></li>)}
        </Rec>
        <Rec title="🥅 Most goals scored in a tournament">
          {recs.mostGoalsInTournament.map((r, i) => <li key={i}><PlayerLink name={r.player} size={24} /><span><b>{r.gf}</b> goals <T t={r.t} /></span></li>)}
        </Rec>
        <Rec title="🧱 Best defence in a tournament (goals against per game)">
          {recs.bestDefence.map((r, i) => <li key={i}><PlayerLink name={r.player} size={24} /><span><b>{f2(r.ga / r.p)}</b> ({r.ga} in {r.p}) <T t={r.t} /></span></li>)}
        </Rec>
        <Rec title="🏃 Longest win streaks">
          {recs.winStreaks.map((x) => <li key={x.player}><PlayerLink name={x.player} size={24} /><b>{x.n} in a row</b></li>)}
        </Rec>
        <Rec title="🛡️ Longest unbeaten runs">
          {recs.unbeatenStreaks.map((x) => <li key={x.player}><PlayerLink name={x.player} size={24} /><b>{x.n} matches</b></li>)}
        </Rec>
        <Rec title="🏁 Biggest winning margin over 2nd place">
          {recs.biggestMargin.map((x) => <li key={x.t.number}><PlayerLink name={x.t.champion} size={24} /><span><b>{x.margin}</b> pts clear <T t={x.t} /></span></li>)}
        </Rec>
        <Rec title="🦄 Invincibles (champion without a loss)">
          {recs.invincibles.length ? recs.invincibles.map((r, i) => <li key={i}><PlayerLink name={r.player} size={24} /><span><T t={r.t} /></span></li>) : <li className="muted">Nobody yet…</li>}
        </Rec>
        <Rec title="🥄 Wooden spoons (last place)">
          {spoons.map((r) => <li key={r.player}><PlayerLink name={r.player} size={24} /><b>{r.spoons}×</b></li>)}
        </Rec>
      </div>
    </>
  );
}
