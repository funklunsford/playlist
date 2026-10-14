import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
// The fonts, bundled with the site: Fredoka, round like a jigsaw's knobs, for headings, names and buttons, and
// Nunito for the rest.
import '@fontsource-variable/fredoka';
import '@fontsource-variable/nunito';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
