import { publisherLabel, type Puzzle } from '../catalog';
import { Tile } from './Tile';

interface Props {
  n: number;
  puzzle: Puzzle;
  /** The status and actions at the end of the row. */
  children?: React.ReactNode;
}

/** A puzzle in the playlist: its number, tile, name and publisher, like a track. */
export function PuzzleRow({ n, puzzle, children }: Props) {
  return (
    <li className="row">
      <span className="n">{n}</span>
      <Tile puzzle={puzzle} />
      <span className="title">
        <span className="name">{puzzle.name}</span>
        <span className="by">{publisherLabel(puzzle)}</span>
      </span>
      {children}
    </li>
  );
}
