import type { Puzzle } from '../catalog';
import { coverOf } from '../icons';
import { pieceColor } from '../pieces';
import { GridIcon } from './icons';
import { Tile } from './Tile';

/**
 * The playlist's cover, made from its puzzles' icons the way a music app makes one from albums: the first four with
 * different icons in a 2 × 2 mosaic, or with fewer than four, the first one's alone (src/icons.ts).
 */
export function Artwork({ puzzles }: { puzzles: readonly Puzzle[] }) {
  const shown = coverOf(puzzles);
  return (
    <div className={`artwork tiles-${shown.length}`} aria-hidden="true">
      {shown.length ? (
        shown.map((p) => <Tile key={p.id} puzzle={p} color={pieceColor(puzzles.indexOf(p))} fill />)
      ) : (
        <span className="art-empty">
          <GridIcon size={72} />
        </span>
      )}
    </div>
  );
}
