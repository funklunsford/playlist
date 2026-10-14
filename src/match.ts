// Which puzzle a page belongs to: the same site (www. or not) and, when the puzzle's address has a path, a page
// at or under it. So "…/games/octordle/archive" is Octordle's, but Merriam-Webster's home page isn't, and
// "/games/connections-sports" isn't Connections'.

import type { Puzzle } from './catalog';

const host = (u: URL) => u.hostname.replace(/^www\./, '');

/** A path without its last "/" or "index.html": "/games/wordle/index.html" → "/games/wordle". */
const trimPath = (path: string) => path.replace(/\/index\.html?$/, '').replace(/\/+$/, '');

/** How closely a page belongs to a puzzle's address: the length of the path they share, or -1 if it doesn't. */
export function belongs(puzzleUrl: string, pageUrl: string): number {
  let p: URL, q: URL;
  try {
    p = new URL(puzzleUrl);
    q = new URL(pageUrl);
  } catch {
    return -1;
  }
  if (host(p) !== host(q)) return -1;
  const path = trimPath(p.pathname);
  const page = trimPath(q.pathname);
  return page === path || page.startsWith(`${path}/`) ? path.length : -1;
}

/** The puzzle a page belongs to, the most specific one if several do. */
export function findPuzzle<P extends Pick<Puzzle, 'url'>>(puzzles: readonly P[], pageUrl: string): P | undefined {
  let best: P | undefined;
  let bestLength = -1;
  for (const p of puzzles) {
    const n = belongs(p.url, pageUrl);
    if (n > bestLength) [best, bestLength] = [p, n];
  }
  return best;
}
