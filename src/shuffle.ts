// Shuffle: with it on, ▶ and Next take today's puzzles in a shuffled order rather than the list's. The list itself
// stays in your order, as in a music app.
//
// Every play leaves this page and comes back to it, so the order is worked out afresh from what's stored each time:
// the same seed and date always give the same order. Turning Shuffle on again picks a new seed, so a new order, and
// so does a new day.

/** Whether Shuffle is on, and the seed of its order. */
export interface Shuffle {
  on: boolean;
  seed: number;
}

export const SHUFFLE_OFF: Shuffle = { on: false, seed: 0 };

/** A seed for turning Shuffle on: a new order each time. */
export const newSeed = () => Math.floor(Math.random() * 2 ** 32);

/** A well-mixed 32-bit hash of a string: FNV-1a, finished as MurmurHash3 finishes. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * The order ▶ plays today's puzzles in: the list's own, or with Shuffle on, sorted by a hash of each puzzle with the
 * seed and the date. Sorting by a hash, rather than shuffling the list, leaves the others' order as it was when a
 * puzzle is added or removed.
 */
export function playOrder(ids: readonly string[], shuffle: Shuffle, date: string): readonly string[] {
  if (!shuffle.on) return ids;
  return ids
    .map((id) => ({ id, key: hash(`${shuffle.seed}:${date}:${id}`) }))
    .sort((a, b) => a.key - b.key || (a.id < b.id ? -1 : 1))
    .map(({ id }) => id);
}
