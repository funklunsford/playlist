import { useCallback, useMemo } from 'react';
import { bookmarklet } from '../bookmarklet';
import { CheckIcon } from './icons';

/**
 * Setting up the bookmarklet (src/bookmarklet.ts), on a computer: drag it to the bookmarks bar. Its title is
 * "Puzzle done", the name it's saved under.
 */
export function BookmarkletSetup({ onToast }: { onToast(text: string): void }) {
  // The playlist's folder, even if this page was opened as …/index.html.
  const code = useMemo(() => bookmarklet(new URL('./', location.href).href), []);
  // React won't put a javascript: address on a link, so it goes on by hand, as the link appears.
  const link = useCallback((a: HTMLAnchorElement | null) => void a?.setAttribute('href', code), [code]);

  return (
    <p className="cell bookmarklet-setup">
      Drag{' '}
      <a
        ref={link}
        className="bookmarklet"
        draggable
        onClick={(e) => {
          e.preventDefault();
          onToast('Drag it to your bookmarks bar');
        }}
      >
        <CheckIcon size={16} />
        Puzzle done
      </a>{' '}
      to your bookmarks bar (<kbd>⌘</kbd>
      <kbd>⇧</kbd>
      <kbd>B</kbd> shows it).
    </p>
  );
}
