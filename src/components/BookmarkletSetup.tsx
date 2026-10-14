import { useEffect, useMemo, useRef } from 'react';
import { bookmarklet } from '../bookmarklet';
import { CheckIcon } from './icons';

/**
 * Setting up the bookmarklet (src/bookmarklet.ts): drag it to the bookmarks bar, or add it by hand, on a computer
 * or an iPhone, and, on a Mac, give it a key. Its title is "Puzzle done", which the Mac shortcut names.
 */
export function BookmarkletSetup({ onToast }: { onToast(text: string): void }) {
  // The playlist's folder, even if this page was opened as …/index.html.
  const code = useMemo(() => bookmarklet(new URL('./', location.href).href), []);
  const link = useRef<HTMLAnchorElement>(null);

  // React won't put a javascript: address on a link, so it goes on by hand.
  useEffect(() => link.current?.setAttribute('href', code), [code]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      onToast('Copied');
    } catch {
      prompt('Copy this', code);
    }
  };

  return (
    <section className="setting" aria-labelledby="bookmarklet-title">
      <div className="group setting-intro">
        <span className="setting-icon" aria-hidden="true">
          <CheckIcon size={20} />
        </span>
        <div>
          <h3 id="bookmarklet-title">Check a Puzzle with One Click</h3>
          <p>
            An optional bookmark. On a finished puzzle, click it: it checks the puzzle's done, keeps your score, and brings you back here. Going Back works
            without it.
          </p>
        </div>
      </div>

      <h4 className="group-header">On a computer</h4>
      <ol className="group steps">
        <li>
          Show your bookmarks bar: <kbd>⌘</kbd>
          <kbd>⇧</kbd>
          <kbd>B</kbd> on a Mac, <kbd>Ctrl</kbd>
          <kbd>Shift</kbd>
          <kbd>B</kbd> elsewhere.
        </li>
        <li>
          Drag this onto it:{' '}
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
          </a>
        </li>
      </ol>
      <p className="group-footer">
        Or, without dragging:{' '}
        <button type="button" className="text-button" onClick={copy}>
          copy the code
        </button>
        , open the Bookmark Manager (<kbd>⌥</kbd>
        <kbd>⌘</kbd>
        <kbd>B</kbd>), choose ⋮ → Add new bookmark, name it "Puzzle done" and paste the code as its URL.
      </p>

      <h4 className="group-header">A key for it (Mac, optional)</h4>
      <div className="group">
        <p className="cell">
          In System Settings → Keyboard → Keyboard Shortcuts → App Shortcuts, press +, choose Google Chrome, type the menu title <code>Puzzle done</code>, and
          pick a key such as <kbd>⌃</kbd>
          <kbd>⌘</kbd>
          <kbd>D</kbd>. Chrome lists your bookmarks in its Bookmarks menu, so the key presses it there.
        </p>
      </div>

      <h4 className="group-header">On iPhone</h4>
      <ol className="group steps">
        <li>
          <button type="button" className="text-button" onClick={copy}>
            Copy the code
          </button>
          .
        </li>
        <li>In Safari, bookmark any page, then edit the bookmark: name it "Puzzle done" and paste the code as its address.</li>
        <li>On a finished puzzle, type "Puzzle done" in the address bar and tap it.</li>
      </ol>
    </section>
  );
}
