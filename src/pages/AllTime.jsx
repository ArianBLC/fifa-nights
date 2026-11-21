import React, { useMemo, useState } from 'react';
import { model } from '../data/model.js';
import { PageTitle, PlayerLink, f2, pct, signed } from '../components/ui.jsx';

const cols = [
  ['titles', '🏆'], ['tournaments', 'Tourn.'], ['p', 'P'], ['w', 'W'], ['d', 'D'], ['l', 'L'],
  ['gf', 'GF'], ['ga', 'GA'], ['gd', 'GD'], ['pts', 'Pts'], ['ppg', 'PPG'], ['winRate', 'Win%'], ['gfpg', 'Goals/g'],
];

export default function AllTime() {
  const [key, setKey] = useState('ppg');
  const [dir, setDir] = useState(-1);
  const [min, setMin] = useState(0);
  const rows = useMemo(() => model.allTime.filter((r) => r.p >= min)
    .sort((a, b) => dir * (a[key] - b[key]) || b.pts - a.pts), [key, dir, min]);
  const click = (k) => { if (k === key) setDir(-dir); else { setKey(k); setDir(-1); } };
  const fmt = { ppg: f2, winRate: pct, gfpg: f2, gd: signed };
  return (
    <>
    <PageTitle icon="📊" sub="Every match ever played, ranked by points per game">All-time</PageTitle>
    <section className="card">
      <div className="head">
        <span />
        <label className="muted">Min. matches played:&nbsp;
          <select value={min} onChange={(e) => setMin(Number(e.target.value))}>
            {[0, 8, 16, 24, 40].map((v) => <option key={v} value={v}>{v === 0 ? 'any' : v}</option>)}
          </select>
        </label>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr>
            <th>#</th><th className="left">Player</th>
            {cols.map(([k, l]) => <th key={k} className="sortable" onClick={() => click(k)}>{l}{key === k ? (dir < 0 ? ' ▼' : ' ▲') : ''}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.player}>
                <td>{i + 1}</td><td className="left"><PlayerLink name={r.player} /></td>
                {cols.map(([k]) => <td key={k} className={k === key ? 'strong' : ''}>{(fmt[k] || ((v) => v))(r[k])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="muted" style={{ fontSize: '.8rem', marginTop: 8 }}>Click a column header to sort. Default ranking is points per game (PPG).</div>
    </section>
    </>
  );
}
