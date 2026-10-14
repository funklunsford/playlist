import { describe, expect, it } from 'vitest';
import { mark, nextUp, type Day } from './player';
import { playOrder, SHUFFLE_OFF } from './shuffle';

const DATE = '2026-10-14';
const ids = ['nyt-wordle', 'nyt-connections', 'nyt-strands', 'nyt-mini', 'clues-by-sam', 'strokes', 'framed', 'octordle'];
const on = (seed: number) => ({ on: true, seed });

describe('the play order', () => {
  it("is the list's own with Shuffle off", () => {
    expect(playOrder(ids, SHUFFLE_OFF, DATE)).toBe(ids);
  });

  it('with Shuffle on, has every puzzle once', () => {
    const order = playOrder(ids, on(7), DATE);
    expect([...order].sort()).toEqual([...ids].sort());
  });

  it('is the same every time for the same seed and date, so it holds across going and coming back', () => {
    expect(playOrder(ids, on(7), DATE)).toEqual(playOrder([...ids], on(7), DATE));
  });

  it('changes with a new seed, and with a new day', () => {
    const bySeed = new Set([1, 2, 3, 4, 5].map((seed) => playOrder(ids, on(seed), DATE).join()));
    const byDate = new Set(['2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17'].map((date) => playOrder(ids, on(7), date).join()));
    expect(bySeed.size).toBeGreaterThan(1);
    expect(byDate.size).toBeGreaterThan(1);
  });

  it("isn't the list's order, for most seeds", () => {
    const same = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((seed) => playOrder(ids, on(seed), DATE).join() === ids.join());
    expect(same.length).toBeLessThan(2);
  });

  it("keeps the others' order when a puzzle is added or removed", () => {
    const order = playOrder(ids, on(7), DATE);
    expect(playOrder([...ids, 'waffle'], on(7), DATE).filter((id) => id !== 'waffle')).toEqual(order);
    expect(playOrder(ids.slice(1), on(7), DATE)).toEqual(order.filter((id) => id !== ids[0]));
  });

  it('plays every puzzle once, in its order, with Next after each', () => {
    const order = playOrder(ids, on(7), DATE);
    const played: string[] = [];
    let day: Day = {};
    for (let id = nextUp(order, day); id; id = nextUp(order, day, id)) {
      played.push(id);
      day = mark(day, id, 'done', 1);
    }
    expect(played).toEqual(order);
  });
});
