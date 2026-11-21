import React from 'react';
import { TournamentGrid } from '../components/TournamentCard.jsx';
import { PageTitle } from '../components/ui.jsx';
import { model } from '../data/model.js';

export default function Tournaments() {
  return (
    <>
      <PageTitle icon="🏟️" sub={`${model.tournaments.length} tournaments · ${model.allMatches.length} matches · ${model.allMatches.reduce((s, m) => s + m.hg + m.ag, 0)} goals`}>Tournaments</PageTitle>
      <div style={{ marginTop: 18 }}><TournamentGrid /></div>
    </>
  );
}
