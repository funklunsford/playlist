import { initialOf, type Puzzle } from '../catalog';

interface Props {
  puzzle: Puzzle;
  /** Its colour on the list (src/pieces.ts); the catalog's own colour if it isn't on the list. */
  color?: string;
  size?: number;
}

/** A puzzle's artwork: its initial on a rounded square of its colour, as a song has its album's cover. */
export function Tile({ puzzle, color, size = 48 }: Props) {
  return (
    <span
      className="tile"
      aria-hidden="true"
      style={{ '--piece': color ?? puzzle.color, width: size, height: size, fontSize: Math.round(size * 0.46), borderRadius: Math.round(size / 8) } as React.CSSProperties}
    >
      {initialOf(puzzle.name)}
    </span>
  );
}
