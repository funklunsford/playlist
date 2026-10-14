// What the bookmarklet brings back to the playlist: which puzzle it checked, and the result, in the address.
//
//   …/playlist/#done=nyt-wordle&url=<the puzzle's page>&score=3%2F6&text=<the game's share text>&how=checked
//
// `done` is the catalog id when the check knew the game, else empty, and the playlist goes by `url`.
// `how` says how it was decided: "checked" from the page, "asked" when the player said so, and "unchecked" when
// the check couldn't load and the player said so.

import type { Puzzle } from './catalog';
import { findPuzzle } from './match';

export type How = 'checked' | 'asked' | 'unchecked';

export interface Done {
  id?: string;
  url?: string;
  /** The game's own share text. */
  text?: string;
  /** A short result for a row: "3/6", "Perfect", "0:41". */
  score?: string;
  how: How;
}

const MAX_TEXT = 600;
const MAX_SCORE = 24;

/** The #done=… part of the playlist's address that carries a check's result. */
export function doneHash(d: Done): string {
  const q = new URLSearchParams();
  q.set('done', d.id ?? '');
  if (d.url) q.set('url', d.url);
  if (d.score) q.set('score', d.score.slice(0, MAX_SCORE));
  if (d.text) q.set('text', d.text.slice(0, MAX_TEXT));
  q.set('how', d.how);
  return `#${q}`;
}

/** A check's result from the playlist's address, or null if there's none. */
export function readDone(hash: string): Done | null {
  if (!hash.startsWith('#done=')) return null;
  const q = new URLSearchParams(hash.slice(1));
  const how = q.get('how');
  return {
    id: q.get('done') || undefined,
    url: q.get('url') || undefined,
    text: q.get('text')?.slice(0, MAX_TEXT) || undefined,
    score: q.get('score')?.slice(0, MAX_SCORE) || undefined,
    how: how === 'asked' || how === 'unchecked' ? how : 'checked',
  };
}

/**
 * The playlist puzzle a check was for: by its id, else by the page it was on, else (when the check didn't know
 * the game) the puzzle ▶ last opened. Null when it's none of the playlist's.
 */
export function resolveDone(done: Done, puzzles: readonly Puzzle[], launchId?: string): string | null {
  if (done.id && puzzles.some((p) => p.id === done.id)) return done.id;
  const byPage = done.url ? findPuzzle(puzzles, done.url) : undefined;
  if (byPage) return byPage.id;
  if (!done.id && launchId && puzzles.some((p) => p.id === launchId)) return launchId;
  return null;
}
