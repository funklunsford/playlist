import type { Puzzle } from '../catalog';
import { longDate } from '../day';
import { Artwork } from './Artwork';
import { CheckIcon, PlayIcon, ShuffleIcon } from './icons';

interface Props {
  title: string;
  date: string;
  puzzles: readonly Puzzle[];
  /** How many are done today. */
  done: number;
  /** Something's been played or skipped today, so ▶ resumes rather than plays. */
  started: boolean;
  editing: boolean;
  /** The puzzle ▶ plays, and playing it; absent when there's none left. */
  next?: Puzzle;
  onPlay(): void;
  shuffle: boolean;
  onShuffle(): void;
}

/**
 * The top of the playlist, as a music app shows one: its cover, its title, the date and how far today has got, and
 * Play beside Shuffle. Shuffle is a switch: on, ▶ and Next take the puzzles in a shuffled order (src/shuffle.ts).
 */
export function PlaylistHeader({ title, date, puzzles, done, started, editing, next, onPlay, shuffle, onShuffle }: Props) {
  const total = puzzles.length;
  return (
    <section className="hero" aria-label="Today's playlist">
      <Artwork puzzles={puzzles} />
      <div className="hero-text">
        <h1>{title}</h1>
        <p className="curator">Puzzle Playlist</p>
        <p className="meta">
          {longDate(date)}
          {total > 0 && ` · ${done === total ? 'All done' : `${done} of ${total} done`}`}
        </p>
        {total > 0 && !editing && (
          <div className="hero-actions">
            <button type="button" className="action" onClick={onPlay} disabled={!next} aria-label={next ? `Play ${next.name}` : 'All done for today'}>
              {next ? (
                <>
                  <PlayIcon size={18} /> {started ? 'Resume' : 'Play'}
                </>
              ) : (
                <>
                  <CheckIcon size={18} /> All Done
                </>
              )}
            </button>
            <button type="button" className="action" aria-pressed={shuffle} onClick={onShuffle}>
              <ShuffleIcon size={18} /> Shuffle
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
