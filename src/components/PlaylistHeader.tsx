import { longDate } from '../day';
import { ArrowIcon, GearIcon, StarIcon, TickIcon } from './icons';

/** How a puzzle stands today, for its answer cell. */
export type Cell = 'done' | 'skipped' | 'current' | 'todo';

interface Props {
  date: string;
  /** Each puzzle's cell, in order. */
  cells: Cell[];
  done: number;
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

/**
 * The top of the page, set out like a worksheet: a title, the date written in, a score box the teacher fills in
 * red (with a gold star when it's all done), a row of answer cells, one per puzzle, and the button to start.
 */
export function PlaylistHeader({ date, cells, done, started, editing, onEdit, onPlay, onSettings, children }: Props) {
  const total = cells.length;
  const allDone = total > 0 && !onPlay;
  return (
    <header className="hero">
      <div className="hero-inner">
        <div className="hero-top">
          <p className="kicker">Puzzle Playlist · Daily worksheet</p>
          <button type="button" className="icon-button gear" onClick={onSettings} aria-label="Settings">
            <GearIcon size={22} />
          </button>
        </div>
        <div className="hero-head">
          <div>
            <h1>Today's Puzzles</h1>
            <p className="date-line">
              Date: <span className="hand">{longDate(date)}</span>
            </p>
          </div>
          {total > 0 && (
            <div className="score" role="img" aria-label={`Score: ${done} of ${total} done`}>
              <span className="score-label">Score</span>
              <span className="score-value">
                {done}/{total}
              </span>
              {allDone && <StarIcon size={38} />}
            </div>
          )}
        </div>
        {total > 0 && (
          <ol className="cells" aria-hidden="true">
            {cells.map((c, i) => (
              <li key={i} className={`cell ${c}`}>
                {c === 'done' && <TickIcon size={18} />}
              </li>
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
