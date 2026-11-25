import React, { useEffect, useMemo, useState } from 'react';
import { TIERS, TIER_LABEL, computeTrophies, trophySummary } from '../lib/trophies.js';

/** Trophy art for a tier; falls back to the emoji on a coloured disc when the PNG does not exist yet. */
export function TrophyBadge({ trophy, tier, size = 96, locked }) {
  const [broken, setBroken] = useState(false);
  const t = tier || 'wood';
  useEffect(() => setBroken(false), [trophy.icon, t]);
  const style = { width: size, height: size };
  const cls = `tbadge tier-${t}${locked ? ' locked' : ''}`;
  if (broken) {
    return <span className={`${cls} fallback`} style={{ ...style, fontSize: size * 0.5 }}>{trophy.emoji}</span>;
  }
  return (
    <img className={cls} style={style} alt={`${trophy.name} ${TIER_LABEL[t]}`} loading="lazy"
      src={`${import.meta.env.BASE_URL}Trophies/${trophy.icon}-${t}.png`}
      onError={() => setBroken(true)} />
  );
}

export function TierPips({ idx }) {
  return (
    <div className="pips" aria-label={idx >= 0 ? `${TIER_LABEL[TIERS[idx]]} tier` : 'Not earned'}>
      {TIERS.map((t, i) => <span key={t} className={`pip tier-${t}${i <= idx ? ' on' : ''}`} title={TIER_LABEL[t]} />)}
    </div>
  );
}

function TrophyCard({ t, onOpen }) {
  const locked = t.idx < 0;
  return (
    <button type="button" className={`trophy-card ${t.tier ? 'tier-' + t.tier : 'is-locked'}${t.max ? ' maxed' : ''}`} onClick={() => onOpen(t)}
      title={`${t.name} · ${t.tier ? TIER_LABEL[t.tier] : 'Locked'}`} aria-label={`${t.name}, ${t.tier ? TIER_LABEL[t.tier] : 'locked'}`}>
      {t.max && <span className="ribbon">MAX</span>}
      <div className="tstage">
        <TrophyBadge trophy={t} tier={t.tier} size={150} locked={locked} />
        {locked && <span className="lock">🔒</span>}
      </div>
      <TierPips idx={t.idx} />
      <div className={`tbar tier-${t.nextTier || t.tier || 'wood'}`}><i style={{ width: `${Math.round(t.progress * 100)}%` }} /></div>
      <div className="tprog">
        {t.max ? `${t.value} ${t.unit}` : <>{t.value} / {t.next} <span>→ {TIER_LABEL[t.nextTier]}</span></>}
      </div>
    </button>
  );
}

export function TrophyModal({ t, onClose, generic }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="tmodal-bg" onClick={onClose}>
      <div className="tmodal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={t.name}>
        <button className="tmodal-x" onClick={onClose} aria-label="Close">✕</button>
        <div className="tmodal-head">
          <TrophyBadge trophy={t} tier={t.tier} size={260} locked={!generic && t.idx < 0} />
          <h3>{t.name}</h3>
          <div className="muted">{t.req}</div>
          {!generic && <div className="tmodal-val"><b>{t.value}</b> {t.unit}</div>}
        </div>
        <div className="ladder">
          {TIERS.map((tier, i) => (
            <div key={tier} className={`rung tier-${tier}${!generic && i <= t.idx ? ' on' : ''}`}>
              <TrophyBadge trophy={t} tier={tier} size={72} locked={!generic && i > t.idx} />
              <b>{t.thresholds[i]}</b>
              <span>{TIER_LABEL[tier]}</span>
              <em>{!generic && i <= t.idx ? '✓' : ''}</em>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function useTrophies(prof) {
  return useMemo(() => {
    const list = computeTrophies(prof);
    return { list, ...trophySummary(list) };
  }, [prof]);
}

/** Small row of a player's best trophies for the banner. */
export function TrophyShowcase({ data }) {
  const top = data.list.filter((t) => t.idx >= 0).sort((a, b) => b.idx - a.idx).slice(0, 5);
  return (
    <a href="#trophy-room" className="showcase" onClick={(e) => { e.preventDefault(); document.getElementById('trophy-room')?.scrollIntoView({ behavior: 'smooth' }); }}>
      {top.map((t) => (
        <span key={t.id} className={`sc-icon tier-${t.tier}`} title={`${t.name} · ${TIER_LABEL[t.tier]} · ${t.value} ${t.unit}`}>
          <TrophyBadge trophy={t} tier={t.tier} size={46} />
        </span>
      ))}
      <span className="showcase-pill">🏅 {data.earned} / {data.total}</span>
    </a>
  );
}

// one full row by default: 5 on desktop, 4 on phones (matches the CSS grid columns)
function useTopCount() {
  const q = '(max-width: 600px)';
  const get = () => (typeof window !== 'undefined' && window.matchMedia(q).matches ? 4 : 5);
  const [n, setN] = useState(get);
  useEffect(() => {
    const m = window.matchMedia(q);
    const f = () => setN(get());
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return n;
}

export function TrophyRoom({ data }) {
  const TOP = useTopCount();
  const [all, setAll] = useState(false);
  const [open, setOpen] = useState(null);
  // best first: highest tier, then closest to the next tier
  const sorted = [...data.list].sort((a, b) => b.idx - a.idx || b.progress - a.progress);
  const shown = all ? sorted : sorted.slice(0, TOP);
  return (
    <section className="card troom" id="trophy-room">
      <div className="head">
        <h2>🏆 Trophy Room</h2>
        <div className="muted troom-sum"><b>{data.earned}</b> / {data.total} tiers · score <b>{data.score}</b></div>
      </div>
      <div className="trophy-grid">
        {shown.map((t) => <TrophyCard key={t.id} t={t} onOpen={setOpen} />)}
      </div>
      {data.list.length > TOP && (
        <button type="button" className="tab troom-more" onClick={() => setAll(!all)}>
          {all ? `Show top ${TOP} only ▲` : `Show all ${data.list.length} trophies ▼`}
        </button>
      )}
      {open && <TrophyModal t={data.list.find((x) => x.id === open.id)} onClose={() => setOpen(null)} />}
    </section>
  );
}
