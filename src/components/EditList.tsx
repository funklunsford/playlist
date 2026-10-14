import { useRef, useState } from 'react';
import { publisherLabel, type Puzzle } from '../catalog';
import { pieceColor } from '../pieces';
import { CloseIcon, DownIcon, GripIcon, UpIcon } from './icons';
import { Tile } from './Tile';

/** Every row is this tall while editing, so a drag knows where it is from how far it's gone. */
const ROW = 64;

interface Props {
  puzzles: readonly Puzzle[];
  onMove(from: number, to: number): void;
  onRemove(id: string): void;
}

/** The playlist while editing: drag a row by its handle, or use the arrows, to reorder; × removes. */
export function EditList({ puzzles, onMove, onRemove }: Props) {
  const [drag, setDrag] = useState<{ from: number; dy: number } | null>(null);
  const startY = useRef(0);
  const n = puzzles.length;
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
    setDrag({ from: i, dy: 0 });
  };
  const moveTo = (e: React.PointerEvent) => drag && setDrag({ ...drag, dy: e.clientY - startY.current });
  const up = () => {
    if (drag && target !== drag.from) onMove(drag.from, target);
    setDrag(null);
  };

  return (
    <ol className="rows editing" style={{ height: n * ROW }}>
      {puzzles.map((p, i) => {
        const dragging = drag?.from === i;
        return (
          <li
            key={p.id}
            className={dragging ? 'row edit-row dragging' : 'row edit-row'}
            style={{ transform: `translateY(${dragging ? drag.dy : shift(i)}px)`, top: i * ROW }}
          >
            <button
              type="button"
              className="grip"
              aria-label={`Drag to move ${p.name}`}
              onPointerDown={down(i)}
              onPointerMove={moveTo}
              onPointerUp={up}
              onPointerCancel={() => setDrag(null)}
            >
              <GripIcon />
            </button>
            <Tile puzzle={p} color={pieceColor(i)} />
            <span className="title">
              <span className="name">{p.name}</span>
              <span className="by">{publisherLabel(p)}</span>
            </span>
            <span className="edit-actions">
              <button type="button" className="icon-button" disabled={i === 0} onClick={() => onMove(i, i - 1)} aria-label={`Move ${p.name} up`}>
                <UpIcon />
              </button>
              <button type="button" className="icon-button" disabled={i === n - 1} onClick={() => onMove(i, i + 1)} aria-label={`Move ${p.name} down`}>
                <DownIcon />
              </button>
              <button type="button" className="icon-button remove" onClick={() => onRemove(p.id)} aria-label={`Remove ${p.name}`}>
                <CloseIcon />
              </button>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
