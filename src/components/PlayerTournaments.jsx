import React from 'react';
import { Link } from 'react-router-dom';
import { model } from '../data/model.js';
import { f2, signed } from './ui.jsx';

const place = (n) => ['gold', 'silver', 'bronze'][n - 1] || 'plain';

/** One player's result in every tournament, newest first; missed ones show a red cross. */
export default function PlayerTournaments({ entries }) {
  return (
    <div className="pt-list">
      {[...model.tournaments].reverse().map((t) => {
        const e = entries.find((x) => x.t.number === t.number);
        const name = (
          <div className="pt-name">
            <b>Fifa tournament {t.number}</b>
            <span>{t.month} {t.year}{e && e.champion ? ' · 🏆 Champion' : ''}</span>
          </div>
        );
        if (!e) {
          return (
            <Link key={t.number} to={`/tournaments/${t.number}`} className="pt-row absent">
              <div className="pt-pos"><span className="mx-abs">✕</span></div>
              {name}
              <div className="pt-none">Did not participate</div>
            </Link>
          );
        }
        return (
          <Link key={t.number} to={`/tournaments/${t.number}`} className={'pt-row' + (e.champion ? ' champ' : '')}>
            <div className="pt-pos"><span className={`mx-pos ${place(e.pos)}`}>{e.pos}</span><small>of {e.of}</small></div>
            {name}
            <div className="pt-pts"><b>{e.pts}</b><span>pts</span></div>
            <div className="pt-wdl">
              <div className="wdl">
                <div style={{ flex: e.w, background: 'var(--win)' }} />
                <div style={{ flex: e.d, background: 'var(--draw)' }} />
                <div style={{ flex: e.l, background: 'var(--loss)' }} />
              </div>
              <span>{e.w}W {e.d}D {e.l}L</span>
            </div>
            <div className="pt-stats">
              <div><b>{e.gf}:{e.ga}</b><span>goals</span></div>
              <div><b>{signed(e.gd)}</b><span>diff</span></div>
              <div><b>{f2(e.ppg)}</b><span>PPG</span></div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
