import { useEffect, useRef } from 'react';
import { publisherLabel, type Puzzle } from '../catalog';
import type { Mark, Status } from '../player';
import { CheckIcon, MoreIcon, PlayIcon } from './icons';
import { Tile } from './Tile';

interface Props {
  n: number;
  puzzle: Puzzle;
  mark?: Mark;
  /** The one ▶ plays next. */
  current: boolean;
  onPlay(): void;
  menuOpen: boolean;
  onMenu(open: boolean): void;
  onMark(status: Status): void;
}

/** What a puzzle's ⋯ menu offers, from how it's marked today. */
const choices = (status: Status | undefined): [Status, string][] =>
  status === 'done'
    ? [['todo', 'Not yet']]
    : status === 'skipped'
      ? [['todo', "Don't skip"], ['done', 'Mark done']]
      : [['done', 'Mark done'], ['skipped', 'Skip today']];

/** A puzzle in the playlist, like a track: tap it to play it. Its ⋯ menu marks it by hand. */
export function PuzzleRow({ n, puzzle, mark, current, onPlay, menuOpen, onMenu, onMark }: Props) {
  const status = mark?.status;
  const menuRef = useRef<HTMLDivElement>(null);

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
    <li className={`row playable ${state}`}>
      <button type="button" className="row-main" onClick={onPlay} aria-label={`Play ${puzzle.name}${status === 'done' ? ' again' : ''}`}>
        <span className="n" aria-hidden="true">
          {status === 'done' ? <CheckIcon size={18} /> : current ? <PlayIcon size={14} /> : status === 'skipped' ? '–' : n}
        </span>
        <Tile puzzle={puzzle} />
        <span className="title">
          <span className="name">{puzzle.name}</span>
          <span className="by">
            {status === 'skipped' ? 'Skipped today' : publisherLabel(puzzle)}
            {puzzle.note && status !== 'skipped' && ` · ${puzzle.note}`}
          </span>
        </span>
      </button>
      <div className="row-menu" ref={menuRef}>
        <button type="button" className="icon-button" aria-label={`More for ${puzzle.name}`} aria-expanded={menuOpen} onClick={() => onMenu(!menuOpen)}>
          <MoreIcon />
        </button>
        {menuOpen && (
          <div className="menu" role="menu">
            {choices(status).map(([to, label]) => (
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
              </button>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
