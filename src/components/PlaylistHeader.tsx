import { useRef, useState } from 'react';
import type { Puzzle } from '../catalog';
import { longDate } from '../day';
import { NAME_LENGTH } from '../store';
import { Artwork } from './Artwork';
import { CheckIcon, PencilIcon, PlayIcon, ShuffleIcon } from './icons';

interface Props {
  /** The playlist's name. */
  name: string;
  /** Renames the playlist, as it's typed: while editing, or after the pencil beside the name. */
  onRename(name: string): void;
  /** Done renaming with the pencil: the name settles as it's kept. */
  onRenamed(): void;
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
 * The name can be changed while editing, or in place with the pencil beside it: Enter or a tap away keeps the new
 * name, and Escape puts back the old one.
 */
export function PlaylistHeader({ name, onRename, onRenamed, date, puzzles, done, started, editing, next, onPlay, shuffle, onShuffle }: Props) {
  const total = puzzles.length;
  // Renaming with the pencil, outside editing; and the name it started from, for Escape.
  const [renaming, setRenaming] = useState(false);
  const before = useRef(name);

  const startRenaming = () => {
    before.current = name;
    setRenaming(true);
  };
  const keys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && renaming) onRename(before.current);
    if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur();
  };
  const stopRenaming = () => {
    setRenaming(false);
    onRenamed();
  };

  return (
    <section className="hero" aria-label="Today's playlist">
      <Artwork puzzles={puzzles} />
      <div className="hero-text">
        {editing || renaming ? (
          <h1>
            <input
              className="name-field"
              value={name}
              onChange={(e) => onRename(e.target.value)}
              onKeyDown={keys}
              onBlur={renaming ? stopRenaming : undefined}
              onFocus={(e) => renaming && e.currentTarget.select()}
              autoFocus={renaming}
              maxLength={NAME_LENGTH}
              aria-label="Playlist name"
              autoComplete="off"
              enterKeyHint="done"
            />
          </h1>
        ) : (
          <h1>
            {name}
            <button type="button" className="icon-button rename" onClick={startRenaming} aria-label="Rename playlist">
              <PencilIcon size={20} />
            </button>
          </h1>
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
