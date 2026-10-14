import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
// The fonts, bundled with the site: Fredoka for the title, and Nunito for everything else.
import '@fontsource-variable/fredoka';
import '@fontsource-variable/nunito';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
