import { describe, expect, it } from 'vitest';
import { catalogPuzzle } from './catalog';
import { doneHash, readDone, resolveDone } from './done';
import { addLink, EMPTY, puzzlesOf } from './playlist';

describe("a check's result in the address", () => {
  it('comes back as it was sent, share text and all', () => {
    const done = { id: 'nyt-connections', url: 'https://www.nytimes.com/games/connections', text: 'Connections\nPuzzle #861\n🟨🟨🟨🟨 & more', score: 'Perfect', how: 'checked' as const };
    expect(readDone(doneHash(done))).toEqual(done);
  });

  it('keeps an unknown game without an id, and its "how"', () => {
    expect(readDone(doneHash({ url: 'https://example.com/daily', how: 'asked' }))).toEqual({ url: 'https://example.com/daily', how: 'asked' });
    expect(readDone('#done=&how=unchecked&url=https%3A%2F%2Fexample.com%2F')).toEqual({ url: 'https://example.com/', how: 'unchecked' });
  });

  it('is nothing without #done=, and keeps text and score within bounds', () => {
    expect(readDone('#add=nyt-wordle')).toBeNull();
    expect(readDone('')).toBeNull();
    const long = readDone(doneHash({ id: 'x', text: 'a'.repeat(5000), score: 'b'.repeat(100), how: 'checked' }))!;
    expect(long.text).toHaveLength(600);
    expect(long.score).toHaveLength(24);
  });
});

describe('which playlist puzzle a check was for', () => {
  const linked = addLink({ ids: ['nyt-wordle', 'clues-by-sam'], links: [] }, 'Daily Set', 'https://www.setgame.com/set/puzzle')!;
  const puzzles = puzzlesOf(linked.list);

  it('goes by id, then by page', () => {
    expect(resolveDone({ id: 'nyt-wordle', how: 'checked' }, puzzles)).toBe('nyt-wordle');
    expect(resolveDone({ url: 'https://www.setgame.com/set/puzzle', how: 'asked' }, puzzles)).toBe(linked.id);
    expect(resolveDone({ id: 'nyt-wordle', url: 'https://cluesbysam.com/', how: 'checked' }, puzzles)).toBe('nyt-wordle');
  });

  it('falls back to the puzzle ▶ opened only for a game it didn\'t know', () => {
    expect(resolveDone({ url: 'https://elsewhere.com/', how: 'asked' }, puzzles, 'clues-by-sam')).toBe('clues-by-sam');
    expect(resolveDone({ id: 'nyt-strands', url: catalogPuzzle('nyt-strands')!.url, how: 'checked' }, puzzles, 'clues-by-sam')).toBeNull();
  });

  it('is nothing for a puzzle not in the playlist', () => {
    expect(resolveDone({ id: 'nyt-strands', how: 'checked' }, puzzlesOf(EMPTY))).toBeNull();
  });
});
