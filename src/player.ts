// What the playlist does when the page opens or comes back: which puzzle you're back from, what to tick, and
// what ▶ plays next. It's all plain functions of what's stored, so it's tested without a browser.
//
// The loop (see DESIGN.md): ▶ saves a launch and takes this tab to the puzzle; Back returns here. Coming
// back ticks the puzzle, once: one of your own games only if it said it was done (src/firstParty.ts), any
// other just for coming back, with "Not yet" to undo. The playlist never moves on without a tap, since a
// page that navigates without one gets skipped by Back.

export type Status = 'done' | 'skipped' | 'todo';

/** What you've marked a puzzle today, and when. 'todo' is an explicit "Not yet". */
export interface Mark {
  status: Status;
  at: number;
  /** A short result from the bookmarklet's check ("3/6"), and the game's share text. */
  score?: string;
  share?: string;
}

/** Today's marks, by puzzle id. */
export type Day = Record<string, Mark>;

/** The puzzle ▶ last took this tab to. */
export interface Launch {
  id: string;
  date: string;
  at: number;
  /** Already acted on: a later Back, Forward or restore from the cache mustn't tick it again. */
  handled: boolean;
}

/** How the page came to be showing: opened afresh (or reloaded), or by Back or Forward. */
export type Arrival = 'fresh' | 'back';

export interface ArriveInput {
  today: string;
  now: number;
  arrival: Arrival;
  launch: Launch | null;
  day: Day;
  /** When each of your games said it was done today, by puzzle id. */
  signals: Readonly<Record<string, number>>;
  /** Whether a puzzle is one of your games, which say for themselves when they're done. */
  reportsDone(id: string): boolean;
}

/** The puzzle you've just come back from by Back, and whether it's ticked. */
export interface Back {
  id: string;
  ticked: boolean;
}

export interface Arrived {
  day: Day;
  launch: Launch | null;
  back: Back | null;
  /** Whether `day` or `launch` differ from what was stored. */
  changed: boolean;
}

const isDone = (m: Mark | undefined) => m?.status === 'done';

/** Today's marks with your games' signals applied: a signal ticks a game unless you marked it since. */
export function applySignals(day: Day, signals: Readonly<Record<string, number>>): Day {
  let out = day;
  for (const [id, at] of Object.entries(signals)) {
    const mark = day[id];
    if (!mark || (!isDone(mark) && mark.at < at)) out = { ...out, [id]: { status: 'done', at } };
  }
  return out;
}

/** What arriving on the page means for today's marks, the saved launch, and the bottom bar. */
export function arrive({ today, now, arrival, launch, day: stored, signals, reportsDone }: ArriveInput): Arrived {
  const day = applySignals(stored, signals);
  let changed = day !== stored;

  if (!launch) return { day, launch, back: null, changed };
  if (launch.date !== today) return { day, launch: null, back: null, changed: true };
  if (launch.handled) return { day, launch, back: null, changed };

  let marked = day;
  if (!reportsDone(launch.id) && !isDone(day[launch.id])) marked = { ...day, [launch.id]: { status: 'done', at: now } };
  return {
    day: marked,
    launch: { ...launch, handled: true },
    back: arrival === 'back' ? { id: launch.id, ticked: isDone(marked[launch.id]) } : null,
    changed: true,
  };
}

/** Whether a puzzle still wants playing today: not done and not skipped. */
export const unplayed = (day: Day, id: string) => !day[id] || day[id].status === 'todo';

/**
 * The puzzle ▶ plays: the first unplayed one after `after` (wrapping round to the top), or from the top if
 * `after` isn't given. Null when everything's done or skipped.
 */
export function nextUp(ids: readonly string[], day: Day, after?: string): string | null {
  const start = after === undefined ? 0 : ids.indexOf(after) + 1;
  for (let k = 0; k < ids.length; k++) {
    const id = ids[(start + k) % ids.length];
    if (id !== after && unplayed(day, id)) return id;
  }
  return null;
}

/** What the bottom bar shows. */
export type Bar =
  /** Back from a puzzle: "✓ Wordle · Up next: Connections", with Not yet (or Done, for your games). */
  | { kind: 'back'; from: string; ticked: boolean; next: string | null }
  /** Ready to play: "Up next: Connections"; `started` once something's been played or skipped today. */
  | { kind: 'ready'; next: string; started: boolean }
  /** Nothing left today. `from` is the puzzle you've just come back from, ticked: Not yet still un-ticks it. */
  | { kind: 'all-done'; from?: string }
  | { kind: 'empty' };

export function barFor(ids: readonly string[], day: Day, back: Back | null): Bar {
  if (!ids.length) return { kind: 'empty' };
  if (back && ids.includes(back.id)) {
    const ticked = isDone(day[back.id]);
    const next = nextUp(ids, day, back.id);
    if (ticked && !next) return { kind: 'all-done', from: back.id };
    return { kind: 'back', from: back.id, ticked, next };
  }
  const next = nextUp(ids, day);
  if (!next) return { kind: 'all-done' };
  return { kind: 'ready', next, started: ids.some((id) => !unplayed(day, id)) };
}

/** Today's marks with one puzzle marked by hand: from its row's menu, or the bar's Not yet and Done. */
export const mark = (day: Day, id: string, status: Status, now: number): Day => ({ ...day, [id]: { status, at: now } });
