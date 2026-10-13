import { describe, expect, it } from 'vitest';
import { arrive, barFor, mark, nextUp, type ArriveInput, type Day, type Launch } from './player';

const TODAY = '2026-10-13';
const NOW = 1_000_000;
const launch = (id: string, over: Partial<Launch> = {}): Launch => ({ id, date: TODAY, at: NOW - 60_000, handled: false, ...over });
const yours = new Set(['strokes', 'mountweazel']);

const input = (over: Partial<ArriveInput>): ArriveInput => ({
  today: TODAY,
  now: NOW,
  arrival: 'back',
  launch: null,
  day: {},
  signals: {},
  reportsDone: (id) => yours.has(id),
  ...over,
});

describe('coming back to the playlist', () => {
  it('ticks the puzzle you went to, offers the next, and handles the launch', () => {
    const r = arrive(input({ launch: launch('nyt-wordle') }));
    expect(r.day['nyt-wordle']).toEqual({ status: 'done', at: NOW });
    expect(r.back).toEqual({ id: 'nyt-wordle', ticked: true });
    expect(r.launch?.handled).toBe(true);
    expect(r.changed).toBe(true);
  });

  it('opened fresh, still ticks a launch from earlier today, but shows no "back"', () => {
    const r = arrive(input({ arrival: 'fresh', launch: launch('nyt-wordle') }));
    expect(r.day['nyt-wordle']?.status).toBe('done');
    expect(r.back).toBeNull();
  });

  it("drops a launch from another day, ticking nothing", () => {
    const r = arrive(input({ launch: launch('nyt-wordle', { date: '2026-10-12' }) }));
    expect(r.day).toEqual({});
    expect(r.launch).toBeNull();
    expect(r.back).toBeNull();
    expect(r.changed).toBe(true);
  });

  it("doesn't tick one of your games that hasn't said it's done", () => {
    const r = arrive(input({ launch: launch('strokes') }));
    expect(r.day.strokes).toBeUndefined();
    expect(r.back).toEqual({ id: 'strokes', ticked: false });
  });

  it('ticks one of your games that said it was done, at the time it said so', () => {
    const r = arrive(input({ launch: launch('strokes'), signals: { strokes: NOW - 5_000 } }));
    expect(r.day.strokes).toEqual({ status: 'done', at: NOW - 5_000 });
    expect(r.back).toEqual({ id: 'strokes', ticked: true });
  });

  it('ticks your game from its signal even when it was played without the playlist', () => {
    const r = arrive(input({ arrival: 'fresh', signals: { strokes: NOW - 5_000 } }));
    expect(r.day.strokes?.status).toBe('done');
    expect(r.changed).toBe(true);
  });

  it('handles a launch once: after Not yet, a second Back (or a restore) leaves it unticked', () => {
    const first = arrive(input({ launch: launch('nyt-wordle') }));
    const notYet = mark(first.day, 'nyt-wordle', 'todo', NOW + 1);
    const again = arrive(input({ launch: first.launch, day: notYet, now: NOW + 2 }));
    expect(again.day['nyt-wordle']?.status).toBe('todo');
    expect(again.back).toBeNull();
    expect(again.changed).toBe(false);
  });

  it("keeps your Not yet over a game's older signal, but not over a newer one", () => {
    const notYet: Day = { strokes: { status: 'todo', at: NOW } };
    expect(arrive(input({ day: notYet, signals: { strokes: NOW - 1 } })).day.strokes?.status).toBe('todo');
    expect(arrive(input({ day: notYet, signals: { strokes: NOW + 1 } })).day.strokes?.status).toBe('done');
  });

  it("doesn't re-time a puzzle already done when you come back from it again", () => {
    const day: Day = { 'nyt-wordle': { status: 'done', at: 5 } };
    expect(arrive(input({ launch: launch('nyt-wordle'), day })).day['nyt-wordle']).toEqual({ status: 'done', at: 5 });
  });

  it('changes nothing with no launch and no signals', () => {
    const day: Day = { 'nyt-wordle': { status: 'done', at: 5 } };
    const r = arrive(input({ day }));
    expect(r.day).toBe(day);
    expect(r.changed).toBe(false);
  });
});

