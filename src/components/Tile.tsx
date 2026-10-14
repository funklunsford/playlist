import { initialOf, type Puzzle } from '../catalog';

interface Props {
  puzzle: Puzzle;
  /** Its number on the list, in the corner as a crossword numbers its squares. */
  n?: number;
  size?: number;
}

/** A puzzle's square, drawn like a crossword's: its initial, its number in the corner, and a wash of its colour. */
export function Tile({ puzzle, n, size = 44 }: Props) {
  return (
    <span className="tile" aria-hidden="true" style={{ '--tint': puzzle.color, width: size, height: size, fontSize: Math.round(size * 0.5) } as React.CSSProperties}>
      {n !== undefined && <span className="tile-n">{n}</span>}
      {initialOf(puzzle.name)}
    </span>
  );
}
