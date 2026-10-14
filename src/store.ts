// What the playlist keeps in this browser's localStorage, under keys that start "playlist:". The origin is
// shared with Strokes ("strokes:…") and Mountweazel ("mountweazel-…"), so the prefix keeps them apart.

import { addDays } from './day';
import { signalDate } from './firstParty';
import type { Day, Launch, Mark } from './player';
import { EMPTY, type LinkPuzzle, type Playlist } from './playlist';

/** The part of localStorage the playlist uses, so tests can hand it a stand-in. */
export interface KeyValue {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  key(index: number): string | null;
  readonly length: number;
}

/** A KeyValue that keeps nothing past the page: for tests, and for a browser that blocks storage. */
export function memoryStorage(): KeyValue {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
    key: (i) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  };
}

/** This browser's localStorage, or a stand-in if it's blocked (the playlist then works without saving). */
export function browserStorage(): KeyValue {
  try {
    const probe = 'playlist:probe';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return memoryStorage();
  }
}

/** A stored JSON value, or null if it's missing or unreadable. */
export function readJson(kv: KeyValue, key: string): unknown {
  try {
    const text = kv.getItem(key);
    return text == null ? null : JSON.parse(text);
  } catch {
    return null;
  }
}

/** Stores a JSON value; a full or blocked storage just means it isn't kept. */
export function writeJson(kv: KeyValue, key: string, value: unknown) {
  try {
    kv.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: play on without saving */
  }
}

export const ITEMS_KEY = 'playlist:items';

const isLink = (v: unknown): v is LinkPuzzle =>
  !!v && typeof v === 'object' && ['id', 'name', 'url'].every((k) => typeof (v as Record<string, unknown>)[k] === 'string');

/** The saved playlist, or an empty one if there's none (or it can't be read). */
export function loadPlaylist(kv: KeyValue): Playlist {
  const v = readJson(kv, ITEMS_KEY) as Partial<Playlist> | null;
  if (!v || !Array.isArray(v.ids)) return EMPTY;
  return {
    ids: v.ids.filter((id): id is string => typeof id === 'string'),
    links: Array.isArray(v.links) ? v.links.filter(isLink) : [],
  };
}

export const savePlaylist = (kv: KeyValue, list: Playlist) => writeJson(kv, ITEMS_KEY, list);

// ---- Today's marks, and the puzzle ▶ last opened. ----

export const dayKey = (date: string) => `playlist:day:${date}`;
export const LAUNCH_KEY = 'playlist:launch';
const DAY_PREFIX = 'playlist:day:';

const STATUSES = new Set(['done', 'skipped', 'todo']);

/** The marks for a date, leaving out any that can't be read. */
export function loadDay(kv: KeyValue, date: string): Day {
  const v = readJson(kv, dayKey(date));
  if (!v || typeof v !== 'object') return {};
  const day: Day = {};
  for (const [id, m] of Object.entries(v as Record<string, Partial<Mark>>)) {
    if (!m || !STATUSES.has(m.status as string) || typeof m.at !== 'number') continue;
    const mark: Mark = { status: m.status as Mark['status'], at: m.at };
    if (typeof m.score === 'string') mark.score = m.score.slice(0, 24);
    if (typeof m.share === 'string') mark.share = m.share.slice(0, 600);
    day[id] = mark;
  }
  return day;
}

export const saveDay = (kv: KeyValue, date: string, day: Day) => writeJson(kv, dayKey(date), day);

export function loadLaunch(kv: KeyValue): Launch | null {
  const v = readJson(kv, LAUNCH_KEY) as Partial<Launch> | null;
  if (!v || typeof v.id !== 'string' || typeof v.date !== 'string' || typeof v.at !== 'number') return null;
  return { id: v.id, date: v.date, at: v.at, handled: v.handled === true };
}

export function saveLaunch(kv: KeyValue, launch: Launch | null) {
  if (launch) writeJson(kv, LAUNCH_KEY, launch);
  else
    try {
      kv.removeItem(LAUNCH_KEY);
    } catch {
      /* blocked: nothing was saved either */
    }
}

/** Forgets days older than `keepDays`: the playlist's marks, and your games' done signals. */
export function prune(kv: KeyValue, today: string, keepDays = 90) {
  const oldest = addDays(today, -keepDays);
  const stale: string[] = [];
  for (let i = 0; i < kv.length; i++) {
    const key = kv.key(i);
    const date = key?.startsWith(DAY_PREFIX) ? key.slice(DAY_PREFIX.length) : key && signalDate(key);
    if (key && date && date < oldest) stale.push(key);
  }
  for (const key of stale)
    try {
      kv.removeItem(key);
    } catch {
      /* blocked: nothing to tidy */
    }
}
