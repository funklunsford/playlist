// Your own games say when they're done, through localStorage, which a page shares only with pages on its own
// origin. Strokes and the playlist are both on strokes.fun (Strokes at its root, the playlist at /playlist/,
// forwarded from its GitHub Pages site), so no server is needed. A game that finishes writes
//
//   localStorage.setItem(`puzzle-done:${game}:${date}`, JSON.stringify({ at: Date.now() }))
//
// `game` is its id in the catalog ('strokes', 'mountweazel'), and `date` is the local date it finished on, as
// YYYY-MM-DD (Strokes' localDate()). It may add `share`, its result text.
//
// The playlist reads these for the games on its own origin (readsDone), when it opens and whenever it's shown
// again. It also reads them as they're written, from the 'storage' event a game in another tab causes. It
// forgets them after 90 days, along with its own records (prune, in src/store.ts). Your games on another origin
// (Strokes, on strokes.fun) still write theirs, out of the playlist's reach: they're ticked for coming back,
// like anyone's, and the bookmarklet's check reads their key on their own page.

import type { KeyValue } from './store';

const PREFIX = 'puzzle-done:';

export const doneKey = (game: string, date: string) => `${PREFIX}${game}:${date}`;

/** A done key's game and date, or null if the key isn't one. */
export function parseDoneKey(key: string): { game: string; date: string } | null {
  if (!key.startsWith(PREFIX)) return null;
  const rest = key.slice(PREFIX.length);
  const i = rest.lastIndexOf(':');
  const date = rest.slice(i + 1);
  return i > 0 && /^\d{4}-\d{2}-\d{2}$/.test(date) ? { game: rest.slice(0, i), date } : null;
}

/**
 * Whether the playlist, at `here` (its own address), can read a puzzle's done key: one of your own games on the
 * playlist's origin. On strokes.fun that's Strokes; Mountweazel writes its key on funklunsford.github.io.
 */
export function readsDone(puzzle: { url: string; firstParty?: boolean } | undefined, here: string): boolean {
  if (!puzzle?.firstParty) return false;
  try {
    return new URL(puzzle.url, here).origin === new URL(here).origin;
  } catch {
    return false;
  }
}

/** A done key's date, or null if the key isn't one. */
export const signalDate = (key: string) => parseDoneKey(key)?.date ?? null;

/** When each of these games said it was done on `date`, by id. A signal whose time can't be read counts as early. */
export function readSignals(kv: KeyValue, ids: readonly string[], date: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const id of ids) {
    let raw: string | null = null;
    try {
      raw = kv.getItem(doneKey(id, date));
    } catch {
      /* storage blocked: no signals */
    }
    if (raw == null) continue;
    let at = 0;
    try {
      const v = JSON.parse(raw);
      if (typeof v?.at === 'number') at = v.at;
    } catch {
      /* unreadable: still done */
    }
    out[id] = at;
  }
  return out;
}
