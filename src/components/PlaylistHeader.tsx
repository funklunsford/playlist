import { longDate } from '../day';

interface Props {
  date: string;
  count: number;
  editing: boolean;
  /** Absent while there's nothing to edit. */
  onEdit?: () => void;
}

/** The top of the page: today's date and how many puzzles, over a wash of colour, like a playlist's cover. */
export function PlaylistHeader({ date, count, editing, onEdit }: Props) {
  return (
    <header className="hero">
      <div className="hero-inner">
        <p className="kicker">Puzzle Playlist</p>
        <h1>Today</h1>
        <p className="meta">
          {longDate(date)}
          {count > 0 && ` · ${count} ${count === 1 ? 'puzzle' : 'puzzles'}`}
        </p>
        <div className="actions">
          {onEdit && (
            <button type="button" className={editing ? 'pill' : 'pill outline'} onClick={onEdit}>
              {editing ? 'Done' : 'Edit'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
