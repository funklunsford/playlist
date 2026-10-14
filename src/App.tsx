import { useEffect, useState } from 'react';
import { catalogPuzzle } from './catalog';
import { localDate } from './day';
import { readDone, resolveDone, type Done } from './done';
import { parseDoneKey, readSignals } from './firstParty';
import { applySignals, arrive, barFor, mark, nextUp, unplayed, type Arrival, type Back, type Day, type Status } from './player';
import { fromShared, playlistLink, readLink, withShared, type Shared } from './link';
import { pieceColor } from './pieces';
import { add, addLink, move, puzzlesOf, remove, type Playlist } from './playlist';
import { newSeed, playOrder } from './shuffle';
import {
  browserStorage,
  ITEMS_KEY,
  loadDay,
  loadLaunch,
  loadPlaylist,
  loadShuffle,
  prune,
  saveDay,
  saveLaunch,
  savePlaylist,
  saveShuffle,
  SHUFFLE_KEY,
} from './store';
import { EditList } from './components/EditList';
import { ImportSheet } from './components/ImportSheet';
import { NavBar } from './components/NavBar';
import { PlayerBar } from './components/PlayerBar';
import { PlaylistHeader } from './components/PlaylistHeader';
import { PuzzleRow } from './components/PuzzleRow';
import { SettingsSheet } from './components/SettingsSheet';
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

/**
 * Back from the bookmarklet's check (#done=…): ticks the puzzle it checked, with its score. The check answers for
 * the puzzle ▶ last opened, so that launch is marked handled rather than ticked again for coming back.
 * `missing` when the puzzle isn't one of the playlist's.
 */
function checked(list: Playlist, done: Done): { today: Today; missing: boolean } {
  const date = localDate();
  const launch = loadLaunch(kv);
  const current = launch && launch.date === date && !launch.handled ? launch : null;
  if (current) saveLaunch(kv, { ...current, handled: true });
  const was = reread(list.ids, { date, day: {}, back: null });
  const id = resolveDone(done, puzzlesOf(list), current?.id);
  if (!id) return { today: was, missing: true };
  const day: Day = { ...was.day, [id]: { status: 'done', at: Date.now(), ...(done.score && { score: done.score }), ...(done.text && { share: done.text }) } };
  saveDay(kv, date, day);
  return { today: { date, day, back: { id, ticked: true } }, missing: false };
}

const NOT_IN_PLAYLIST = "That puzzle isn't in your playlist";

const TITLE = "Today's Puzzles";

/** How the page opens: back from a check, or by Back, or afresh. */
function open(list: Playlist): { today: Today; toast: string | null } {
  const done = readDone(location.hash);
  if (!done) return { today: settle(list.ids, arrivalNow()), toast: null };
  const r = checked(list, done);
  return { today: r.today, toast: r.missing ? NOT_IN_PLAYLIST : null };
}

// The page's first arrival, worked out once: in development, React renders a component's first time twice.
let opening: ReturnType<typeof open> | undefined;

/** Takes a handled #done=… or #add=… out of the address, so a reload doesn't repeat it. */
const clearHash = () => history.replaceState(history.state, '', location.pathname + location.search);

