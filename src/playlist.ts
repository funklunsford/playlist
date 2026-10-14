// Your playlist: which puzzles, in what order. Changes make a new playlist, never alter the old one.

import { catalogPuzzle, type Puzzle } from './catalog';

/** A puzzle added by its address rather than from the catalog. */
export interface LinkPuzzle {
  id: string;
  name: string;
  url: string;
}

export interface Playlist {
  /** Puzzle ids in play order: the catalog's, and those of `links`. */
  ids: string[];
  links: LinkPuzzle[];
}

export const EMPTY: Playlist = { ids: [], links: [] };

/** A new playlist, the first time a device opens the page: your own two games, then Connections and Wordle. */
export const NEW_PLAYLIST: Playlist = { ids: ['strokes', 'mountweazel', 'nyt-connections', 'nyt-wordle'], links: [] };

/** Tile colours for puzzles added by link, picked by their id. */
const LINK_COLORS = ['#7a5af8', '#e0644f', '#2f9e8f', '#c98a1b', '#3f7fd8', '#b8487a', '#5d8a2f', '#6a6f86'];

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

const asPuzzle = (link: LinkPuzzle): Puzzle => ({
  id: link.id,
  name: link.name,
  publisher: 'link',
  url: link.url,
  color: LINK_COLORS[hash(link.id) % LINK_COLORS.length],
});

/** The playlist's puzzles in order. Ids the catalog no longer has are left out. */
export function puzzlesOf(list: Playlist): Puzzle[] {
  const links = new Map(list.links.map((l) => [l.id, l]));
  return list.ids.flatMap((id) => {
    const p = catalogPuzzle(id) ?? (links.has(id) ? asPuzzle(links.get(id)!) : undefined);
    return p ? [p] : [];
  });
}

/** The playlist with a catalog puzzle added at the end (unchanged if it's already there). */
export function add(list: Playlist, id: string): Playlist {
  if (list.ids.includes(id) || !catalogPuzzle(id)) return list;
  return { ...list, ids: [...list.ids, id] };
}

/** An address as typed, made whole: "octordle.com" → "https://octordle.com/". Null if it isn't a web address. */
export function normalizeUrl(typed: string): string | null {
  const text = typed.trim();
  if (!text || /\s/.test(text)) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (!url.hostname.includes('.') && url.hostname !== 'localhost') return null;
    return url.href;
  } catch {
    return null;
  }
}

/** The playlist with a puzzle added at the end by its address, or null if the address isn't one. */
export function addLink(list: Playlist, name: string, typedUrl: string): { list: Playlist; id: string } | null {
  const url = normalizeUrl(typedUrl);
  if (!url) return null;
  const same = list.links.find((l) => l.url === url);
  if (same) return { list, id: same.id };
  const id = `link-${hash(url).toString(36)}`;
  const link = { id, name: name.trim() || new URL(url).hostname.replace(/^www\./, ''), url };
  return { list: { ids: [...list.ids, id], links: [...list.links, link] }, id };
}

/** The playlist without a puzzle. */
export function remove(list: Playlist, id: string): Playlist {
  return { ids: list.ids.filter((i) => i !== id), links: list.links.filter((l) => l.id !== id) };
}

/** The playlist with the puzzle at `from` moved to `to` (both places in `ids`). */
export function move(list: Playlist, from: number, to: number): Playlist {
  if (from === to || from < 0 || from >= list.ids.length) return list;
  const ids = [...list.ids];
  const [id] = ids.splice(from, 1);
  ids.splice(Math.max(0, Math.min(to, ids.length)), 0, id);
  return { ...list, ids };
}
