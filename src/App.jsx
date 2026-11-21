import React, { useEffect, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Tournaments from './pages/Tournaments.jsx';
import TournamentDetail from './pages/TournamentDetail.jsx';
import Players from './pages/Players.jsx';
import PlayerDetail from './pages/PlayerDetail.jsx';
import HallOfFame from './pages/HallOfFame.jsx';
import AllTime from './pages/AllTime.jsx';

const links = [
  ['/', 'Home'], ['/tournaments', 'Tournaments'], ['/players', 'Players'],
  ['/all-time', 'All-time'], ['/hall-of-fame', 'Hall of Fame'],
];

export default function App() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); }, [pathname]); // close the mobile menu after navigating
  return (
    <>
      <nav>
        <div className="inner">
          <NavLink to="/" className="brand">⚽ FIFA Nights</NavLink>
          <button className="menu-btn" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? '✕' : '☰'}
          </button>
          <div className={'links' + (open ? ' open' : '')}>
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => 'link' + (isActive ? ' active' : '')}>
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:n" element={<TournamentDetail />} />
          <Route path="/players" element={<Players />} />
          <Route path="/players/:name" element={<PlayerDetail />} />
          <Route path="/all-time" element={<AllTime />} />
          <Route path="/hall-of-fame" element={<HallOfFame />} />
          <Route path="/head-to-head" element={<Navigate to="/players" replace />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </div>
    </>
  );
}
