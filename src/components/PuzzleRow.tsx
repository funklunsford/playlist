import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { publisherLabel, type Puzzle } from '../catalog';
import type { Mark, Status } from '../player';
import { CheckCircleIcon, CheckIcon, MoreIcon, PlayIcon, SkipIcon, UndoIcon } from './icons';
import { Tile } from './Tile';

interface Props {
  puzzle: Puzzle;
  mark?: Mark;
  /** Its colour on the list (src/pieces.ts). */
  color: string;
  /** The one ▶ and Next play. */
  current: boolean;
  onPlay(): void;
  menuOpen: boolean;
  onMenu(open: boolean): void;
  onMark(status: Status): void;
}

/** What a puzzle's ⋯ menu offers, from how it's marked today. */
const choices = (status: Status | undefined): [Status, string, React.ReactNode][] =>
  status === 'done'
    ? [['todo', 'Not Yet', <UndoIcon />]]
    : status === 'skipped'
      ? [
          ['todo', "Don't Skip", <UndoIcon />],
          ['done', 'Mark as Done', <CheckIcon />],
        ]
      : [
          ['done', 'Mark as Done', <CheckIcon />],
          ['skipped', 'Skip Today', <SkipIcon />],
        ];

/**
 * A puzzle on today's list, as a song in a playlist: its artwork, name and publisher. Tap it to play. A done one has
 * a green tick and its grade, the next one a ▶ on its artwork, and a skipped one is greyed. Its ⋯ menu marks it by hand.
 */
export function PuzzleRow({ puzzle, mark, color, current, onPlay, menuOpen, onMenu, onMark }: Props) {
  const status = mark?.status;
  const menuRef = useRef<HTMLDivElement>(null);
  // Near the bottom of the window, where the mini player floats, the menu opens upward.
  const [up, setUp] = useState(false);

  useLayoutEffect(() => {
    if (menuOpen) setUp(innerHeight - (menuRef.current?.getBoundingClientRect().bottom ?? 0) < 220);
  }, [menuOpen]);

  // The menu closes on a tap anywhere else, or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const away = (e: PointerEvent) => !menuRef.current?.contains(e.target as Node) && onMenu(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onMenu(false);
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [menuOpen, onMenu]);

  const state = status === 'done' ? 'done' : status === 'skipped' ? 'skipped' : current ? 'current' : '';
  return (
    <li className={`row ${state}`} style={menuOpen ? { zIndex: 2 } : undefined}>
      <button
        type="button"
        className="row-main"
        onClick={onPlay}
        aria-label={`Play ${puzzle.name}${status === 'done' ? ' again' : state === 'current' ? ', up next' : ''}`}
      >
        <span className="row-art">
          <Tile puzzle={puzzle} color={color} />
          {state === 'current' && (
            <span className="now">
              <PlayIcon size={20} />
            </span>
          )}
        </span>
        <span className="title">
          <span className="name">{puzzle.name}</span>
          <span className="by">
            {status === 'skipped' ? 'Skipped today' : publisherLabel(puzzle)}
            {puzzle.note && status !== 'skipped' && status !== 'done' && ` · ${puzzle.note}`}
          </span>
        </span>
        {status === 'done' && (
          <span className="done-mark">
            {mark?.score && <span className="score">{mark.score}</span>}
            <CheckCircleIcon size={22} />
          </span>
        )}
      </button>
      <div className="row-menu" ref={menuRef}>
        <button type="button" className="icon-button more" aria-label={`More for ${puzzle.name}`} aria-expanded={menuOpen} onClick={() => onMenu(!menuOpen)}>
          <MoreIcon />
        </button>
        {menuOpen && (
          <div className={up ? 'menu up' : 'menu'} role="menu">
            {choices(status).map(([to, label, icon]) => (
              <button
                type="button"
                role="menuitem"
                key={label}
                onClick={() => {
                  onMark(to);
                  onMenu(false);
                }}
              >
                {label}
                {icon}
              </button>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
