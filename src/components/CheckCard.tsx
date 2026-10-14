import { useEffect, useMemo, useRef } from 'react';
import { bookmarklet } from '../bookmarklet';
import { CheckIcon } from './icons';

/** Where to get the bookmarklet: drag it to the bookmarks bar on a computer, or copy it into a Safari bookmark. */
export function CheckCard({ onToast }: { onToast(text: string): void }) {
  const code = useMemo(() => bookmarklet(location.origin + location.pathname), []);
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
    <section className="check-card" aria-labelledby="check-card-title">
      <h2 id="check-card-title">Check a puzzle with one click</h2>
      <p>
        Drag this to your bookmarks bar. On a finished puzzle, click it: it checks that the puzzle's done, keeps your score, and brings you back
        here.
      </p>
      <a
        ref={link}
        className="bookmarklet"
        draggable
        onClick={(e) => {
          e.preventDefault();
          onToast('Drag it to your bookmarks bar');
        }}
      >
        <CheckIcon size={16} /> Puzzle done
      </a>
      <details>
        <summary>On iPhone</summary>
        <ol>
          <li>Copy the bookmark's code.</li>
          <li>In Safari, bookmark any page, then edit the bookmark: name it "Puzzle done" and paste the code as its address.</li>
          <li>On a finished puzzle, open Bookmarks and tap it.</li>
        </ol>
        <button type="button" className="pill outline" onClick={copy}>
          Copy the code
        </button>
      </details>
    </section>
  );
}
