import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';
import './trophies.css';

// HashRouter works on GitHub Pages without any server-side redirects.
createRoot(document.getElementById('root')).render(
  <HashRouter>
    <App />
  </HashRouter>,
);
