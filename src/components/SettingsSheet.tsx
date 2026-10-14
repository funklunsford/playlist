import { useEffect, useId } from 'react';
import { BookmarkletSetup } from './BookmarkletSetup';
import { CloseIcon } from './icons';

interface Props {
  onClose(): void;
  onToast(text: string): void;
}

/** Settings, behind the header's gear: things set up once, kept off the playlist itself. */
export function SettingsSheet({ onClose, onToast }: Props) {
  const titleId = useId();

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <div className="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet settings" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="sheet-head">
          <h2 id={titleId}>Settings</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close settings" autoFocus>
            <CloseIcon />
          </button>
        </header>
        <BookmarkletSetup onToast={onToast} />
      </div>
    </div>
  );
}
