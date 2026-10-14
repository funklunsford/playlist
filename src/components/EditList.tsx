import { useEffect, useRef, useState } from 'react';
import { publisherLabel, type Puzzle } from '../catalog';
import { pieceColor } from '../pieces';
import { GripIcon, MinusCircleIcon } from './icons';
import { Tile } from './Tile';

/** Every row is this tall while editing, so a drag knows where it is from how far it's gone. */
const ROW = 64;

interface Props {
  puzzles: readonly Puzzle[];
  onMove(from: number, to: number): void;
  onRemove(id: string): void;
}

/**
 * The playlist while editing, as a list edits on an iPhone: the red − at the left offers Delete, and the handle at the
 * right drags a row to a new place. With the keyboard, the handle moves its row with the up and down arrows.
 */
export function EditList({ puzzles, onMove, onRemove }: Props) {
  const [drag, setDrag] = useState<{ from: number; dy: number } | null>(null);
  // The row whose − was tapped, showing Delete.
  const [deleting, setDeleting] = useState<string | null>(null);
  // The row just moved with the keyboard, whose handle keeps the focus.
  const [moved, setMoved] = useState<string | null>(null);
  const list = useRef<HTMLOListElement>(null);
  const startY = useRef(0);
  const n = puzzles.length;

  // A row moved down is taken out and put back further on, which loses its focus: it's given back.
  useEffect(() => {
    if (!moved) return;
    list.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(moved)}"] .grip`)?.focus();
    setMoved(null);
  }, [moved]);

  const target = drag ? Math.max(0, Math.min(n - 1, drag.from + Math.round(drag.dy / ROW))) : -1;

  /** How far a row is pushed aside by the one being dragged. */
  const shift = (i: number) => {
    if (!drag || i === drag.from) return 0;
    if (drag.from < i && i <= target) return -ROW;
    if (target <= i && i < drag.from) return ROW;
    return 0;
  };

  const down = (i: number) => (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    startY.current = e.clientY;
    setDeleting(null);
    setDrag({ from: i, dy: 0 });
  };
  const moveTo = (e: React.PointerEvent) => drag && setDrag({ ...drag, dy: e.clientY - startY.current });
  const up = () => {
    if (drag && target !== drag.from) onMove(drag.from, target);
    setDrag(null);
  };
  const keys = (i: number, id: string) => (e: React.KeyboardEvent) => {
    const to = e.key === 'ArrowUp' ? i - 1 : e.key === 'ArrowDown' ? i + 1 : -1;
    if (to < 0 || to >= n) return;
    e.preventDefault();
    onMove(i, to);
    setMoved(id);
  };

  return (
    <ol className="rows editing" ref={list} style={{ height: n * ROW }}>
      {puzzles.map((p, i) => {
        const dragging = drag?.from === i;
        const confirming = deleting === p.id;
        return (
          <li
            key={p.id}
            data-id={p.id}
            className={`row edit-row${dragging ? ' dragging' : ''}${confirming ? ' confirming' : ''}`}
            style={{ transform: `translateY(${dragging ? drag.dy : shift(i)}px)`, top: i * ROW }}
          >
            <button
              type="button"
              className="delete-toggle"
              aria-label={`Delete ${p.name}`}
              aria-expanded={confirming}
              onClick={() => setDeleting(confirming ? null : p.id)}
            >
              <MinusCircleIcon size={22} />
            </button>
            <Tile puzzle={p} color={pieceColor(i)} size={44} />
            <span className="title">
              <span className="name">{p.name}</span>
              <span className="by">{publisherLabel(p)}</span>
            </span>
            {confirming ? (
              // Keyed apart from the handle, so it's a new button that takes the focus.
              <button key="delete" type="button" className="delete" onClick={() => onRemove(p.id)} autoFocus>
                Delete
              </button>
            ) : (
              <button
                key="grip"
                type="button"
                className="grip"
                aria-label={`Move ${p.name}: drag, or use the up and down arrow keys`}
                onPointerDown={down(i)}
                onPointerMove={moveTo}
                onPointerUp={up}
                onPointerCancel={() => setDrag(null)}
                onKeyDown={keys(i, p.id)}
              >
                <GripIcon size={22} />
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
}
