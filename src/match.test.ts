import { describe, expect, it } from 'vitest';
import { belongs, findPuzzle } from './match';

describe("which puzzle a page is", () => {
  it('is the same site, at or under the puzzle\'s path', () => {
    expect(belongs('https://www.nytimes.com/games/wordle/index.html', 'https://www.nytimes.com/games/wordle/index.html')).toBeGreaterThanOrEqual(0);
    expect(belongs('https://www.nytimes.com/games/wordle/index.html', 'https://nytimes.com/games/wordle/')).toBeGreaterThanOrEqual(0);
    expect(belongs('https://www.nytimes.com/games/connections', 'https://www.nytimes.com/games/connections/archive')).toBeGreaterThanOrEqual(0);
    expect(belongs('https://www.merriam-webster.com/games/octordle/', 'https://www.merriam-webster.com/games/octordle/?mode=daily')).toBeGreaterThanOrEqual(0);
    expect(belongs('https://cluesbysam.com/', 'https://cluesbysam.com/s/archive')).toBe(0);
  });

  it("isn't another game on the same site, or another site", () => {
    expect(belongs('https://www.nytimes.com/games/connections', 'https://www.nytimes.com/games/connections-sports')).toBe(-1);
    expect(belongs('https://www.merriam-webster.com/games/octordle/', 'https://www.merriam-webster.com/')).toBe(-1);
    expect(belongs('https://framed.wtf/', 'https://notframed.wtf/')).toBe(-1);
    expect(belongs('not a url', 'https://framed.wtf/')).toBe(-1);
  });

  it('picks the most specific puzzle when several match', () => {
    const puzzles = [{ url: 'https://example.com/' }, { url: 'https://example.com/games/daily' }];
    expect(findPuzzle(puzzles, 'https://example.com/games/daily/today')).toBe(puzzles[1]);
    expect(findPuzzle(puzzles, 'https://example.com/about')).toBe(puzzles[0]);
    expect(findPuzzle(puzzles, 'https://elsewhere.com/')).toBeUndefined();
  });
});
