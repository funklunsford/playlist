import { boardColumns, knobsOf } from '../pieces';
import type { Cell } from './PlaylistHeader';
import { StarIcon } from './icons';

interface Props {
  /** Each puzzle's piece, in list order: its colour and how it stands today. */
  pieces: { color: string; cell: Cell }[];
  /** The piece just placed (the puzzle you've come back from, ticked), which drops in. */
  placed?: number;
}

/**
 * Today's jigsaw: a piece per puzzle, put in place as each is done, so the picture is whole when the day is.
 * An empty place is a slot in the board; the next one's slot is outlined.
 */
export function Board({ pieces, placed }: Props) {
  const n = pieces.length;
  const cols = boardColumns(n);
  const done = pieces.filter((p) => p.cell === 'done').length;
  const complete = done === n;
  return (
    <div className={complete ? 'board-wrap complete' : 'board-wrap'}>
      <div className="board" style={{ '--cols': cols } as React.CSSProperties} role="img" aria-label={`${done} of ${n} done`}>
        {pieces.map((p, i) => (
          <span key={i} className={`bit ${p.cell}${i === placed ? ' just-placed' : ''}`} style={{ '--piece': p.color } as React.CSSProperties}>
            {knobsOf(i, n, cols).map((side) => (
              <span key={side} className={`nub ${side}`} />
            ))}
          </span>
        ))}
        {complete && <StarIcon size={34} />}
      </div>
      <p className="board-caption">{complete ? 'Complete!' : `${done} of ${n}`}</p>
    </div>
  );
}
