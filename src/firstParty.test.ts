import { describe, expect, it } from 'vitest';
import { readsDone } from './firstParty';

describe('readsDone', () => {
  const strokes = { url: 'https://strokes.fun/', firstParty: true };
  const mountweazel = { url: 'https://funklunsford.github.io/mountweazel/', firstParty: true };
  const wordle = { url: 'https://www.nytimes.com/games/wordle/index.html' };

  it("reads your own games' done keys only on the playlist's own origin", () => {
    const here = 'https://strokes.fun/playlist/';
    expect(readsDone(strokes, here)).toBe(true);
    expect(readsDone(mountweazel, here)).toBe(false);
    // Where the playlist is also published, it's the other way round.
    expect(readsDone(strokes, 'https://funklunsford.github.io/playlist/')).toBe(false);
    expect(readsDone(mountweazel, 'https://funklunsford.github.io/playlist/')).toBe(true);
  });

  it("never for anyone else's game, an unknown one, or one whose address won't parse", () => {
    expect(readsDone(wordle, 'https://strokes.fun/playlist/')).toBe(false);
    expect(readsDone(undefined, 'https://strokes.fun/playlist/')).toBe(false);
    expect(readsDone({ url: 'http://[bad', firstParty: true }, 'https://strokes.fun/playlist/')).toBe(false);
  });

  it('takes a relative address as on the same origin (the dev fake game)', () => {
    expect(readsDone({ url: 'dev/fake-game.html', firstParty: true }, 'http://localhost:5174/')).toBe(true);
  });
});
