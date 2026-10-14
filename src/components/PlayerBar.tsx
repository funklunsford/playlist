import type { Puzzle } from '../catalog';
import type { Bar, Day } from '../player';
import { ArrowIcon, StarIcon, TickIcon } from './icons';
import { Tile } from './Tile';

interface Props {
  bar: Bar;
  puzzle(id: string): Puzzle | undefined;
  /** A puzzle's piece colour. */
  colorOf(id: string): string;
  /** Today's marks, for a grade to show. */
  marks: Day;
  onPlay(id: string): void;
  /** Un-ticks (Not yet) or ticks (Done) the puzzle you've come back from. */
  onMark(id: string, done: boolean): void;
}

/**
 * The felt card along the bottom, with a knob on top like the next piece waiting: the puzzle you've come back
 * from, ticked with its grade, and the button for the next one. When the jigsaw's done, a gold star.
 */
export function PlayerBar({ bar, puzzle, colorOf, marks, onPlay, onMark }: Props) {
  if (bar.kind === 'empty') return null;

  let body: React.ReactNode;
  if (bar.kind === 'all-done') {
    const from = bar.from ? puzzle(bar.from) : undefined;
    body = (
      <>
        <StarIcon size={42} />
        <p className="np-all-done">All done for today!</p>
        {from && (
          <button type="button" className="text-button not-yet" onClick={() => onMark(from.id, false)} aria-label={`Not yet: ${from.name}`}>
            Not yet
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
        <Tile puzzle={from} color={colorOf(from.id)} size={42} />
        <span className="np">
          <span className="np-line">
            {bar.ticked && <TickIcon size={18} />}
            <span className="np-name">{from.name}</span>
          </span>
          <span className="np-sub">
            {grade && <span className="grade">{grade}</span>}
            {next ? (
              <>
                Next up: <b>{next.name}</b>
              </>
            ) : (
              "That's the last one"
            )}
          </span>
        </span>
        {bar.ticked ? (
          <button type="button" className="text-button not-yet" onClick={() => onMark(from.id, false)}>
            Not yet
          </button>
        ) : (
          <button type="button" className="pill outline small" onClick={() => onMark(from.id, true)}>
            Done
          </button>
        )}
        {next && (
          <button type="button" className="next" onClick={() => onPlay(next.id)} aria-label={`Play ${next.name}`}>
            Next <ArrowIcon size={20} />
          </button>
        )}
      </>
    );
  } else {
    const next = puzzle(bar.next);
    if (!next) return null;
    body = (
      <>
        <Tile puzzle={next} color={colorOf(next.id)} size={42} />
        <span className="np">
          <span className="np-label">{bar.started ? 'Next up' : 'First up'}</span>
          <span className="np-line">
            <span className="np-name">{next.name}</span>
          </span>
        </span>
        <button type="button" className="next" onClick={() => onPlay(next.id)} aria-label={`Play ${next.name}`}>
          {bar.started ? 'Continue' : 'Start'} <ArrowIcon size={20} />
        </button>
      </>
    );
  }

  return (
    <footer className="player" aria-label="Next puzzle">
      <span className="player-knob" aria-hidden="true" />
      <div className="player-inner">{body}</div>
    </footer>
  );
}
