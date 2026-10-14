import { GearIcon, ShareIcon } from './icons';

interface Props {
  /** The page's title, shown in the bar once the big one has scrolled under it. */
  title: string;
  editing: boolean;
  /** Absent while there's nothing to edit. */
  onEdit?: () => void;
  /** Absent while there's nothing to share. */
  onShare?: () => void;
  onSettings(): void;
}

/** The bar along the top, translucent as content scrolls under it: Settings, then Share and Edit (Done while editing). */
export function NavBar({ title, editing, onEdit, onShare, onSettings }: Props) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="nav-side">
          <button type="button" className="icon-button" onClick={onSettings} aria-label="Settings">
            <GearIcon size={22} />
          </button>
        </div>
        <p className="nav-title" aria-hidden="true">
          {title}
        </p>
        <div className="nav-side end">
          {onShare && !editing && (
            <button type="button" className="icon-button" onClick={onShare} aria-label="Share playlist">
              <ShareIcon size={22} />
            </button>
          )}
          {onEdit && (
            <button type="button" className={editing ? 'nav-button strong' : 'nav-button'} onClick={onEdit}>
              {editing ? 'Done' : 'Edit'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
