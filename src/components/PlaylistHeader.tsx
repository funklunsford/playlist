import { longDate } from '../day';
import { CheckIcon, GearIcon, PlayIcon } from './icons';

interface Props {
  date: string;
  total: number;
  done: number;
  editing: boolean;
  /** Absent while there's nothing to edit. */
  onEdit?: () => void;
  /** Plays the first unplayed puzzle; absent when there's none. */
  onPlay?: () => void;
  onSettings(): void;
  /** Extra buttons beside Edit. */
  children?: React.ReactNode;
}

/** The top of the page: today's date and progress over a wash of colour, like a playlist's cover, and its big ▶. */
export function PlaylistHeader({ date, total, done, editing, onEdit, onPlay, onSettings, children }: Props) {
  return (
    <header className="hero">
      <div className="hero-inner">
        <div className="hero-top">
          <p className="kicker">Puzzle Playlist</p>
          <button type="button" className="icon-button gear" onClick={onSettings} aria-label="Settings">
            <GearIcon size={22} />
          </button>
        </div>
        <h1>Today</h1>
        <p className="meta">
          {longDate(date)}
          {total > 0 && ` · ${done} of ${total} done`}
        </p>
        <div className="actions">
          {onEdit && (
            <button type="button" className={editing ? 'pill' : 'pill outline'} onClick={onEdit}>
              {editing ? 'Done' : 'Edit'}
            </button>
          )}
          {!editing && children}
          {total > 0 && !editing && (
            <button type="button" className="big-play" onClick={onPlay} disabled={!onPlay} aria-label={onPlay ? 'Play the next puzzle' : 'All done for today'}>
              {onPlay ? <PlayIcon size={28} /> : <CheckIcon size={28} />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
