import { useEffect, useId } from 'react';
import { publisherLabel } from '../catalog';
import { fromShared, type Shared } from '../link';
import { puzzlesOf, type Playlist } from '../playlist';
import { Tile } from './Tile';

interface Props {
  shared: Shared;
  mine: Playlist;
  onAdd(): void;
  onReplace(): void;
  onCancel(): void;
}

/** Opening a playlist link: add its puzzles to yours, or replace yours with them. */
export function ImportSheet({ shared, mine, onAdd, onReplace, onCancel }: Props) {
  const titleId = useId();
  const puzzles = puzzlesOf(fromShared(shared));
  const have = new Set(puzzlesOf(mine).map((p) => p.url));
  const fresh = puzzles.filter((p) => !have.has(p.url)).length;

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onCancel]);

  const title = !fresh
    ? 'You have all of these'
    : `Add ${fresh === puzzles.length ? 'these' : fresh} ${fresh === 1 ? 'puzzle' : 'puzzles'}?`;

  return (
    <div className="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <h2 id={titleId}>{title}</h2>
        <p className="sheet-sub">From a playlist someone sent you.</p>
        <ul className="sheet-list">
          {puzzles.map((p) => (
            <li key={p.id}>
              <Tile puzzle={p} size={32} />
              <span className="title">
                <span className="name">{p.name}</span>
                <span className="by">{have.has(p.url) ? 'Already in yours' : publisherLabel(p)}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="sheet-actions">
          <button type="button" className="text-button" onClick={onCancel}>
            {fresh ? 'Cancel' : 'OK'}
          </button>
          {mine.ids.length > 0 && (
            <button type="button" className="pill outline" onClick={onReplace}>
              Replace mine
            </button>
          )}
          {fresh > 0 && (
            <button type="button" className="pill" onClick={onAdd} autoFocus>
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
