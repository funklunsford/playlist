import { describe, expect, it } from 'vitest';
import { CATALOG } from './catalog';
import { editDistance, search, siteWords, words } from './search';

const top = (query: string) => search(query)[0]?.name;
const ids = (query: string) => search(query).map((p) => p.id);
const nyt = CATALOG.filter((p) => p.publisher === 'nyt').map((p) => p.id);

describe('search', () => {
  it.each([
    ['wordel', 'Wordle'],
    ['conections', 'Connections'],
    ['nyt mini', 'The Mini'],
    ['sam', 'Clues by Sam'],
    ['cluesbysam', 'Clues by Sam'],
    ['clues by sam', 'Clues by Sam'],
    ['bee', 'Spelling Bee'],
    ['octo', 'Octordle'],
    ['quardle', 'Quordle'],
    ['mountweasel', 'Mountweazel'],
    ['puzzmo', 'Puzzmo'],
    ['strand', 'Strands'],
    ['murdel', 'Murdle'],
    ['costco', 'Costcodle'],
    ['diplets', 'Strokes'],
    ['the mini', 'The Mini'],
    ['conecti', 'Connections'],
    ['Wordle', 'Wordle'],
  ])('finds %j as %s', (query, name) => {
    expect(top(query)).toBe(name);
  });

  it('finds every NYT game, and only those, by "nyt" or "nytimes"', () => {
    for (const q of ['nyt', 'nytimes', 'new york times']) expect(ids(q).sort()).toEqual([...nyt].sort());
  });

  it('keeps the catalog order among equals, so "nyt" starts with Wordle', () => {
    expect(ids('nyt').slice(0, 3)).toEqual(['nyt-wordle', 'nyt-connections', 'nyt-strands']);
  });

  it('finds every LinkedIn game by "linkedin"', () => {
    expect(ids('linkedin')).toHaveLength(CATALOG.filter((p) => p.publisher === 'linkedin').length);
  });

  it('finds your own games by "yours"', () => {
    expect(ids('yours')).toEqual(['strokes', 'mountweazel']);
  });

  it('needs every word to match something', () => {
    expect(search('wordle chess')).toEqual([]);
    expect(search('xyzzy')).toEqual([]);
  });

  it('finds nothing for nothing', () => {
    expect(search('')).toEqual([]);
    expect(search('  ,. ')).toEqual([]);
  });
});

describe('words', () => {
  it('lowers case and drops accents and punctuation', () => {
    expect(words("Café's  Crossword—Mini!")).toEqual(['cafe', 's', 'crossword', 'mini']);
  });
});

describe('siteWords', () => {
  it("is the site's name without www, the top-level domain or words like game", () => {
    expect(siteWords('https://worldle.teuteuf.fr/')).toEqual(['worldle', 'teuteuf']);
    expect(siteWords('https://globle-game.com/')).toEqual(['globle']);
    expect(siteWords('https://www.merriam-webster.com/games/octordle/')).toEqual(['merriam', 'webster']);
    expect(siteWords('https://funklunsford.github.io/strokes/')).toEqual(['funklunsford']);
    expect(siteWords('not a url')).toEqual([]);
  });
});

describe('editDistance', () => {
  it('counts an insertion, deletion, change or swap of neighbours as one', () => {
    expect(editDistance('wordle', 'wordle', 2)).toBe(0);
    expect(editDistance('wordel', 'wordle', 2)).toBe(1);
    expect(editDistance('conections', 'connections', 2)).toBe(1);
    expect(editDistance('quardle', 'quordle', 2)).toBe(1);
    expect(editDistance('wrdle', 'wordle', 2)).toBe(1);
  });

  it('stops counting past the most it was asked about', () => {
    expect(editDistance('abcdef', 'uvwxyz', 1)).toBe(2);
    expect(editDistance('a', 'abcdef', 2)).toBe(3);
  });
});
