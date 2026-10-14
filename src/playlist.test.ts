import { describe, expect, it } from 'vitest';
import { EMPTY, NEW_PLAYLIST, add, addLink, move, normalizeUrl, puzzlesOf, remove } from './playlist';
import { ITEMS_KEY, loadPlaylist, memoryStorage, savePlaylist } from './store';

describe('the playlist', () => {
  it('adds catalog puzzles at the end, once each', () => {
    let list = add(EMPTY, 'nyt-wordle');
    list = add(list, 'strokes');
    list = add(list, 'nyt-wordle');
    expect(list.ids).toEqual(['nyt-wordle', 'strokes']);
    expect(puzzlesOf(list).map((p) => p.name)).toEqual(['Wordle', 'Strokes']);
  });

  it("doesn't add an id the catalog doesn't have", () => {
    expect(add(EMPTY, 'no-such-puzzle')).toBe(EMPTY);
  });

  it('adds a puzzle by its address, once, named as typed or after its site', () => {
    const first = addLink(EMPTY, 'Daily Set', 'setgame.com/set/puzzle')!;
    expect(first.list.links).toEqual([{ id: first.id, name: 'Daily Set', url: 'https://setgame.com/set/puzzle' }]);
    expect(puzzlesOf(first.list)[0]).toMatchObject({ name: 'Daily Set', publisher: 'link', url: 'https://setgame.com/set/puzzle' });

    const again = addLink(first.list, 'Set again', 'https://setgame.com/set/puzzle')!;
    expect(again.list).toBe(first.list);
    expect(again.id).toBe(first.id);

    expect(addLink(EMPTY, '  ', 'https://www.example.com/')!.list.links[0].name).toBe('example.com');
  });

  it("refuses an address that isn't one", () => {
    expect(addLink(EMPTY, 'Nope', 'not an address')).toBeNull();
    expect(addLink(EMPTY, 'Nope', 'javascript:alert(1)')).toBeNull();
  });

  it('removes a puzzle, and forgets a linked one entirely', () => {
    const { list, id } = addLink(add(EMPTY, 'nyt-wordle'), 'Mine', 'https://example.com/')!;
    expect(remove(list, id)).toEqual({ ids: ['nyt-wordle'], links: [] });
    expect(remove(list, 'nyt-wordle').ids).toEqual([id]);
  });

  it('moves a puzzle up or down', () => {
    const list = { ids: ['a', 'b', 'c', 'd'], links: [] };
    expect(move(list, 0, 2).ids).toEqual(['b', 'c', 'a', 'd']);
    expect(move(list, 3, 0).ids).toEqual(['d', 'a', 'b', 'c']);
    expect(move(list, 1, 9).ids).toEqual(['a', 'c', 'd', 'b']);
    expect(move(list, 2, 2)).toBe(list);
  });

  it('leaves out ids the catalog no longer has', () => {
    expect(puzzlesOf({ ids: ['gone', 'nyt-strands'], links: [] }).map((p) => p.id)).toEqual(['nyt-strands']);
  });
});

describe('normalizeUrl', () => {
  it('adds https:// and keeps http and https only', () => {
    expect(normalizeUrl(' octordle.com ')).toBe('https://octordle.com/');
    expect(normalizeUrl('http://example.com/a?b=c')).toBe('http://example.com/a?b=c');
    expect(normalizeUrl('ftp://example.com')).toBeNull();
    expect(normalizeUrl('wordle')).toBeNull();
    expect(normalizeUrl('')).toBeNull();
  });
});

describe('the saved playlist', () => {
  it('comes back as it was saved', () => {
    const kv = memoryStorage();
    const { list } = addLink(add(EMPTY, 'nyt-wordle'), 'Mine', 'https://example.com/')!;
    savePlaylist(kv, list);
    expect(loadPlaylist(kv)).toEqual(list);
  });

  it('starts with your own two games when there is none yet', () => {
    expect(loadPlaylist(memoryStorage())).toEqual(NEW_PLAYLIST);
    expect(puzzlesOf(NEW_PLAYLIST).map((p) => p.name)).toEqual(['Strokes', 'Mountweazel']);
  });

  it('stays empty once emptied, and is empty when unreadable', () => {
    const kv = memoryStorage();
    savePlaylist(kv, EMPTY);
    expect(loadPlaylist(kv)).toEqual(EMPTY);
    kv.setItem(ITEMS_KEY, '{not json');
    expect(loadPlaylist(kv)).toEqual(EMPTY);
    kv.setItem(ITEMS_KEY, JSON.stringify({ ids: ['nyt-wordle', 3], links: [{ id: 'x' }] }));
    expect(loadPlaylist(kv)).toEqual({ ids: ['nyt-wordle'], links: [] });
  });
});
