// Finding a puzzle by name as you type. It forgives typos ("wordel"), partial names ("octo"), a publisher
// mixed with a name ("nyt mini") and a site's name ("cluesbysam").

import { CATALOG, PUBLISHERS, type Puzzle } from './catalog';

/** Text as lower-case words, without accents or punctuation. */
export function words(text: string): string[] {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/** Parts of a host name that say nothing about the puzzle. */
const HOST_NOISE = new Set(['app', 'game', 'games', 'github']);

/** The words in a site's name: "https://worldle.teuteuf.fr/" → worldle, teuteuf. */
export function siteWords(url: string): string[] {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return [];
  }
  const labels = host.replace(/^www\./, '').split('.');
  labels.pop(); // the top-level domain
  return labels.flatMap(words).filter((w) => !HOST_NOISE.has(w));
}

/** Small words a query can leave out ("clues by sam" or "clues sam"), as long as it has others. */
const STOP = new Set(['the', 'a', 'an', 'by', 'of', 'and']);

/** Edits between two words (insert, delete, change, or swap neighbours), up to `max` + 1. */
export function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev2: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let d = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d = Math.min(d, prev2[j - 2] + 1);
      row.push(d);
      best = Math.min(best, d);
    }
    if (best > max) return max + 1;
    prev2 = prev;
    prev = row;
  }
  return prev[b.length];
}

/** How many typos a query word may have: none under 4 letters, 1 up to 6, then 2. */
const typosAllowed = (q: string) => (q.length < 4 ? 0 : q.length < 7 ? 1 : 2);

/** How well one query word matches one of a puzzle's words, from 0 (not at all) to 1 (exactly). */
export function wordScore(q: string, w: string): number {
  if (q === w) return 1;
  if (w.startsWith(q)) return 0.9;
  if (q.length >= 3 && w.includes(q)) return 0.7;
  const typos = typosAllowed(q);
  if (typos === 0) return 0;
  if (editDistance(q, w, typos) <= typos) return 0.6;
  // A typo in a word not finished yet: "conecti" for "connections". Not under 5 letters, where it finds too much.
  if (q.length >= 5 && w.length > q.length && editDistance(q, w.slice(0, q.length), typos) <= typos) return 0.5;
  return 0;
}

/** Words without the small ones, as a phrase: "The Mini" → "mini", "clues by sam" → "clues sam". */
const phrase = (ws: string[]) => ws.filter((w) => !STOP.has(w)).join(' ');

interface Indexed {
  puzzle: Puzzle;
  order: number;
  /** The name as a phrase, for a bonus when the query is its start. */
  name: string;
  /** Each kind of word, with how much a match in it counts. */
  fields: { weight: number; words: string[] }[];
}

const index = (puzzle: Puzzle, order: number): Indexed => {
  const publisher = puzzle.publisher === 'link' ? undefined : PUBLISHERS[puzzle.publisher];
  return {
    puzzle,
    order,
    name: phrase(words(puzzle.name)),
    fields: [
      { weight: 1, words: words(puzzle.name) },
      { weight: 0.9, words: (puzzle.aliases ?? []).flatMap(words) },
      { weight: 0.8, words: publisher ? [...words(publisher.label), ...publisher.aliases.flatMap(words)] : [] },
      { weight: 0.8, words: siteWords(puzzle.url) },
    ],
  };
};

const INDEX = CATALOG.map(index);

/** Puzzles matching a query, best first; those with equal scores keep the catalog's order. */
export function search(query: string, puzzles: readonly Puzzle[] = CATALOG): Puzzle[] {
  const all = words(query);
  const meaningful = all.filter((w) => !STOP.has(w));
  const qs = meaningful.length ? meaningful : all;
  if (!qs.length) return [];

  const indexed = puzzles === CATALOG ? INDEX : puzzles.map(index);
  const asked = qs.join(' ');
  const scored: { item: Indexed; score: number }[] = [];
  for (const item of indexed) {
    let total = 0;
    let missed = false;
    for (const q of qs) {
      let best = 0;
      for (const field of item.fields) for (const w of field.words) best = Math.max(best, wordScore(q, w) * field.weight);
      if (best === 0) {
        missed = true;
        break;
      }
      total += best;
    }
    if (missed) continue;
    let score = total / qs.length;
    if (item.name === asked) score += 0.5;
    else if (item.name.startsWith(asked)) score += 0.25;
    scored.push({ item, score });
  }
  return scored.sort((a, b) => b.score - a.score || a.item.order - b.item.order).map((s) => s.item.puzzle);
}
