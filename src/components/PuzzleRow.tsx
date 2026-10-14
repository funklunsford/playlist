import { useEffect, useRef } from 'react';
import { publisherLabel, type Puzzle } from '../catalog';
import type { Mark, Status } from '../player';
import { MoreIcon, TickIcon } from './icons';
import { Tile } from './Tile';

interface Props {
  puzzle: Puzzle;
  mark?: Mark;
  /** Its piece's colour (src/pieces.ts). */
  color: string;
  /** Where its knob reaches into the next piece, across the piece; none for the last. */
  knob?: string;
  /** Above the piece after it, so its knob shows over that piece. */
  z: number;
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
 * A puzzle on today's list: a jigsaw piece of its own colour, its knob reaching into the next. Tap it to play.
 * A done one gets a ticked sticker with its grade; the next one is outlined, ready to place; a skipped one fades.
 * Its ⋯ menu marks it by hand.
 */
export function PuzzleRow({ puzzle, mark, color, knob, z, current, onPlay, menuOpen, onMenu, onMark }: Props) {
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
    <li className={`row playable piece ${state}`} style={{ '--piece': color, zIndex: menuOpen ? 100 : z } as React.CSSProperties}>
      <button type="button" className="row-main" onClick={onPlay} aria-label={`Play ${puzzle.name}${status === 'done' ? ' again' : ''}`}>
        <Tile puzzle={puzzle} />
        <span className="title">
          <span className="name">{puzzle.name}</span>
          <span className="by">
            {status === 'skipped' ? 'Skipped today' : publisherLabel(puzzle)}
            {puzzle.note && status !== 'skipped' && status !== 'done' && ` · ${puzzle.note}`}
          </span>
        </span>
        <span className="mark" aria-hidden="true">
          {status === 'done' && (
            <span className="sticker">
              <TickIcon size={18} />
              {mark?.score ?? 'Done'}
            </span>
          )}
          {state === 'current' && <span className="up-next">Up next</span>}
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
      {knob && <span className="knob" style={{ left: knob }} aria-hidden="true" />}
    </li>
  );
}
