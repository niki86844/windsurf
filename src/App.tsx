import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Biens from './components/Biens';
import ReajustementLetterEditor from './components/ReajustementLetterEditor';
import LetterTemplatesPage from './components/LetterTemplatesPage';
import TestPage from './components/TestPage';

// Placeholder pour Loyers (à compléter si besoin)
function Loyers() {
  return <div style={{ padding: '2rem' }}>Paramétrage des Loyers (à compléter)</div>;
}

// Bandeau debug affichant la route courante
function DebugBanner() {
  const location = useLocation();
  return (
    <div style={{ background: 'yellow', color: 'black', padding: '0.5rem' }}>
      DEBUG: NAVIGATION ACTIVE – path = {location.pathname}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <nav className="mb-8 flex gap-4 p-4">
        <NavLink to="/biens" className={({ isActive }) => isActive ? 'font-bold underline' : ''}>Biens</NavLink>
        <NavLink to="/loyers" className={({ isActive }) => isActive ? 'font-bold underline' : ''}>Paramétrage des Loyers</NavLink>
        <NavLink to="/reajustement" className={({ isActive }) => isActive ? 'font-bold underline' : ''}>Réajustement des Loyers</NavLink>
        <NavLink to="/templates" className={({ isActive }) => isActive ? 'font-bold underline' : ''}>Modèles de lettre</NavLink>
        <NavLink to="/test" className={({ isActive }) => isActive ? 'font-bold underline' : ''}>TestPage</NavLink>
      </nav>
      <DebugBanner />
      <div className="min-h-[60vh] p-6">
        <Routes>
          <Route path="/biens" element={<Biens />} />
          <Route path="/loyers" element={<Loyers />} />
          <Route path="/reajustement" element={<ReajustementLetterEditor />} />
          <Route path="/templates" element={<LetterTemplatesPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="*" element={<Biens />} />
        </Routes>
      </div>
    </Router>
  );
}
