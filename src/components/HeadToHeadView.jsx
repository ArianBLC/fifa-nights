import React from 'react';
import { model } from '../data/model.js';
import { headToHead } from '../lib/stats.js';
import { Avatar, Badge, MatchLine, f2, signed } from './ui.jsx';

export default function HeadToHeadView({ a, b }) {
  const h = headToHead(model, a, b);
  const total = h.a.p || 1;
  const byT = model.tournaments
    .map((t) => ({ t, ms: h.matches.filter((m) => m.tNumber === t.number) })).filter((x) => x.ms.length).reverse();

  // Content only: the parent wraps it in a single card so H2H reads as one box.
  if (h.a.p === 0) return <div className="muted">{a} and {b} have never met.</div>;
  return (
    <>
      <div>
        <div className="versus">
          <div><Avatar name={a} size={90} /><h2>{a}</h2><div className="big" style={{ color: 'var(--win)' }}>{h.a.w}</div><div className="muted">wins</div></div>
          <div><div className="muted">{h.a.p} matches</div><div className="big">{h.a.d}</div><div className="muted">draws</div></div>
          <div><Avatar name={b} size={90} /><h2>{b}</h2><div className="big" style={{ color: 'var(--win)' }}>{h.b.w}</div><div className="muted">wins</div></div>
        </div>
        <div className="bar">
          <div style={{ width: `${(h.a.w / total) * 100}%`, background: 'var(--accent)' }} />
          <div style={{ width: `${(h.a.d / total) * 100}%`, background: 'var(--draw)' }} />
          <div style={{ width: `${(h.b.w / total) * 100}%`, background: 'var(--loss)' }} />
        </div>
        <div className="sc-legend" style={{ justifyContent: 'center', marginBottom: 12 }}>
          <span><i style={{ background: 'var(--win)' }} />{a} wins</span>
          <span><i style={{ background: 'var(--draw)' }} />draws</span>
          <span><i style={{ background: 'var(--loss)' }} />{b} wins</span>
        </div>
        <div className="grid cols3">
          <div className="stat"><div className="k">Goals</div><div className="v">{h.a.gf} : {h.a.ga}</div><div className="s">{a} {signed(h.a.gd)} · {f2(h.a.gf / h.a.p)} per game</div></div>
          <div className="stat"><div className="k">Points per game</div><div className="v">{f2(h.a.pts / h.a.p)} : {f2(h.b.pts / h.b.p)}</div></div>
          <div className="stat"><div className="k">Last 5 ({a})</div>
            <div className="form" style={{ marginTop: 6 }}>
              {[...h.matches].slice(-5).reverse().map((m, i) => {
                const gf = m.home === a ? m.hg : m.ag, ga = m.home === a ? m.ag : m.hg;
                return <Badge key={i} r={gf > ga ? 'W' : gf < ga ? 'L' : 'D'} />;
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="h2h-meetings">
        <h3>All meetings</h3>
        {byT.map(({ t, ms }) => (
          <div key={t.number} style={{ marginBottom: 12 }}>
            <div className="muted">{t.name}</div>
            {ms.map((m) => <MatchLine key={m.idx} m={m} />)}
          </div>
        ))}
      </div>
    </>
  );
}
