import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
// The fonts, bundled with the site: Fraunces for headings and names, Courier Prime for labels (a typewriter),
// and Caveat for the marks a teacher's pen makes.
import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource/caveat/600.css';
import '@fontsource/caveat/700.css';
import '@fontsource/courier-prime/400.css';
import '@fontsource/courier-prime/700.css';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
