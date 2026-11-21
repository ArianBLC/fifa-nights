import React from 'react';
import { Link } from 'react-router-dom';
import { model } from '../data/model.js';
import { Avatar, signed } from './ui.jsx';

const MEDAL = ['🥇', '🥈', '🥉'];

/** Podium: 1st in the middle (biggest), 2nd left, 3rd right. `scale` enlarges avatars. */
export function Podium({ t, scale = 1 }) {
  const order = [1, 0, 2].filter((i) => t.table[i]);
  return (
    <div className="tpodium">
      {order.map((i) => {
        const r = t.table[i];
        return (
          <div key={r.player} className={`tstep ts${i + 1}`}>
            {i === 0 && <div className="tcrown">👑</div>}
            <Avatar name={r.player} size={Math.round((i === 0 ? 84 : 62) * scale)} />
            <div className="tpname">{r.player}</div>
            <div className="tppts"><b>{r.pts}</b> pts</div>
            <div className="tblock">{MEDAL[i]}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function TournamentCard({ t, latest }) {
  const others = t.table.slice(3);
  return (
    <Link to={`/tournaments/${t.number}`} className="tcard">
      <div className="tcard-head">
        <div className="tcard-name">Fifa tournament {t.number}</div>
        <div className="tcard-date">{t.month} {t.year}</div>
        <div className="tcard-icons">
          <span title="Players">👥 {t.players.length} players</span>
          <span title="Matches">⚽ {t.matches.length} matches</span>
          <span title="Goals">🥅 {t.goals} goals</span>
        </div>
      </div>

      <Podium t={t} />

      {others.length > 0 && (
        <div className="tothers">
          {others.map((r) => (
            <div className="tother" key={r.player} title={`${r.player}: ${r.pts} pts, GD ${signed(r.gd)}`}>
              <Avatar name={r.player} size={34} />
              <div><b>{r.pos}.</b> {r.player}<span className="muted"> · {r.pts} pts</span></div>
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}

/** Newest first. `limit` caps how many cards are shown. */
export function TournamentGrid({ limit = Infinity }) {
  const list = [...model.tournaments].reverse().slice(0, limit);
  return (
    <div className="tgrid">
      {list.map((t, i) => <TournamentCard key={t.number} t={t} latest={i === 0} />)}
    </div>
  );
}
