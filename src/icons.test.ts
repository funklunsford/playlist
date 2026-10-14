import { existsSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CATALOG, catalogPuzzle, type Puzzle } from './catalog';
import { coverOf, ICONS, iconsFor, NO_ICON } from './icons';
import { addLink, EMPTY, puzzlesOf } from './playlist';

const file = (name: string) => new URL(`../public/icons/${name}`, import.meta.url);
const ids = (puzzles: Puzzle[]) => puzzles.map((p) => p.id);
const catalog = (...list: string[]) => list.map((id) => catalogPuzzle(id)!);
const linked = (url: string) => {
  const r = addLink(EMPTY, 'A puzzle', url)!;
  return puzzlesOf(r.list)[0];
};

describe('the icons', () => {
  it('cover every catalog puzzle, but for those whose sites have none', () => {
    const missing = CATALOG.filter((p) => !ICONS[p.id]).map((p) => p.id);
    expect(missing).toEqual([...NO_ICON]);
    for (const id of Object.keys(ICONS)) expect(catalogPuzzle(id), id).toBeDefined();
  });

  it('are all here, and small', () => {
    for (const { file: name } of Object.values(ICONS)) {
      expect(existsSync(file(name)), name).toBe(true);
      expect(statSync(file(name)).size, name).toBeLessThan(64_000);
    }
  });

  it("are a catalog puzzle's own copy, kept with the playlist", () => {
    expect(iconsFor(catalogPuzzle('nyt-wordle')!)).toEqual([{ src: 'icons/nyt-wordle.png' }]);
    expect(iconsFor(catalogPuzzle('murdle')!)).toEqual([{ src: 'icons/murdle.png', inset: 0.75, px: 32 }]);
    expect(iconsFor(catalogPuzzle('poeltl')!)).toEqual([]);
  });

  it("for a puzzle added by its address, are its site's home-screen icon, then its favicon", () => {
    expect(iconsFor(linked('https://example.com/games/daily')).map((i) => i.src)).toEqual([
      'https://example.com/apple-touch-icon.png',
      'https://example.com/favicon.ico',
    ]);
  });
});

describe("the playlist's cover", () => {
  it('is the first four puzzles, with four or more', () => {
    expect(ids(coverOf(catalog('nyt-wordle', 'nyt-connections', 'nyt-strands', 'nyt-mini', 'clues-by-sam')))).toEqual([
      'nyt-wordle',
      'nyt-connections',
      'nyt-strands',
      'nyt-mini',
    ]);
    expect(ids(coverOf(catalog('linkedin-queens', 'linkedin-tango', 'linkedin-zip', 'framed')))).toHaveLength(4);
  });

  it("is the first puzzle's icon alone, with fewer than four", () => {
    expect(ids(coverOf(catalog('nyt-wordle', 'nyt-connections', 'nyt-strands')))).toEqual(['nyt-wordle']);
    expect(ids(coverOf(catalog('nyt-wordle', 'nyt-connections')))).toEqual(['nyt-wordle']);
    expect(ids(coverOf(catalog('framed')))).toEqual(['framed']);
    expect(coverOf([])).toEqual([]);
  });
});
