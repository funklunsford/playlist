import { BookmarkletSetup } from './BookmarkletSetup';
import { Sheet } from './Sheet';

interface Props {
  onClose(): void;
  onToast(text: string): void;
}

/** Settings, behind the gear: things set up once, kept off the playlist itself. */
export function SettingsSheet({ onClose, onToast }: Props) {
  return (
    <Sheet
      title="Settings"
      onClose={onClose}
      className="settings"
      trailing={
        <button type="button" className="nav-button strong" onClick={onClose} autoFocus>
          Done
        </button>
      }
    >
      <BookmarkletSetup onToast={onToast} />
    </Sheet>
  );
}