describe('what plays next', () => {
  const ids = ['a', 'b', 'c', 'd'];

  it('is the first unplayed puzzle from the top', () => {
    expect(nextUp(ids, {})).toBe('a');
    expect(nextUp(ids, { a: { status: 'done', at: 1 }, b: { status: 'skipped', at: 1 } })).toBe('c');
  });

  it('after a puzzle, is the next unplayed one, wrapping round to the top', () => {
    const day: Day = { c: { status: 'done', at: 1 } };
    expect(nextUp(ids, day, 'b')).toBe('d');
    expect(nextUp(ids, { ...day, d: { status: 'done', at: 1 } }, 'b')).toBe('a');
  });

  it('counts a Not yet as unplayed, but never offers the puzzle you just came back from', () => {
    const day: Day = { a: { status: 'todo', at: 1 }, b: { status: 'done', at: 1 }, c: { status: 'done', at: 1 }, d: { status: 'done', at: 1 } };
    expect(nextUp(ids, day)).toBe('a');
    expect(nextUp(ids, day, 'a')).toBeNull();
  });

  it('is nothing when everything is done or skipped', () => {
    const all: Day = Object.fromEntries(ids.map((id) => [id, { status: 'done', at: 1 }]));
    expect(nextUp(ids, all)).toBeNull();
  });
});

describe('the bottom bar', () => {
  const ids = ['nyt-wordle', 'nyt-connections', 'strokes'];

  it('after coming back, says what you came back from and what is next', () => {
    const day: Day = { 'nyt-wordle': { status: 'done', at: 1 } };
    expect(barFor(ids, day, { id: 'nyt-wordle', ticked: true })).toEqual({ kind: 'back', from: 'nyt-wordle', ticked: true, next: 'nyt-connections' });
  });

  it('after Not yet, shows the puzzle you came back from as unticked', () => {
    const day: Day = { 'nyt-wordle': { status: 'todo', at: 2 } };
    expect(barFor(ids, day, { id: 'nyt-wordle', ticked: true })).toMatchObject({ kind: 'back', ticked: false });
  });

  it('otherwise offers the first unplayed puzzle, noting whether today has started', () => {
    expect(barFor(ids, {}, null)).toEqual({ kind: 'ready', next: 'nyt-wordle', started: false });
    expect(barFor(ids, { 'nyt-wordle': { status: 'skipped', at: 1 } }, null)).toEqual({ kind: 'ready', next: 'nyt-connections', started: true });
  });

  it('is all done after coming back from the last one, which Not yet can still un-tick', () => {
    const all: Day = Object.fromEntries(ids.map((id) => [id, { status: 'done', at: 1 }]));
    expect(barFor(ids, all, { id: 'strokes', ticked: true })).toEqual({ kind: 'all-done', from: 'strokes' });
    const notDone = { ...all, strokes: { status: 'todo' as const, at: 2 } };
    expect(barFor(ids, notDone, { id: 'strokes', ticked: true })).toEqual({ kind: 'back', from: 'strokes', ticked: false, next: null });
  });

  it('is all done when nothing is left, and empty with no puzzles', () => {
    const all: Day = Object.fromEntries(ids.map((id) => [id, { status: 'done', at: 1 }]));
    expect(barFor(ids, all, null)).toEqual({ kind: 'all-done' });
    expect(barFor([], {}, null)).toEqual({ kind: 'empty' });
  });

  it('forgets a "back" for a puzzle no longer in the playlist', () => {
    expect(barFor(ids, {}, { id: 'gone', ticked: true }).kind).toBe('ready');
  });
});
