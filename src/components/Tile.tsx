import { initialOf, type Puzzle } from '../catalog';

interface Props {
  puzzle: Puzzle;
  /** Its colour on the list (src/pieces.ts); the catalog's own colour if it isn't on the list. */
  color?: string;
  size?: number;
}

/** A puzzle's badge: its initial in a circle of its colour. On a coloured card, the circle is white. */
export function Tile({ puzzle, color, size = 40 }: Props) {
  return (
    <span className="tile" aria-hidden="true" style={{ '--piece': color ?? puzzle.color, width: size, height: size, fontSize: Math.round(size * 0.42) } as React.CSSProperties}>
      {initialOf(puzzle.name)}
    </span>
  );
}