export function App() {
  const [list, setList] = useState(() => loadPlaylist(kv));
  const [today, setToday] = useState(() => (opening ??= open(list)).today);
  const [editing, setEditing] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  // A playlist link this page was opened with (#add=…), waiting for Add or Replace mine.
  const [incoming, setIncoming] = useState<Shared | null>(() => readLink(location.hash));
  const [toast, setToast] = useState<string | null>(() => opening?.toast ?? null);
  const [settings, setSettings] = useState(false);
  const [shuffle, setShuffle] = useState(() => loadShuffle(kv));
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
      setShuffle(loadShuffle(kv));
      setToday(settle(l.ids, 'back'));
    };
    // Shown again after another tab or app: maybe a new day, or one of your games finished meanwhile.
    const onVisible = () => document.visibilityState === 'visible' && setToday((t) => reread(loadPlaylist(kv).ids, t));
    // Another tab changed the playlist, Shuffle, today's marks, or one of your games said it was done.
    const onStorage = (e: StorageEvent) => {
      if (e.key === ITEMS_KEY) setList(loadPlaylist(kv));
      else if (e.key === SHUFFLE_KEY) setShuffle(loadShuffle(kv));
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

  // A check's result is in the address only until it's been read.
  useEffect(() => {
    if (readDone(location.hash)) clearHash();
  }, []);

  // A playlist link pasted into the address bar while the page is open, or a check's result arriving.
  useEffect(() => {
    const onHash = () => {
      const done = readDone(location.hash);
      if (done) {
        const r = checked(loadPlaylist(kv), done);
        setToday(r.today);
        if (r.missing) setToast(NOT_IN_PLAYLIST);
        clearHash();
      } else setIncoming(readLink(location.hash));
    };
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);

  // A toast says its piece, then goes.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

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

  /** Done with a playlist link: its #add= part leaves the address, so a reload doesn't ask again. */
  const closeIncoming = (next?: Playlist) => {
    if (next) update(next);
    setIncoming(null);
    clearHash();
  };

  /** Sends the playlist as a link: the share sheet where there is one (iPhone), else the clipboard. */
  const share = async () => {
    const url = playlistLink(list, location.origin + location.pathname);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Puzzle Playlist', text: 'My daily puzzles', url });
        return;
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast('Link copied');
    } catch {
      prompt('Copy this link', url);
    }
  };

  const setMark = (id: string, status: Status) => {
    const day = mark(today.day, id, status, Date.now());
    saveDay(kv, today.date, day);
    setToday({ ...today, day });
  };

  /** Shuffle on, with a new order each time; or off, back to the list's. */
  const toggleShuffle = () => {
    const next = shuffle.on ? { ...shuffle, on: false } : { on: true, seed: newSeed() };
    setShuffle(next);
    saveShuffle(kv, next);
  };

  // What plays next follows Shuffle; the list itself stays in your order.
  const order = playOrder(ids, shuffle, today.date);
  const bar = barFor(order, today.day, today.back);
  const current = bar.kind === 'back' || bar.kind === 'ready' ? bar.next : null;
  // ▶ at the top plays the same one as the bar along the bottom, or else (back from the last one, not ticked) the
  // first left.
  const upNext = current ?? nextUp(order, today.day);
  /** Each puzzle's colour, by its place on the list. */
  const colorOf = (id: string) => pieceColor(ids.indexOf(id));

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
      <NavBar
        title={TITLE}
        editing={editing}
        onEdit={puzzles.length ? () => setEditing(!editing) : undefined}
        onShare={puzzles.length ? share : undefined}
        onSettings={() => setSettings(true)}
      />
      <main className={puzzles.length && !editing ? 'page with-player' : 'page'}>
        <PlaylistHeader
          title={TITLE}
          date={today.date}
          puzzles={puzzles}
          done={ids.filter((id) => today.day[id]?.status === 'done').length}
          started={ids.some((id) => !unplayed(today.day, id))}
          editing={editing}
          next={upNext ? puzzles.find((p) => p.id === upNext) : undefined}
          onPlay={() => upNext && play(upNext)}
          shuffle={shuffle.on}
          onShuffle={toggleShuffle}
        />
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
                  puzzle={p}
                  color={pieceColor(i)}
                  mark={today.day[p.id]}
                  current={p.id === current}
                  onPlay={() => play(p.id)}
                  menuOpen={menu === p.id}
                  onMenu={(open) => setMenu(open ? p.id : null)}
                  onMark={(status) => setMark(p.id, status)}
                />
              ))}
            </ol>
            <p className="list-foot">{puzzles.length === 1 ? '1 puzzle' : `${puzzles.length} puzzles`}</p>
            {finder(false)}
          </>
        )}
      </main>
      {!editing && (
        <PlayerBar
          bar={bar}
          puzzle={(id) => puzzles.find((p) => p.id === id)}
          colorOf={colorOf}
          marks={today.day}
          shuffle={shuffle.on}
          onPlay={play}
          onMark={(id, isDone) => setMark(id, isDone ? 'done' : 'todo')}
        />
      )}
      {incoming && (
        <ImportSheet
          shared={incoming}
          mine={list}
          onAdd={() => closeIncoming(withShared(list, incoming))}
          onReplace={() => closeIncoming(fromShared(incoming))}
          onCancel={() => closeIncoming()}
        />
      )}
      {settings && <SettingsSheet onClose={() => setSettings(false)} onToast={setToast} />}
      {toast && (
        <p className="toast" role="status">
          {toast}
        </p>
      )}
    </div>
  );
}
