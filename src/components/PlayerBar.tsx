import type { Puzzle } from '../catalog';
import type { Bar } from '../player';
import { CheckIcon, PlayIcon } from './icons';
import { Tile } from './Tile';

interface Props {
  bar: Bar;
  puzzle(id: string): Puzzle | undefined;
  done: number;
  total: number;
  onPlay(id: string): void;
  /** Un-ticks (Not yet) or ticks (Done) the puzzle you've come back from. */
  onMark(id: string, done: boolean): void;
}

/** The bar along the bottom, like Spotify's player: what you've come back from, and ▶ for what's next. */
export function PlayerBar({ bar, puzzle, done, total, onPlay, onMark }: Props) {
  if (bar.kind === 'empty') return null;

  let body: React.ReactNode;
  if (bar.kind === 'all-done') {
    const from = bar.from ? puzzle(bar.from) : undefined;
    body = (
      <>
        <p className="np-all-done">
          <CheckIcon /> All done for today
        </p>
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
    body = (
      <>
        <Tile puzzle={from} size={40} />
        <span className="np">
          <span className="np-line">
            {bar.ticked && <CheckIcon size={16} />} {from.name}
          </span>
          <span className="np-sub">{next ? `Up next: ${next.name}` : "That's the last one"}</span>
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
            <PlayIcon size={18} /> Next
          </button>
        )}
      </>
    );
  } else {
    const next = puzzle(bar.next);
    if (!next) return null;
    body = (
      <>
        <Tile puzzle={next} size={40} />
        <span className="np">
          <span className="np-sub">{bar.started ? 'Up next' : 'Start with'}</span>
          <span className="np-line">{next.name}</span>
        </span>
        <button type="button" className="next" onClick={() => onPlay(next.id)} aria-label={`Play ${next.name}`}>
          <PlayIcon size={18} /> {bar.started ? 'Continue' : 'Play'}
        </button>
      </>
    );
  }

  return (
    <footer className="player" aria-label="Player">
      <div className="progress" role="progressbar" aria-label="Done today" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
        <span style={{ width: `${total ? (100 * done) / total : 0}%` }} />
      </div>
      <div className="player-inner">{body}</div>
    </footer>
  );
}
