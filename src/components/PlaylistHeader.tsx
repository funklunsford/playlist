import type { Puzzle } from '../catalog';
import { longDate } from '../day';
import { NAME_LENGTH } from '../store';
import { Artwork } from './Artwork';
import { CheckIcon, PlayIcon, ShuffleIcon } from './icons';

interface Props {
  /** The playlist's name. */
  name: string;
  /** Renames the playlist: while editing, the name is a field to type in. */
  onRename(name: string): void;
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
 * The top of the playlist, as a music app shows one: its cover, its name, the date and how far today has got, and
 * Play beside Shuffle. Shuffle is a switch: on, ▶ and Next take the puzzles in a shuffled order (src/shuffle.ts).
 * While editing, the name can be changed.
 */
export function PlaylistHeader({ name, onRename, date, puzzles, done, started, editing, next, onPlay, shuffle, onShuffle }: Props) {
  const total = puzzles.length;
  return (
    <section className="hero" aria-label="Today's playlist">
      <Artwork puzzles={puzzles} />
      <div className="hero-text">
        {editing ? (
          <h1>
            <input
              className="name-field"
              value={name}
              onChange={(e) => onRename(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              maxLength={NAME_LENGTH}
              aria-label="Playlist name"
              autoComplete="off"
              enterKeyHint="done"
            />
          </h1>
        ) : (
          <h1>{name}</h1>
        )}
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
