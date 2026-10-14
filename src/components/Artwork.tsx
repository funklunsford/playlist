import { initialOf, type Puzzle } from '../catalog';
import { pieceColor } from '../pieces';
import { GridIcon } from './icons';

/**
 * The playlist's cover, made from its puzzles the way a music app makes one from albums: the first four in a 2 × 2
 * mosaic, or with fewer than four, the first one's alone. Each is in its colour on the list.
 */
export function Artwork({ puzzles }: { puzzles: readonly Puzzle[] }) {
  const shown = puzzles.length >= 4 ? puzzles.slice(0, 4) : puzzles.slice(0, 1);
  return (
    <div className={`artwork tiles-${shown.length}`} aria-hidden="true">
      {shown.length ? (
        shown.map((p, i) => (
          <span key={p.id} className="art-tile" style={{ '--piece': pieceColor(i) } as React.CSSProperties}>
            {initialOf(p.name)}
          </span>
        ))
      ) : (
        <span className="art-empty">
          <GridIcon size={72} />
        </span>
      )}
    </div>
  );
}
