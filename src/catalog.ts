// The puzzles you can add by name. Each one opens at `url` in the playlist's own tab (see DESIGN.md), so
// every `url` is the puzzle's final address: `npm run check-catalog` confirms they all still answer, and
// flags any that now redirect.

export type PublisherId = 'nyt' | 'linkedin' | 'mw' | 'atlantic' | 'wapo' | 'guardian' | 'indie' | 'yours';

export interface Publisher {
  /** How a row names it. */
  label: string;
  /** Other names it goes by, for search: "nyt" finds every NYT game without each one saying so. */
  aliases: string[];
}

export const PUBLISHERS: Record<PublisherId, Publisher> = {
  nyt: { label: 'NYT', aliases: ['nyt', 'nytimes', 'new york times', 'ny times'] },
  linkedin: { label: 'LinkedIn', aliases: ['linkedin', 'linked in'] },
  mw: { label: 'Merriam-Webster', aliases: ['merriam webster', 'mw'] },
  atlantic: { label: 'The Atlantic', aliases: ['the atlantic'] },
  wapo: { label: 'Washington Post', aliases: ['washington post', 'wapo'] },
  guardian: { label: 'The Guardian', aliases: ['the guardian'] },
  indie: { label: 'Indie', aliases: ['indie'] },
  yours: { label: 'Yours', aliases: ['yours', 'ours', 'funklunsford'] },
};

export interface Puzzle {
  id: string;
  name: string;
  /** 'link' for one added by its address rather than from the catalog. */
  publisher: PublisherId | 'link';
  url: string;
  /** Other names it goes by, for search. */
  aliases?: string[];
  /** Its tile's colour. */
  color: string;
  /** One of your own games, on the playlist's origin: it says when it's done (see src/firstParty.ts). */
  firstParty?: boolean;
  /** False for a puzzle that isn't new each day. "Done" means "played today" either way. */
  daily?: boolean;
  note?: string;
}

