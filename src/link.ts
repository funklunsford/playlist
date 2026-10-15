// A playlist as a link, to send to each other:
//
//   https://strokes.fun/playlist/#add=nyt-wordle,nyt-connections,clues-by-sam,strokes
//
// Catalog puzzles go by id. One added by its address goes as "name|address", URL-encoded, so its commas and
// bars can't be mistaken for the link's own.

import { catalogPuzzle } from './catalog';
import { add, addLink, EMPTY, type Playlist } from './playlist';

const PREFIX = '#add=';

/** What a link holds: catalog ids, and puzzles by address, in order. */
export type Shared = ({ id: string } | { name: string; url: string })[];

/** The link that adds this playlist, at `base` (the playlist's own address). */
export function playlistLink(list: Playlist, base: string): string {
  const links = new Map(list.links.map((l) => [l.id, l]));
  const tokens = list.ids.map((id) => {
    const link = links.get(id);
    return link ? encodeURIComponent(`${link.name.replace(/\|/g, '/')}|${link.url}`) : id;
  });
  return `${base.replace(/#.*$/, '')}${PREFIX}${tokens.join(',')}`;
}

/** The puzzles in a link's #add= part, or null if it has none. Ids the catalog doesn't know are left out. */
export function readLink(hash: string): Shared | null {
  if (!hash.startsWith(PREFIX)) return null;
  const shared: Shared = [];
  for (const token of hash.slice(PREFIX.length).split(',')) {
    let text: string;
    try {
      text = decodeURIComponent(token).trim();
    } catch {
      continue;
    }
    const bar = text.indexOf('|');
    if (bar > 0) shared.push({ name: text.slice(0, bar), url: text.slice(bar + 1) });
    else if (catalogPuzzle(text)) shared.push({ id: text });
  }
  return shared.length ? shared : null;
}

/** A playlist with a link's puzzles added at the end; ones already there stay where they are. */
export function withShared(list: Playlist, shared: Shared): Playlist {
  let out = list;
  for (const s of shared) out = 'id' in s ? add(out, s.id) : (addLink(out, s.name, s.url)?.list ?? out);
  return out;
}

/** Just a link's puzzles, in its order: "Replace mine". */
export const fromShared = (shared: Shared) => withShared(EMPTY, shared);
