// index.js

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import MainApp from './MainApp';
import reportWebVitals from './reportWebVitals';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <MainApp />
    </Router>
  </React.StrictMode>,
);

reportWebVitals();
