import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { model } from '../data/model.js';
import { Avatar } from './ui.jsx';

// How many tournament columns fit: 5 on phones, 8 on larger screens.
function useColumns() {
  const query = '(max-width: 600px)';
  const get = () => (typeof window !== 'undefined' && window.matchMedia && window.matchMedia(query).matches ? 5 : 8);
  const [n, setN] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setN(mq.matches ? 5 : 8);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return n;
}

const shortMonth = (t) => `${t.month.slice(0, 3)} ${String(t.year).slice(2)}`;

function Cell({ pos, t, player }) {
  if (!pos) return <span className="mx-abs" title={`${player} did not participate`}>✕</span>;
  const cls = pos <= 3 ? ['gold', 'silver', 'bronze'][pos - 1] : 'plain';
  return <span className={`mx-pos ${cls}`} title={`${pos}${['st', 'nd', 'rd'][pos - 1] || 'th'} of ${t.players.length}`}>{pos}</span>;
}

export default function StandingsMatrix() {
  const size = useColumns();
  const all = [...model.tournaments].reverse(); // newest first
  const maxOffset = Math.max(0, all.length - size);
  const [offset, setOffset] = useState(0);
  const off = Math.min(offset, maxOffset);
  const visible = all.slice(off, off + size);

  const rows = model.medals; // always every player
  const positionIn = (t, p) => t.table.find((r) => r.player === p)?.pos;

  return (
    <>
      <div className="table-wrap">
        <table className="mx">
          <thead>
            <tr>
              <th className="left">Player</th>
              {visible.map((t) => (
                <th key={t.number}>
                  <Link to={`/tournaments/${t.number}`} className="mx-head">
                    <b>T{t.number}</b><span>{shortMonth(t)}</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.player}>
                <td className="left">
                  <Link to={`/players/${encodeURIComponent(m.player)}`} className="mx-player">
                    <Avatar name={m.player} size={30} />
                    <span className="mx-name"><b>{m.player}</b><small>Played {m.tournaments}/{all.length}</small></span>
                  </Link>
                </td>
                {visible.map((t) => (
                  <td key={t.number}>
                    <Link to={`/tournaments/${t.number}`} className="mx-cell"><Cell pos={positionIn(t, m.player)} t={t} player={m.player} /></Link>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {maxOffset > 0 && (
        <div className="pager">
          <button className="tab" disabled={off === 0} onClick={() => setOffset(off - 1)}>← Newer</button>
          <span className="muted">
            {visible.length > 1 ? `T${visible[visible.length - 1].number}–T${visible[0].number}` : `T${visible[0].number}`} of {all.length}
          </span>
          <button className="tab" disabled={off >= maxOffset} onClick={() => setOffset(off + 1)}>Older →</button>
        </div>
      )}
    </>
  );
}
