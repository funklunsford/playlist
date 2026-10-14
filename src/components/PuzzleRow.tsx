import { useEffect, useRef } from 'react';
import { publisherLabel, type Puzzle } from '../catalog';
import type { Mark, Status } from '../player';
import { MoreIcon, TickIcon } from './icons';
import { Tile } from './Tile';

interface Props {
  n: number;
  puzzle: Puzzle;
  mark?: Mark;
  /** The one Start or Next plays. */
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

/**
 * A puzzle on today's list, like a question on a worksheet: tap it to play it. A done one gets a red tick and
 * its grade, the next one is highlighted, and a skipped one is struck through. Its ⋯ menu marks it by hand.
 */
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
        <Tile puzzle={puzzle} n={n} />
        <span className="title">
          <span className="name">
            <span className="ink">{puzzle.name}</span>
          </span>
          <span className="by">
            {status === 'skipped' ? 'Skipped today' : publisherLabel(puzzle)}
            {puzzle.note && status !== 'skipped' && status !== 'done' && ` · ${puzzle.note}`}
          </span>
        </span>
        <span className="mark" aria-hidden="true">
          {status === 'done' && (
            <>
              <TickIcon size={26} />
              {mark?.score && <span className="grade">{mark.score}</span>}
            </>
          )}
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