export const CATALOG: readonly Puzzle[] = [
  // The New York Times
  { id: 'nyt-wordle', name: 'Wordle', publisher: 'nyt', url: 'https://www.nytimes.com/games/wordle/index.html', color: '#6aaa64' },
  { id: 'nyt-connections', name: 'Connections', publisher: 'nyt', url: 'https://www.nytimes.com/games/connections', color: '#a78bda' },
  { id: 'nyt-strands', name: 'Strands', publisher: 'nyt', url: 'https://www.nytimes.com/games/strands', color: '#5bb3c4' },
  { id: 'nyt-mini', name: 'The Mini', publisher: 'nyt', url: 'https://www.nytimes.com/crosswords/game/mini', aliases: ['mini crossword'], color: '#4f85e5' },
  { id: 'nyt-spelling-bee', name: 'Spelling Bee', publisher: 'nyt', url: 'https://www.nytimes.com/puzzles/spelling-bee', color: '#f7da21' },
  { id: 'nyt-crossword', name: 'The Crossword', publisher: 'nyt', url: 'https://www.nytimes.com/crosswords/game/daily', aliases: ['daily crossword'], color: '#2f5fb8', note: 'Needs an NYT Games subscription' },
  { id: 'nyt-pips', name: 'Pips', publisher: 'nyt', url: 'https://www.nytimes.com/games/pips', aliases: ['dominoes'], color: '#d9705c' },
  { id: 'nyt-letter-boxed', name: 'Letter Boxed', publisher: 'nyt', url: 'https://www.nytimes.com/puzzles/letter-boxed', aliases: ['letterboxed'], color: '#fc716b' },
  { id: 'nyt-tiles', name: 'Tiles', publisher: 'nyt', url: 'https://www.nytimes.com/puzzles/tiles', color: '#9bc94b' },
  { id: 'nyt-sudoku', name: 'Sudoku', publisher: 'nyt', url: 'https://www.nytimes.com/puzzles/sudoku', color: '#f39c32' },

  // Your own
  { id: 'strokes', name: 'Strokes', publisher: 'yours', url: 'https://funklunsford.github.io/strokes/', aliases: ['diplets', 'word maze'], color: '#6f5899', firstParty: true },
  { id: 'mountweazel', name: 'Mountweazel', publisher: 'yours', url: 'https://funklunsford.github.io/mountweazel/', aliases: ['mount weazel', 'fake words', 'archaic words'], color: '#26241f', firstParty: true, daily: false },

  // Independent and others
  { id: 'clues-by-sam', name: 'Clues by Sam', publisher: 'indie', url: 'https://cluesbysam.com/', aliases: ['detective'], color: '#3d7f62' },
  { id: 'framed', name: 'Framed', publisher: 'indie', url: 'https://framed.wtf/', aliases: ['movie', 'film'], color: '#2a2a2a' },
  { id: 'octordle', name: 'Octordle', publisher: 'mw', url: 'https://www.merriam-webster.com/games/octordle/', color: '#e9b949' },
  { id: 'quordle', name: 'Quordle', publisher: 'mw', url: 'https://www.merriam-webster.com/games/quordle/', color: '#3fa66b' },
  { id: 'squaredle', name: 'Squaredle', publisher: 'indie', url: 'https://squaredle.app/', color: '#b8322f' },
  { id: 'murdle', name: 'Murdle', publisher: 'indie', url: 'https://murdle.com/', aliases: ['mystery'], color: '#8b2e2e' },
  { id: 'globle', name: 'Globle', publisher: 'indie', url: 'https://globle-game.com/', aliases: ['globe', 'country', 'geography'], color: '#2d8fd5' },
  { id: 'worldle', name: 'Worldle', publisher: 'indie', url: 'https://worldle.teuteuf.fr/', aliases: ['country', 'map', 'geography'], color: '#3b6fb6' },
  { id: 'travle', name: 'Travle', publisher: 'indie', url: 'https://travle.earth/', aliases: ['travel', 'map', 'geography'], color: '#2e9e8f' },
  { id: 'flagle', name: 'Flagle', publisher: 'indie', url: 'https://www.flagle.io/', aliases: ['flag', 'flags', 'country', 'geography'], color: '#2f7de1' },
  { id: 'costcodle', name: 'Costcodle', publisher: 'indie', url: 'https://costcodle.com/', aliases: ['costco', 'price'], color: '#d2343b' },
  { id: 'nerdle', name: 'Nerdle', publisher: 'indie', url: 'https://www.nerdlegame.com/', aliases: ['math'], color: '#820458' },
  { id: 'semantle', name: 'Semantle', publisher: 'indie', url: 'https://semantle.com/', color: '#4a4a8a' },
  { id: 'contexto', name: 'Contexto', publisher: 'indie', url: 'https://contexto.me/', color: '#5a67d8' },
  { id: 'waffle', name: 'Waffle', publisher: 'indie', url: 'https://wafflegame.net/daily', color: '#f2b33d' },
  { id: 'puzzmo', name: 'Puzzmo', publisher: 'indie', url: 'https://www.puzzmo.com/today', color: '#f05a9a' },
  { id: 'timeguessr', name: 'TimeGuessr', publisher: 'indie', url: 'https://timeguessr.com/', aliases: ['time guesser'], color: '#c8803a' },
  { id: 'bandle', name: 'Bandle', publisher: 'indie', url: 'https://bandle.app/', aliases: ['music', 'song'], color: '#e04e8a' },
  { id: 'tradle', name: 'Tradle', publisher: 'indie', url: 'https://oec.world/en/games/tradle', aliases: ['trade'], color: '#3c9d5d' },
  { id: 'mathler', name: 'Mathler', publisher: 'indie', url: 'https://www.mathler.com/', aliases: ['math'], color: '#6b4fbb' },
  { id: 'chronophoto', name: 'Chronophoto', publisher: 'indie', url: 'https://www.chronophoto.app/', aliases: ['photo', 'year'], color: '#8a6d4b' },
  { id: 'anthropeum', name: 'Anthropeum', publisher: 'indie', url: 'https://anthropeum.com/', aliases: ['art', 'art history', 'museum', 'artifact'], color: '#b5353b' },
  { id: 'poeltl', name: 'Poeltl', publisher: 'indie', url: 'https://poeltl.dunk.town/', aliases: ['nba', 'basketball'], color: '#e46b2c' },
  { id: 'box-office-game', name: 'Box Office Game', publisher: 'indie', url: 'https://boxofficega.me/', aliases: ['movies'], color: '#b23a48' },
  { id: 'krillion', name: 'Krillion', publisher: 'indie', url: 'https://www.krillion.org/', aliases: ['trivia', 'rare answers'], color: '#092238' },

  // Indie word games people play daily, from r/wordgames' thread "What daily word games are you playing that are NOT
  // part of a platform" (November 2025), in the order the thread ranks them.
  { id: 'freestyle', name: 'Freestyle', publisher: 'indie', url: 'https://playfreestyle.co/', aliases: ['rhyme', 'rhymes'], color: '#60bccc' },
  { id: 'stackdown', name: 'Stackdown', publisher: 'indie', url: 'https://puzzlist.com/stackdown/', aliases: ['stack', 'puzzlist'], color: '#117555' },
  { id: 'one-word-search', name: 'One Word Search', publisher: 'indie', url: 'https://onewordsearch.com/', aliases: ['word search', 'puzzlist'], color: '#3794b5' },
  { id: 'wordercise', name: 'Wordercise', publisher: 'indie', url: 'https://wordercise.com/', aliases: ['word exercise'], color: '#4f46e5' },
  { id: 'raddle', name: 'Raddle', publisher: 'indie', url: 'https://raddle.quest/', aliases: ['word ladder', 'transformation'], color: '#1e88e5' },
  { id: 'tiled-words', name: 'Tiled Words', publisher: 'indie', url: 'https://tiledwords.com/', aliases: ['tiles', 'crossword'], color: '#7fa6cf' },
  { id: 'bridge-of-truth', name: 'Bridge of Truth', publisher: 'indie', url: 'https://www.thetruthbridge.com/', aliases: ['truth bridge', 'lies', 'logic'], color: '#3fbf4f' },
  { id: 'gisnep', name: 'Gisnep', publisher: 'indie', url: 'https://gisnep.com/', aliases: ['quotefall', 'dropquote', 'quote'], color: '#e0a32e' },
  { id: 'cell-tower', name: 'Cell Tower', publisher: 'indie', url: 'https://www.andrewt.net/puzzles/cell-tower/', aliases: ['hidden words'], color: '#5c7cba' },
  { id: 'numberbang', name: 'NumberBang', publisher: 'indie', url: 'https://numberbang.com/', aliases: ['number bang', 'phrase'], color: '#e2574c' },
  { id: 'squareword', name: 'Squareword', publisher: 'indie', url: 'https://squareword.org/', aliases: ['square word'], color: '#4cae4f' },
  { id: 'rhyme-or-reason', name: 'Rhyme or Reason', publisher: 'indie', url: 'https://www.rhyme-or-reason.app/', aliases: ['rhyme'], color: '#3fb6dc' },
  { id: 'guess-my-word', name: 'Guess My Word', publisher: 'indie', url: 'https://hryanjones.com/guess-my-word/', aliases: ['alphabetical'], color: '#f2b233' },
  { id: 'gramgrid', name: 'GramGrid', publisher: 'indie', url: 'https://gramgrid.net/', aliases: ['gram grid', 'arithmetic'], color: '#5aa7e0' },
  { id: 'gokuro', name: 'Gokuro', publisher: 'indie', url: 'https://gokuro.net/', aliases: ['kakuro', 'arithmetic'], color: '#d9534f' },
  { id: 'word-salad', name: 'Word Salad', publisher: 'indie', url: 'https://wordsalad.app/', aliases: ['themed words'], color: '#6cae4a' },
  { id: 'wordshake', name: 'Wordshake', publisher: 'indie', url: 'https://wordshake.com/', aliases: ['boggle', 'word shake'], color: '#4c929d' },
  { id: 'phrasicle', name: 'Phrasicle', publisher: 'indie', url: 'https://phrasicle.com/', aliases: ['phrase', 'phrases'], color: '#00c8e4' },
  { id: 'weaver', name: 'Weaver', publisher: 'indie', url: 'https://wordwormdormdork.com/weaver/', aliases: ['word ladder', 'wordwormdormdork'], color: '#7a5af8' },
  { id: 'shiftogram', name: 'Shiftogram', publisher: 'indie', url: 'https://shiftogram.com/', aliases: ['sliding', 'crossword'], color: '#7c90c1' },
  { id: 'tylogram', name: 'Tylogram', publisher: 'indie', url: 'https://tylogr.am/current', aliases: ['sliding'], color: '#c0392b', daily: false, note: 'New Tuesdays and Fridays' },
  { id: 'minute-cryptic', name: 'Minute Cryptic', publisher: 'indie', url: 'https://www.minutecryptic.com/', aliases: ['cryptic', 'crossword clue'], color: '#3b6fd8' },
  { id: 'letterage', name: 'Letterage', publisher: 'indie', url: 'https://letteragegame.com/', aliases: ['long words'], color: '#222222' },
  { id: 'letafall', name: 'Letafall', publisher: 'indie', url: 'https://letafall.com/', aliases: ['letter fall'], color: '#2e8b3e' },
  { id: 'worble', name: 'Worble', publisher: 'indie', url: 'https://www.worble.fun/', aliases: ['changing word'], color: '#6aaa64' },
  { id: 'wordgy', name: 'Wordgy', publisher: 'indie', url: 'https://wordgy.com/', aliases: ['word chain'], color: '#f08a24' },
  { id: 'rhymey-timey', name: 'Rhymey Timey', publisher: 'indie', url: 'https://rmtmgames.com/', aliases: ['rhy-me', 'ti-me', 'rhyme time'], color: '#9b59b6', daily: false, note: 'New every other day' },
  { id: 'cross-spin', name: 'Cross Spin', publisher: 'indie', url: 'https://crossspingame.com/', aliases: ['crossword', 'spin'], color: '#e67e22' },
  { id: 'word-zip', name: 'Word Zip', publisher: 'indie', url: 'https://www.wfhgames.com/word-zip', aliases: ['zip', 'wfh games'], color: '#5989ca' },
  { id: 'second-scramble', name: 'Second Scramble', publisher: 'indie', url: 'https://www.secondscramble.com/', aliases: ['scramble', 'unscramble'], color: '#6752eb' },
  { id: 'bracket-city', name: 'Bracket City', publisher: 'atlantic', url: 'https://www.theatlantic.com/games/bracket-city/', color: '#2f4858' },
  { id: 'wapo-keyword', name: 'Keyword', publisher: 'wapo', url: 'https://www.washingtonpost.com/games/keyword/', color: '#3b3b3b' },
  { id: 'guardian-crosswords', name: 'Guardian crosswords', publisher: 'guardian', url: 'https://www.theguardian.com/crosswords', aliases: ['cryptic', 'quick crossword'], color: '#052962' },

  // LinkedIn: each needs you signed in.
  { id: 'linkedin-queens', name: 'Queens', publisher: 'linkedin', url: 'https://www.linkedin.com/games/queens/', color: '#9b6dd6', note: 'Needs a LinkedIn sign-in' },
  { id: 'linkedin-tango', name: 'Tango', publisher: 'linkedin', url: 'https://www.linkedin.com/games/tango/', color: '#f4a03a', note: 'Needs a LinkedIn sign-in' },
  { id: 'linkedin-zip', name: 'Zip', publisher: 'linkedin', url: 'https://www.linkedin.com/games/zip/', color: '#e8613c', note: 'Needs a LinkedIn sign-in' },
  { id: 'linkedin-pinpoint', name: 'Pinpoint', publisher: 'linkedin', url: 'https://www.linkedin.com/games/pinpoint/', color: '#3a8fd9', note: 'Needs a LinkedIn sign-in' },
  { id: 'linkedin-crossclimb', name: 'Crossclimb', publisher: 'linkedin', url: 'https://www.linkedin.com/games/crossclimb/', color: '#38a385', note: 'Needs a LinkedIn sign-in' },

  // On the dev server only: a stand-in for one of your games (dev/fake-game.html), which says it's done.
  ...(import.meta.env.MODE === 'development'
    ? [{ id: 'fake-game', name: 'Fake game', publisher: 'yours' as const, url: 'dev/fake-game.html', color: '#7d7a8c', firstParty: true }]
    : []),
];

const BY_ID = new Map(CATALOG.map((p) => [p.id, p]));

/** The catalog's puzzle with this id, if there is one. */
export const catalogPuzzle = (id: string) => BY_ID.get(id);

/** How a row names a puzzle's publisher: a puzzle added by link goes by its site. */
export const publisherLabel = (p: Puzzle) => (p.publisher === 'link' ? siteOf(p.url) : PUBLISHERS[p.publisher].label);

/** A site's name from an address: "https://www.nytimes.com/games/wordle" → "nytimes.com". */
export function siteOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** The letter on a puzzle's tile: "The Mini" → "M". */
export const initialOf = (name: string) => (name.replace(/^the\s+/i, '').match(/[\p{L}\p{N}]/u)?.[0] ?? '?').toUpperCase();
