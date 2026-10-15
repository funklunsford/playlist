import { describe, expect, it } from 'vitest';
import { fromShared, playlistLink, readLink, withShared } from './link';
import { add, addLink, EMPTY, puzzlesOf } from './playlist';

const BASE = 'https://funklunsford.github.io/playlist/';

describe('playlist links', () => {
  it('carry catalog puzzles by id, in order', () => {
    const list = add(add(add(EMPTY, 'nyt-wordle'), 'clues-by-sam'), 'strokes');
    expect(playlistLink(list, BASE)).toBe(`${BASE}#add=nyt-wordle,clues-by-sam,strokes`);
  });

  it('come back as the same playlist, puzzles added by address included', () => {
    const { list } = addLink(add(EMPTY, 'nyt-connections'), 'Set, the daily | puzzle', 'https://www.setgame.com/set/puzzle?a=1,2')!;
    const link = playlistLink(list, `${BASE}#add=old`);
    const shared = readLink(link.slice(link.indexOf('#')))!;
    expect(puzzlesOf(fromShared(shared)).map((p) => [p.name, p.url])).toEqual([
      ['Connections', 'https://www.nytimes.com/games/connections'],
      ['Set, the daily / puzzle', 'https://www.setgame.com/set/puzzle?a=1,2'],
    ]);
  });

  it('leave out ids the catalog does not know, and say nothing when nothing is left', () => {
    expect(readLink('#add=nyt-wordle,no-such-puzzle')).toEqual([{ id: 'nyt-wordle' }]);
    expect(readLink('#add=no-such-puzzle')).toBeNull();
    expect(readLink('#add=')).toBeNull();
    expect(readLink('#gallery')).toBeNull();
    expect(readLink('')).toBeNull();
  });

  it('survive a bad escape', () => {
    expect(readLink('#add=%E0%A4%A,nyt-strands')).toEqual([{ id: 'nyt-strands' }]);
  });

  it("add a link's puzzles after yours, leaving the ones you have where they are", () => {
    const mine = add(add(EMPTY, 'strokes'), 'nyt-wordle');
    const merged = withShared(mine, [{ id: 'nyt-wordle' }, { id: 'nyt-connections' }, { name: 'Set', url: 'setgame.com/set/puzzle' }]);
    expect(puzzlesOf(merged).map((p) => p.name)).toEqual(['Strokes', 'Wordle', 'Connections', 'Set']);
  });

  it("replace yours with just the link's", () => {
    expect(fromShared([{ id: 'nyt-strands' }, { id: 'strokes' }]).ids).toEqual(['nyt-strands', 'strokes']);
  });
});
