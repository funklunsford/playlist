import { useEffect, useMemo, useState } from 'react';
import { localDate } from './day';
import { add, addLink, move, puzzlesOf, remove, type Playlist } from './playlist';
import { browserStorage, ITEMS_KEY, loadPlaylist, savePlaylist } from './store';
import { EditList } from './components/EditList';
import { PlaylistHeader } from './components/PlaylistHeader';
import { PuzzleRow } from './components/PuzzleRow';
import { SearchBox } from './components/SearchBox';

export function App() {
  const kv = useMemo(browserStorage, []);
  const [list, setList] = useState(() => loadPlaylist(kv));
  const [editing, setEditing] = useState(false);
  const puzzles = puzzlesOf(list);

  const update = (next: Playlist) => {
    setList(next);
    savePlaylist(kv, next);
  };

  // The playlist changed in another tab.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => e.key === ITEMS_KEY && setList(loadPlaylist(kv));
    addEventListener('storage', onStorage);
    return () => removeEventListener('storage', onStorage);
  }, [kv]);

  // Editing ends when there's nothing left to edit.
  useEffect(() => {
    if (!puzzles.length) setEditing(false);
  }, [puzzles.length]);

  const finder = (prominent: boolean) => (
    <SearchBox
      prominent={prominent}
      added={list.ids}
      onAdd={(id) => update(add(list, id))}
      onAddLink={(name, url) => {
        const added = addLink(list, name, url);
        if (added) update(added.list);
        return !!added;
      }}
    />
  );

  return (
    <div className="app">
      <PlaylistHeader date={localDate()} count={puzzles.length} editing={editing} onEdit={puzzles.length ? () => setEditing(!editing) : undefined} />
      <main className="page">
        {!puzzles.length ? (
          finder(true)
        ) : editing ? (
          <EditList puzzles={puzzles} onMove={(from, to) => update(move(list, from, to))} onRemove={(id) => update(remove(list, id))} />
        ) : (
          <>
            <ol className="rows">
              {puzzles.map((p, i) => (
                <PuzzleRow key={p.id} n={i + 1} puzzle={p} />
              ))}
            </ol>
            {finder(false)}
          </>
        )}
      </main>
    </div>
  );
}
