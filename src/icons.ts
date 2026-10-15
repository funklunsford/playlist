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
  strokes: { file: 'strokes.svg', plate: '#17161c' },
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
  flagle: { file: 'flagle.png' },
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
  anthropeum: { file: 'anthropeum.png' },
  'box-office-game': { file: 'box-office-game.png' },
  krillion: { file: 'krillion.png' },
  // Hank Green's games share one icon.
  smush: { file: 'hankgreen.svg' },
  'four-by-three': { file: 'hankgreen.svg' },
  // The Atlantic's, as its site keeps Bracket City's own from scripts.
  'bracket-city': { file: 'bracket-city.png' },
  'wapo-keyword': { file: 'wapo-keyword.jpg' },
  'guardian-crosswords': { file: 'guardian-crosswords.svg' },
  // The r/wordgames thread's games (src/catalog.ts). Rounded icons sit on their own edge colour.
  freestyle: { file: 'freestyle.png', plate: '#60bccc', px: 112 },
  stackdown: { file: 'stackdown.png', plate: '#117555' },
  'one-word-search': { file: 'one-word-search.png', plate: '#3794b5' },
  raddle: { file: 'raddle.png', plate: '#1e88e5' },
  'tiled-words': { file: 'tiled-words.png' },
  'bridge-of-truth': { file: 'bridge-of-truth.png' },
  gisnep: { file: 'gisnep.png' },
  'cell-tower': { file: 'cell-tower.png' },
  numberbang: { file: 'numberbang.png', plate: '#faf5e8' },
  squareword: { file: 'squareword.png' },
  'guess-my-word': { file: 'guess-my-word.svg', inset: 0.8 },
  gramgrid: { file: 'gramgrid.png', plate: '#e0f2fe' },
  gokuro: { file: 'gokuro.png' },
  'word-salad': { file: 'word-salad.png', plate: '#f0f0ef' },
  wordshake: { file: 'wordshake.png', plate: '#4c929d', px: 80 },
  phrasicle: { file: 'phrasicle.png' },
  weaver: { file: 'weaver.png' },
  shiftogram: { file: 'shiftogram.png' },
  tylogram: { file: 'tylogram.png' },
  'minute-cryptic': { file: 'minute-cryptic.png' },
  letterage: { file: 'letterage.png' },
  letafall: { file: 'letafall.png', px: 32 },
  worble: { file: 'worble.png' },
  wordgy: { file: 'wordgy.png' },
  'cross-spin': { file: 'cross-spin.png' },
  'word-zip': { file: 'word-zip.png', px: 32 },
  'second-scramble': { file: 'second-scramble.png', plate: '#6752eb' },
};

/**
 * Catalog puzzles whose sites give no icon of their own, in catalog order: they keep their initial on a tile of
 * their colour. Wordercise's is 16px across, and Rhyme or Reason's is the React logo its site was built with.
 */
export const NO_ICON: readonly string[] = ['poeltl', 'wordercise', 'rhyme-or-reason', 'rhymey-timey'];

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
 * The puzzles a playlist's cover is made from, as a music app makes one from albums: with four or more, the first
 * four, in a 2 × 2 mosaic; with fewer, the first one's icon alone.
 */
export const coverOf = (puzzles: readonly Puzzle[]): Puzzle[] => puzzles.slice(0, puzzles.length >= 4 ? 4 : 1);
