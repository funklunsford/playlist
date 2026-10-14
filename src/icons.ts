// Each puzzle's own icon, as its site gives one to a browser: its home-screen icon where it has one, else its
// favicon. The catalog's are copied into public/icons/, so the playlist asks nothing of other sites as it opens.
// Most are full squares, shown edge to edge. A few are a mark on a clear background, shown smaller on a plate.
//
// To add one for a new catalog puzzle: save its site's apple-touch-icon (or favicon, as a PNG) in public/icons/, no
// more than 256px across, and list it here. A test checks every catalog puzzle has one, or is in NO_ICON.

import type { Puzzle } from './catalog';

export interface Icon {
  /** Its file in public/icons/. */
  file: string;
  /** For a mark on a clear background: the share of the tile it fills. Full squares fill it all. */
  inset?: number;
  /** The colour behind it, where that isn't white: an icon with rounded corners of its own sits on its own colour. */
  plate?: string;
  /** A small favicon's own width, in pixels: it's never drawn wider, so it's never blurred. */
  px?: number;
}

/** One icon, with where it comes from, as a tile draws it. */
export type IconSource = Omit<Icon, 'file'> & { src: string };

// Every LinkedIn game has LinkedIn's own icon.
const LINKEDIN: Icon = { file: 'linkedin.svg', plate: '#0a66c2' };

export const ICONS: Readonly<Record<string, Icon>> = {
  'nyt-wordle': { file: 'nyt-wordle.png' },
  'nyt-connections': { file: 'nyt-connections.png' },
  'nyt-strands': { file: 'nyt-strands.png' },
  // The Mini and the Crossword: the icon each shows in a browser's tab, not the Times' own "T".
  'nyt-mini': { file: 'nyt-mini.svg', plate: '#000000' },
  'nyt-spelling-bee': { file: 'nyt-spelling-bee.png' },
  'nyt-crossword': { file: 'nyt-crossword.svg', plate: '#000000' },
  'nyt-pips': { file: 'nyt-pips.png', inset: 0.86 },
  'nyt-letter-boxed': { file: 'nyt-letter-boxed.png' },
  'nyt-tiles': { file: 'nyt-tiles.png' },
  'nyt-sudoku': { file: 'nyt-sudoku.png' },
  strokes: { file: 'strokes.svg', plate: '#1f1d26' },
  mountweazel: { file: 'mountweazel.png' },
  'clues-by-sam': { file: 'clues-by-sam.png' },
  framed: { file: 'framed.png' },
  octordle: { file: 'octordle.png', inset: 0.86 },
  quordle: { file: 'quordle.png' },
  squaredle: { file: 'squaredle.png' },
  murdle: { file: 'murdle.png', inset: 0.75, px: 32 },
  globle: { file: 'globle.png' },
  worldle: { file: 'worldle.png' },
  travle: { file: 'travle.png' },
  costcodle: { file: 'costcodle.png' },
  nerdle: { file: 'nerdle.png', px: 48 },
  semantle: { file: 'semantle.png', plate: '#209cee', px: 48 },
  contexto: { file: 'contexto.png', inset: 0.8 },
  waffle: { file: 'waffle.png' },
  puzzmo: { file: 'puzzmo.png' },
  timeguessr: { file: 'timeguessr.png' },
  bandle: { file: 'bandle.png' },
  tradle: { file: 'tradle.png', inset: 0.8, px: 64 },
  mathler: { file: 'mathler.png' },
  chronophoto: { file: 'chronophoto.png' },
  'box-office-game': { file: 'box-office-game.png' },
  // The Atlantic's, as its site keeps Bracket City's own from scripts.
  'bracket-city': { file: 'bracket-city.png' },
  'wapo-keyword': { file: 'wapo-keyword.jpg' },
  'guardian-crosswords': { file: 'guardian-crosswords.svg' },
  'linkedin-queens': LINKEDIN,
  'linkedin-tango': LINKEDIN,
  'linkedin-zip': LINKEDIN,
  'linkedin-pinpoint': LINKEDIN,
  'linkedin-crossclimb': LINKEDIN,
};

/** Catalog puzzles whose sites give no icon: they keep their initial on a tile of their colour. */
export const NO_ICON: readonly string[] = ['poeltl'];

/**
 * The icons to try for a puzzle, best first; a tile falls back to the next if one won't load, and to the puzzle's
 * initial after the last. A catalog puzzle has its copy here. One added by its address tries its site's home-screen
 * icon, then its favicon (small, so drawn small).
 */
export function iconsFor(p: Puzzle): IconSource[] {
  const own = ICONS[p.id];
  if (own) {
    const { file, ...look } = own;
    return [{ src: `icons/${file}`, ...look }];
  }
  if (p.publisher !== 'link') return [];
  try {
    const { origin } = new URL(p.url);
    return [{ src: `${origin}/apple-touch-icon.png` }, { src: `${origin}/favicon.ico`, inset: 0.6, px: 32 }];
  } catch {
    return [];
  }
}

/**
 * The puzzles a playlist's cover is made from, as a music app makes one from albums: the first four with different
 * icons. A puzzle whose icon is already on it is passed over, as a second song from the same album is.
 */
export function coverOf(puzzles: readonly Puzzle[]): Puzzle[] {
  const seen = new Set<string>();
  const cover: Puzzle[] = [];
  for (const p of puzzles) {
    const look = iconsFor(p)[0]?.src ?? `initial:${p.id}`;
    if (seen.has(look)) continue;
    seen.add(look);
    cover.push(p);
    if (cover.length === 4) break;
  }
  return cover;
}

/**
 * The cover's tiles, in reading order: a 2 × 2 mosaic of the first four different icons. Two or three are mixed into
 * it too, the first repeated on the diagonal (A B / B A, or A B / C A). One alone fills the cover.
 */
export function coverTiles(puzzles: readonly Puzzle[]): Puzzle[] {
  const [a, b, c, d] = coverOf(puzzles);
  if (!b) return a ? [a] : [];
  return [a, b, c ?? b, d ?? a];
}
