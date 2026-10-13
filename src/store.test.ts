import { describe, expect, it } from 'vitest';
import { doneKey, parseDoneKey, readSignals } from './firstParty';
import { dayKey, LAUNCH_KEY, loadDay, loadLaunch, memoryStorage, prune, saveDay, saveLaunch } from './store';

describe("today's marks", () => {
  it('come back as saved, per date', () => {
    const kv = memoryStorage();
    saveDay(kv, '2026-10-13', { 'nyt-wordle': { status: 'done', at: 5 }, strokes: { status: 'todo', at: 6 } });
    expect(loadDay(kv, '2026-10-13')).toEqual({ 'nyt-wordle': { status: 'done', at: 5 }, strokes: { status: 'todo', at: 6 } });
    expect(loadDay(kv, '2026-10-14')).toEqual({});
  });

  it('leave out what they cannot read', () => {
    const kv = memoryStorage();
    kv.setItem(dayKey('2026-10-13'), JSON.stringify({ a: { status: 'done', at: 1 }, b: { status: 'won', at: 1 }, c: { status: 'done' }, d: null }));
    expect(loadDay(kv, '2026-10-13')).toEqual({ a: { status: 'done', at: 1 } });
    kv.setItem(dayKey('2026-10-14'), 'nonsense');
    expect(loadDay(kv, '2026-10-14')).toEqual({});
  });
});

describe('the saved launch', () => {
  it('comes back as saved, and goes when cleared', () => {
    const kv = memoryStorage();
    saveLaunch(kv, { id: 'nyt-wordle', date: '2026-10-13', at: 5, handled: false });
    expect(loadLaunch(kv)).toEqual({ id: 'nyt-wordle', date: '2026-10-13', at: 5, handled: false });
    saveLaunch(kv, null);
    expect(kv.getItem(LAUNCH_KEY)).toBeNull();
    expect(loadLaunch(kv)).toBeNull();
  });

  it('is nothing when unreadable', () => {
    const kv = memoryStorage();
    kv.setItem(LAUNCH_KEY, JSON.stringify({ id: 3 }));
    expect(loadLaunch(kv)).toBeNull();
  });
});

describe('pruning', () => {
  it('forgets marks and done signals older than 90 days, and nothing else', () => {
    const kv = memoryStorage();
    for (const key of [dayKey('2026-07-14'), dayKey('2026-07-15'), doneKey('strokes', '2026-07-01'), doneKey('strokes', '2026-10-13'), 'strokes:result5:2026-01-01', 'playlist:items'])
      kv.setItem(key, '{}');
    prune(kv, '2026-10-13');
    const left = Array.from({ length: kv.length }, (_, i) => kv.key(i));
    expect(left.sort()).toEqual([dayKey('2026-07-15'), 'playlist:items', doneKey('strokes', '2026-10-13'), 'strokes:result5:2026-01-01'].sort());
  });
});

describe('done signals', () => {
  it("read each game's time on a date", () => {
    const kv = memoryStorage();
    kv.setItem(doneKey('strokes', '2026-10-13'), JSON.stringify({ at: 42, share: 'Strokes 3 under par' }));
    kv.setItem(doneKey('mountweazel', '2026-10-13'), 'not json');
    kv.setItem(doneKey('strokes', '2026-10-12'), JSON.stringify({ at: 7 }));
    expect(readSignals(kv, ['strokes', 'mountweazel', 'nyt-wordle'], '2026-10-13')).toEqual({ strokes: 42, mountweazel: 0 });
  });

  it('have keys that say which game and date', () => {
    expect(parseDoneKey('puzzle-done:strokes:2026-10-13')).toEqual({ game: 'strokes', date: '2026-10-13' });
    expect(parseDoneKey('puzzle-done:strokes')).toBeNull();
    expect(parseDoneKey('puzzle-done::2026-10-13')).toBeNull();
    expect(parseDoneKey('playlist:day:2026-10-13')).toBeNull();
  });
});
