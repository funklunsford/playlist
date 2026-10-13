import { useEffect, useState } from 'react';
import { catalogPuzzle } from './catalog';
import { localDate } from './day';
import { parseDoneKey, readSignals } from './firstParty';
import { applySignals, arrive, barFor, mark, nextUp, type Arrival, type Back, type Day, type Status } from './player';
import { add, addLink, move, puzzlesOf, remove, type Playlist } from './playlist';
import { browserStorage, ITEMS_KEY, loadDay, loadLaunch, loadPlaylist, prune, saveDay, saveLaunch, savePlaylist } from './store';
import { EditList } from './components/EditList';
import { PlayerBar } from './components/PlayerBar';
import { PlaylistHeader } from './components/PlaylistHeader';
import { PuzzleRow } from './components/PuzzleRow';
import { SearchBox } from './components/SearchBox';

// One storage for the page, with days older than 90 tidied away as it opens.
const kv = browserStorage();
prune(kv, localDate());

/** Your own games, which say for themselves when they're done (src/firstParty.ts). */
const reportsDone = (id: string) => !!catalogPuzzle(id)?.firstParty;

/** How this page came to be showing: by Back or Forward, or opened afresh (or reloaded). */
function arrivalNow(): Arrival {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  return nav?.type === 'back_forward' ? 'back' : 'fresh';
}

interface Today {
  date: string;
  day: Day;
  /** The puzzle you've just come back from, if you came back by Back. */
  back: Back | null;
}

/** Arriving on the page: acts on the saved launch (once), and saves what that changes. */
function settle(ids: readonly string[], arrival: Arrival): Today {
  const date = localDate();
  const r = arrive({
    today: date,
    now: Date.now(),
    arrival,
    launch: loadLaunch(kv),
    day: loadDay(kv, date),
    signals: readSignals(kv, ids.filter(reportsDone), date),
    reportsDone,
  });
  if (r.changed) {
    saveDay(kv, date, r.day);
    saveLaunch(kv, r.launch);
  }
  return { date, day: r.day, back: r.back };
}

/** Today's marks read again, with any new signals from your games: for when the page is shown again. */
function reread(ids: readonly string[], was: Today): Today {
  const date = localDate();
  const stored = loadDay(kv, date);
  const day = applySignals(stored, readSignals(kv, ids.filter(reportsDone), date));
  if (day !== stored) saveDay(kv, date, day);
  return { date, day, back: date === was.date ? was.back : null };
}

// The page's first arrival, worked out once: in development, React renders a component's first time twice.
let opening: Today | undefined;

export function App() {
  const [list, setList] = useState(() => loadPlaylist(kv));
  const [today, setToday] = useState(() => (opening ??= settle(list.ids, arrivalNow())));
  const [editing, setEditing] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const puzzles = puzzlesOf(list);
  const ids = puzzles.map((p) => p.id);

  const update = (next: Playlist) => {
    setList(next);
    savePlaylist(kv, next);
  };

  useEffect(() => {
    // Back to this page from the browser's back/forward cache, as it was left: the launch is still to act on.
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      const l = loadPlaylist(kv);
      setList(l);
      setToday(settle(l.ids, 'back'));
    };
    // Shown again after another tab or app: maybe a new day, or one of your games finished meanwhile.
    const onVisible = () => document.visibilityState === 'visible' && setToday((t) => reread(loadPlaylist(kv).ids, t));
    // Another tab changed the playlist, today's marks, or one of your games said it was done.
    const onStorage = (e: StorageEvent) => {
      if (e.key === ITEMS_KEY) setList(loadPlaylist(kv));
      else if (e.key === null || e.key.startsWith('playlist:day:') || parseDoneKey(e.key)) setToday((t) => reread(loadPlaylist(kv).ids, t));
    };
    addEventListener('pageshow', onShow);
    document.addEventListener('visibilitychange', onVisible);
    addEventListener('storage', onStorage);
    return () => {
      removeEventListener('pageshow', onShow);
      document.removeEventListener('visibilitychange', onVisible);
      removeEventListener('storage', onStorage);
    };
  }, []);

  // Editing ends when there's nothing left to edit.
  useEffect(() => {
    if (!puzzles.length) setEditing(false);
  }, [puzzles.length]);

  /** Takes this tab to a puzzle. Only ever called from a tap, so Back can return here (see DESIGN.md). */
  const play = (id: string) => {
    const p = puzzles.find((q) => q.id === id);
    if (!p) return;
    saveLaunch(kv, { id, date: localDate(), at: Date.now(), handled: false });
    location.assign(p.url);
  };

  const setMark = (id: string, status: Status) => {
    const day = mark(today.day, id, status, Date.now());
    saveDay(kv, today.date, day);
    setToday({ ...today, day });
  };

  const bar = barFor(ids, today.day, today.back);
  const current = bar.kind === 'back' || bar.kind === 'ready' ? bar.next : null;
  const first = nextUp(ids, today.day);
  const done = ids.filter((id) => today.day[id]?.status === 'done').length;

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
      <PlaylistHeader
        date={today.date}
        total={puzzles.length}
        done={done}
        editing={editing}
        onEdit={puzzles.length ? () => setEditing(!editing) : undefined}
        onPlay={first ? () => play(first) : undefined}
      />
      <main className={puzzles.length && !editing ? 'page with-player' : 'page'}>
        {!puzzles.length ? (
          finder(true)
        ) : editing ? (
          <EditList puzzles={puzzles} onMove={(from, to) => update(move(list, from, to))} onRemove={(id) => update(remove(list, id))} />
        ) : (
          <>
            <ol className="rows">
              {puzzles.map((p, i) => (
                <PuzzleRow
                  key={p.id}
                  n={i + 1}
                  puzzle={p}
                  mark={today.day[p.id]}
                  current={p.id === current}
                  onPlay={() => play(p.id)}
                  menuOpen={menu === p.id}
                  onMenu={(open) => setMenu(open ? p.id : null)}
                  onMark={(status) => setMark(p.id, status)}
                />
              ))}
            </ol>
            {finder(false)}
          </>
        )}
      </main>
      {!editing && (
        <PlayerBar
          bar={bar}
          puzzle={(id) => puzzles.find((p) => p.id === id)}
          done={done}
          total={puzzles.length}
          onPlay={play}
          onMark={(id, isDone) => setMark(id, isDone ? 'done' : 'todo')}
        />
      )}
    </div>
  );
}
