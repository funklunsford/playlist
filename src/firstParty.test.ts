import { describe, expect, it } from 'vitest';
import { readsDone } from './firstParty';

describe('readsDone', () => {
  const strokes = { url: 'https://strokes.fun/', firstParty: true };
  const mountweazel = { url: 'https://funklunsford.github.io/mountweazel/', firstParty: true };
  const wordle = { url: 'https://www.nytimes.com/games/wordle/index.html' };

  const here = 'https://funklunsford.github.io/playlist/';

  it("reads your own games' done keys only on the playlist's own origin", () => {
    expect(readsDone(mountweazel, here)).toBe(true);
    // Strokes is on strokes.fun, out of reach: it's ticked for coming back.
    expect(readsDone(strokes, here)).toBe(false);
  });

  it("never for anyone else's game, an unknown one, or one whose address won't parse", () => {
    expect(readsDone(wordle, here)).toBe(false);
    expect(readsDone(undefined, here)).toBe(false);
    expect(readsDone({ url: 'http://[bad', firstParty: true }, here)).toBe(false);
  });

  it('takes a relative address as on the same origin (the dev fake game)', () => {
    expect(readsDone({ url: 'dev/fake-game.html', firstParty: true }, 'http://localhost:5174/')).toBe(true);
  });
});
