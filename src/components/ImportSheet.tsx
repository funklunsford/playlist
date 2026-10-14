import { publisherLabel } from '../catalog';
import { fromShared, type Shared } from '../link';
import { pieceColor } from '../pieces';
import { puzzlesOf, type Playlist } from '../playlist';
import { Artwork } from './Artwork';
import { Sheet } from './Sheet';
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
  const puzzles = puzzlesOf(fromShared(shared));
  const have = new Set(puzzlesOf(mine).map((p) => p.url));
  const fresh = puzzles.filter((p) => !have.has(p.url)).length;

  const title = !fresh
    ? 'You have all of these'
    : `Add ${fresh === puzzles.length ? 'these' : fresh} ${fresh === 1 ? 'puzzle' : 'puzzles'}?`;

  return (
    <Sheet
      title="Shared Playlist"
      onClose={onCancel}
      leading={
        fresh > 0 && (
          <button type="button" className="nav-button" onClick={onCancel}>
            Cancel
          </button>
        )
      }
    >
      <div className="sheet-intro">
        <Artwork puzzles={puzzles} />
        <h3>{title}</h3>
        <p className="sheet-sub">From a playlist someone sent you.</p>
      </div>
      <ul className="group sheet-list">
        {puzzles.map((p, i) => (
          <li key={p.id}>
            <Tile puzzle={p} color={pieceColor(i)} size={36} />
            <span className="title">
              <span className="name">{p.name}</span>
              <span className="by">{have.has(p.url) ? 'Already in yours' : publisherLabel(p)}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="sheet-actions">
        {fresh > 0 ? (
          <button type="button" className="button filled large" onClick={onAdd} autoFocus>
            Add
          </button>
        ) : (
          <button type="button" className="button filled large" onClick={onCancel} autoFocus>
            OK
          </button>
        )}
        {mine.ids.length > 0 && (
          <button type="button" className="button gray large" onClick={onReplace}>
            Replace Mine
          </button>
        )}
      </div>
    </Sheet>
  );
}
