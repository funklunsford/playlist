// What the playlist keeps in this browser's localStorage, under keys that start "playlist:". The origin is
// shared with Strokes ("strokes:…") and Mountweazel ("mountweazel-…"), so the prefix keeps them apart.

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
