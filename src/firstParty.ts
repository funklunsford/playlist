// Your own games say when they're done, through the localStorage they share with the playlist. All three sites
// are on funklunsford.github.io, one origin, so no server is needed. A game that finishes writes
//
//   localStorage.setItem(`puzzle-done:${game}:${date}`, JSON.stringify({ at: Date.now() }))
//
// `game` is its id in the catalog ('strokes', 'mountweazel'), and `date` is the local date it finished on, as
// YYYY-MM-DD (Strokes' localDate()). It may add `share`, its result text.
//
// The playlist reads these when it opens, and whenever it's shown again. It also reads them as they're
// written, from the 'storage' event a game in another tab causes. It forgets them after 90 days, along with
// its own records (prune, in src/store.ts).

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
