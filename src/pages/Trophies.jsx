import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { model } from '../data/model.js';
import { playerProfile } from '../lib/stats.js';
import { TIERS, TIER_LABEL, TROPHIES, computeTrophies } from '../lib/trophies.js';
import { Avatar, PageTitle } from '../components/ui.jsx';
import { TrophyBadge, TrophyModal } from '../components/Trophies.jsx';

const PHONE_MAX = 3; // holders shown per tier on phones, rest become "+N"

function Holders({ list }) {
  if (!list.length) return <div className="holders none">–</div>;
  return (
    <div className="holders">
      {list.map((h, i) => (
        <Link key={h.player} to={`/players/${encodeURIComponent(h.player)}`} className={'holder' + (i >= PHONE_MAX ? ' extra' : '')} title={`${h.player} · ${h.value}`}>
          <Avatar name={h.player} size={34} />
          <span className="hn">{h.player}</span>
          <span className="hv">{h.value}</span>
        </Link>
      ))}
      {list.length > PHONE_MAX && <span className="more">+{list.length - PHONE_MAX}</span>}
    </div>
  );
}

export default function Trophies() {
  const [open, setOpen] = useState(null);

  // every player's trophies, grouped by trophy and highest tier reached
  const rows = useMemo(() => {
    const perPlayer = model.allPlayers.map((p) => ({ p, list: computeTrophies(playerProfile(model, p)) }));
    return TROPHIES.map((def) => {
      const byTier = TIERS.map(() => []);
      for (const { p, list } of perPlayer) {
        const t = list.find((x) => x.id === def.id);
        if (t.idx >= 0) byTier[t.idx].push({ player: p, value: t.value });
      }
      byTier.forEach((a) => a.sort((x, y) => y.value - x.value || x.player.localeCompare(y.player)));
      return { def, byTier };
    });
  }, []);

  return (
    <>
      <PageTitle icon="🏆" sub={`${TROPHIES.length} trophies · ${TROPHIES.length * TIERS.length} tiers to collect`}>Trophies</PageTitle>

      {rows.map(({ def, byTier }) => (
        <section key={def.id} id={`tr-${def.id}`} className="card tr-block">
          <div className="tr-head">
            <h2>{def.name}</h2>
            <div className="muted">{def.req}</div>
          </div>
          <div className="tr-tiers">
            {TIERS.map((tier, i) => {
              const has = byTier[i].length > 0;
              return (
                <div key={tier} className={`tr-tier tier-${tier}${has ? ' has' : ''}`}>
                  <button type="button" className="tr-icon" aria-label={`${def.name} ${TIER_LABEL[tier]}`}
                    onClick={() => setOpen({ ...def, tier, idx: i })}>
                    <TrophyBadge trophy={def} tier={tier} size={96} locked={!has} />
                  </button>
                  <div className="tr-label">{TIER_LABEL[tier]}</div>
                  <div className="tr-need">{def.thresholds[i]}</div>
                  <Holders list={byTier[i]} />
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {open && <TrophyModal t={open} generic onClose={() => setOpen(null)} />}
    </>
  );
}
