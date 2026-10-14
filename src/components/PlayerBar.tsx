import type { Puzzle } from '../catalog';
import type { Bar, Day } from '../player';
import { CheckCircleIcon, ForwardIcon, PlayIcon, ShuffleIcon, StarIcon } from './icons';
import { Tile } from './Tile';

interface Props {
  bar: Bar;
  puzzle(id: string): Puzzle | undefined;
  /** A puzzle's colour on the list. */
  colorOf(id: string): string;
  /** Today's marks, for a grade to show. */
  marks: Day;
  /** Whether Shuffle is on, which the bar notes beside what's next. */
  shuffle: boolean;
  onPlay(id: string): void;
  /** Un-ticks (Not yet) or ticks (Done) the puzzle you've come back from. */
  onMark(id: string, done: boolean): void;
}

/**
 * The mini player, floating along the bottom: the puzzle you've come back from, ticked with its grade, and the button
 * for the next; or, on a fresh visit, the puzzle that's up next.
 */
export function PlayerBar({ bar, puzzle, colorOf, marks, shuffle, onPlay, onMark }: Props) {
  if (bar.kind === 'empty') return null;
  const shuffled = shuffle && <ShuffleIcon size={13} />;

  let body: React.ReactNode;
  if (bar.kind === 'all-done') {
    const from = bar.from ? puzzle(bar.from) : undefined;
    body = (
      <>
        <span className="np-star">
          <StarIcon size={28} />
        </span>
        <span className="np">
          <span className="np-name">All done for today</span>
          <span className="np-sub">See you tomorrow</span>
        </span>
        {from && (
          <button type="button" className="text-button" onClick={() => onMark(from.id, false)} aria-label={`Not yet: ${from.name}`}>
            Not Yet
          </button>
        )}
      </>
    );
  } else if (bar.kind === 'back') {
    const from = puzzle(bar.from);
    const next = bar.next ? puzzle(bar.next) : undefined;
    if (!from) return null;
    const grade = bar.ticked ? marks[from.id]?.score : undefined;
    body = (
      <>
        <Tile puzzle={from} color={colorOf(from.id)} size={44} />
        <span className="np">
          <span className="np-line">
            {bar.ticked && <CheckCircleIcon size={16} />}
            <span className="np-name">{from.name}</span>
          </span>
          {/* The grade leads the line below, so a long one never crowds out the name. */}
          <span className="np-sub">
            {grade && (
              <>
                <span className="grade">{grade}</span>
                {' · '}
              </>
            )}
            {next ? (
              <>
                {shuffled}Up next: <b>{next.name}</b>
              </>
            ) : (
              "That's the last one"
            )}
          </span>
        </span>
        {bar.ticked ? (
          <button type="button" className="text-button" onClick={() => onMark(from.id, false)}>
            Not Yet
          </button>
        ) : (
          <button type="button" className="button gray" onClick={() => onMark(from.id, true)}>
            Done
          </button>
        )}
        {next && (
          <button type="button" className="button filled" onClick={() => onPlay(next.id)} aria-label={`Play ${next.name}`}>
            <ForwardIcon size={16} /> Next
          </button>
        )}
      </>
    );
  } else {
    const next = puzzle(bar.next);
    if (!next) return null;
    body = (
      <>
        <Tile puzzle={next} color={colorOf(next.id)} size={44} />
        <span className="np">
          <span className="np-sub">
            {shuffled}
            {bar.started ? 'Up next' : 'First up'}
          </span>
          <span className="np-name">{next.name}</span>
        </span>
        <button type="button" className="button filled" onClick={() => onPlay(next.id)} aria-label={`Play ${next.name}`}>
          <PlayIcon size={16} /> {bar.started ? 'Resume' : 'Play'}
        </button>
      </>
    );
  }

  return (
    <footer className="player" aria-label="Up next">
      <div className={`player-inner ${bar.kind}`}>{body}</div>
    </footer>
  );
}
