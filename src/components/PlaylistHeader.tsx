import { longDate } from '../day';
import { ArrowIcon, GearIcon } from './icons';

/** How a puzzle stands today, for its progress dot. */
export type Cell = 'done' | 'skipped' | 'current' | 'todo';

interface Props {
  date: string;
  /** Each puzzle's colour and how it stands, in list order. */
  pieces: { color: string; cell: Cell }[];
  /** Something's been played or skipped today, so the button continues rather than starts. */
  started: boolean;
  editing: boolean;
  /** Absent while there's nothing to edit. */
  onEdit?: () => void;
  /** Plays the first unplayed puzzle; absent when there's none. */
  onPlay?: () => void;
  onSettings(): void;
  /** Extra buttons beside Edit. */
  children?: React.ReactNode;
}

/** The top of the page: today's title and date, a dot per puzzle filled in as it's done, and the button to start. */
export function PlaylistHeader({ date, pieces, started, editing, onEdit, onPlay, onSettings, children }: Props) {
  const total = pieces.length;
  const done = pieces.filter((p) => p.cell === 'done').length;
  return (
    <header className="hero">
      <div className="hero-inner">
        <div className="hero-top">
          <p className="kicker">Puzzle Playlist</p>
          <button type="button" className="icon-button gear" onClick={onSettings} aria-label="Settings">
            <GearIcon size={22} />
          </button>
        </div>
        <h1>Today's Puzzles</h1>
        <p className="meta">
          {longDate(date)}
          {total > 0 && ` · ${done === total ? 'all done' : `${done} of ${total} done`}`}
        </p>
        {total > 0 && (
          <ol className="dots" aria-hidden="true">
            {pieces.map((p, i) => (
              <li key={i} className={`dot ${p.cell}`} style={{ '--piece': p.color } as React.CSSProperties} />
            ))}
          </ol>
        )}
        <div className="actions">
          {onEdit && (
            <button type="button" className={editing ? 'pill' : 'pill outline'} onClick={onEdit}>
              {editing ? 'Done' : 'Edit'}
            </button>
          )}
          {!editing && children}
          {total > 0 && !editing && (
            <button type="button" className="start" onClick={onPlay} disabled={!onPlay} aria-label={onPlay ? 'Play the next puzzle' : 'All done for today'}>
              {onPlay ? (
                <>
                  {started ? 'Continue' : 'Start'} <ArrowIcon size={20} />
                </>
              ) : (
                'All done'
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
