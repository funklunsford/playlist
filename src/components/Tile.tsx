import { initialOf, type Puzzle } from '../catalog';

interface Props {
  puzzle: Puzzle;
  /** Its piece's colour (src/pieces.ts); the catalog's own colour if it isn't on the list. */
  color?: string;
  size?: number;
}

/** A puzzle's badge: its initial on a round of felt, in its piece's colour. On a piece, the felt is white. */
export function Tile({ puzzle, color, size = 44 }: Props) {
  return (
    <span className="tile" aria-hidden="true" style={{ '--piece': color ?? puzzle.color, width: size, height: size, fontSize: Math.round(size * 0.46) } as React.CSSProperties}>
      {initialOf(puzzle.name)}
    </span>
  );
}
