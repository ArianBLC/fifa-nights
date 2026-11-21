import React from 'react';
import { f2, pct, signed } from './ui.jsx';

const ord = (n) => `${n}${['st', 'nd', 'rd'][n - 1] || 'th'}`;
const MEDAL = ['🥇', '🥈', '🥉'];

function Card({ icon, title, children }) {
  return (
    <div className="sc">
      <div className="sc-title"><span>{icon}</span> {title}</div>
      {children}
    </div>
  );
}

function TournamentRow({ label, e }) {
  return (
    <div className="sc-trow">
      <span className="sc-tbadge">T{e.t.number}</span>
      <div style={{ flex: 1 }}>
        <div className="muted" style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
        <b>{f2(e.ppg)} PPG</b> <span className="muted">· {e.pts} pts</span>
      </div>
      <div className="sc-place">{MEDAL[e.pos - 1] || ''} {ord(e.pos)}<span className="muted"> / {e.of}</span></div>
    </div>
  );
}

export default function StatCards({ prof }) {
  const r = prof.row;
  const goalShare = r.gf + r.ga ? (r.gf / (r.gf + r.ga)) * 100 : 50;
  const cs = r.p ? (prof.cleanSheets / r.p) * 100 : 0;
  return (
    <div className="scgrid">
      <Card icon="📊" title="Results">
        <div className="sc-big">{pct(r.winRate)} <span>win rate</span></div>
        <div className="wdl">
          <div style={{ flex: r.w, background: 'var(--win)' }} />
          <div style={{ flex: r.d, background: 'var(--draw)' }} />
          <div style={{ flex: r.l, background: 'var(--loss)' }} />
        </div>
        <div className="sc-legend">
          <span><i style={{ background: 'var(--win)' }} />{r.w} wins</span>
          <span><i style={{ background: 'var(--draw)' }} />{r.d} draws</span>
          <span><i style={{ background: 'var(--loss)' }} />{r.l} losses</span>
        </div>
      </Card>

      <Card icon="⚽" title="Goals">
        <div className="sc-big">{r.gf} <span style={{ color: 'var(--muted)' }}>:</span> {r.ga}</div>
        <div className="wdl"><div style={{ width: `${goalShare}%`, background: 'var(--win)' }} /><div style={{ flex: 1, background: 'var(--loss)' }} /></div>
        <div className="sc-legend">
          <span><i style={{ background: 'var(--win)' }} />{f2(r.gfpg)} scored / game</span>
          <span><i style={{ background: 'var(--loss)' }} />{f2(r.ga / r.p)} conceded / game</span>
        </div>
        <div className="muted" style={{ marginTop: 4 }}>Goal difference <b style={{ color: 'var(--text)' }}>{signed(r.gd)}</b></div>
      </Card>

      <Card icon="🎯" title="Points per game">
        <div className="sc-big">{f2(r.ppg)} <span>of 3.00</span></div>
        <div className="gauge"><div style={{ width: `${(r.ppg / 3) * 100}%` }} /></div>
        <div className="muted" style={{ marginTop: 6 }}><b style={{ color: 'var(--text)' }}>{r.pts}</b> points in {r.p} matches</div>
      </Card>

      <Card icon="🧱" title="Clean sheets">
        <div className="sc-ringrow">
          <div className="ring" style={{ '--p': cs }}><div><b>{prof.cleanSheets}</b></div></div>
          <div className="muted">
            Kept a clean sheet in <b style={{ color: 'var(--text)' }}>{pct(prof.cleanSheets / r.p)}</b> of {r.p} matches
          </div>
        </div>
      </Card>

      <Card icon="🔥" title="Streaks">
        <div className="sc-two">
          <div><div className="sc-big">{prof.longestWin}</div><div className="muted">longest win streak</div></div>
          <div><div className="sc-big">{prof.longestUnbeaten}</div><div className="muted">longest unbeaten run</div></div>
        </div>
      </Card>

      <Card icon="🏟️" title="Tournaments">
        <TournamentRow label="Best" e={prof.bestT} />
        <TournamentRow label="Worst" e={prof.worstT} />
      </Card>
    </div>
  );
}
