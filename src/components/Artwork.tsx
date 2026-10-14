import type { Puzzle } from '../catalog';
import { coverTiles } from '../icons';
import { pieceColor } from '../pieces';
import { GridIcon } from './icons';
import { Tile } from './Tile';

/**
 * The playlist's cover, mixed from its puzzles' icons the way a music app makes one from albums: a 2 × 2 mosaic of
 * the first four different icons, with two or three mixed in too, or one alone (src/icons.ts).
 */
export function Artwork({ puzzles }: { puzzles: readonly Puzzle[] }) {
  const tiles = coverTiles(puzzles);
  return (
    <div className={`artwork tiles-${tiles.length}`} aria-hidden="true">
      {tiles.length ? (
        tiles.map((p, i) => <Tile key={i} puzzle={p} color={pieceColor(puzzles.indexOf(p))} fill />)
      ) : (
        <span className="art-empty">
          <GridIcon size={72} />
        </span>
      )}
    </div>
  );
}
