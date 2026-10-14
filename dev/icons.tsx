// Every catalog puzzle's artwork as the playlist draws it, on white and on black, at a row's size and a cover's
// quarter: for checking a new icon's plate, inset and size (src/icons.ts). On the dev server: /dev/icons.html
import { createRoot } from 'react-dom/client';
import { CATALOG } from '../src/catalog';
import { Tile } from '../src/components/Tile';
import '../src/styles.css';

const Sheet = ({ background, color }: { background: string; color: string }) => (
  <section style={{ display: 'flex', flexWrap: 'wrap', gap: 14, padding: 16, background, color }}>
    {CATALOG.map((p) => (
      <figure key={p.id} style={{ margin: 0, width: 132, display: 'grid', justifyItems: 'center', gap: 6, font: '11px -apple-system, system-ui' }}>
        <Tile puzzle={p} />
        <div className="artwork" style={{ width: 116, height: 116 }}>
          <Tile puzzle={p} fill />
        </div>
        <figcaption>{p.name}</figcaption>
      </figure>
    ))}
  </section>
);

createRoot(document.getElementById('root')!).render(
  <>
    <Sheet background="#ffffff" color="#000000" />
    <Sheet background="#000000" color="#ffffff" />
  </>,
);
