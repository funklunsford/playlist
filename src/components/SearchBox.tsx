import { useId, useState } from 'react';
import { catalogPuzzle, publisherLabel, type Puzzle } from '../catalog';
import { pieceColor } from '../pieces';
import { search } from '../search';
import { CheckIcon, ClearIcon, LinkIcon, PlusCircleIcon, SearchIcon } from './icons';
import { Tile } from './Tile';

const SHOWN = 6;

/** What an empty playlist suggests. */
const STARTERS = ['nyt-wordle', 'nyt-connections', 'nyt-strands', 'nyt-mini', 'clues-by-sam', 'strokes', 'mountweazel'];

interface Props {
  /** The ids already in the playlist. */
  added: readonly string[];
  onAdd(id: string): void;
  /** Adds a puzzle by its address; false if the address isn't one. */
  onAddLink(name: string, url: string): boolean;
  /** An empty playlist: the box leads, with suggestions. */
  prominent?: boolean;
}

/** Finding puzzles by name, as a music app finds songs to add to a playlist. */
export function SearchBox({ added, onAdd, onAddLink, prominent }: Props) {
  const [query, setQuery] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState(false);
  const listId = useId();

  const results = query.trim() ? search(query).slice(0, SHOWN) : [];
  const has = (id: string) => added.includes(id);
  const starters = prominent && !query ? STARTERS.filter((id) => !has(id)).flatMap((id) => catalogPuzzle(id) ?? []) : [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const first = results.find((p) => !has(p.id));
    if (first) {
      onAdd(first.id);
      setQuery('');
    }
  };

  const openLink = () => {
    setLinking(true);
    setLinkName(query.trim());
    setLinkError(false);
  };

  const submitLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddLink(linkName, linkUrl)) {
      setLinking(false);
      setLinkName('');
      setLinkUrl('');
      setQuery('');
    } else setLinkError(true);
  };

  /** A puzzle to add, with + (or a tick once it's in). */
  const row = (p: Puzzle, i: number) => (
    <li key={p.id} className="result">
      <Tile puzzle={p} color={pieceColor(i)} size={44} />
      <span className="title">
        <span className="name">{p.name}</span>
        <span className="by">
          {publisherLabel(p)}
          {p.note && ` · ${p.note}`}
        </span>
      </span>
      {has(p.id) ? (
        <span className="added" aria-label={`${p.name} is in your playlist`}>
          <CheckIcon size={20} />
        </span>
      ) : (
        <button type="button" className="add" onClick={() => onAdd(p.id)} aria-label={`Add ${p.name}`}>
          <PlusCircleIcon size={28} />
        </button>
      )}
    </li>
  );

  return (
    <section className={prominent ? 'finder prominent' : 'finder'} aria-label="Add puzzles">
      <h2 className="section-title">Add Puzzles</h2>
      {prominent && <p className="finder-sub">Search for the puzzles you play each day, or start with these.</p>}
      <form className="search" role="search" onSubmit={submit}>
        <SearchIcon size={18} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Wordle, Clues by Sam, NYT Mini…"
          aria-label="Search for a puzzle"
          aria-controls={listId}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="go"
        />
        {query && (
          <button type="button" className="clear" onClick={() => setQuery('')} aria-label="Clear">
            <ClearIcon size={17} />
          </button>
        )}
      </form>

      <ul className="results" id={listId}>
        {results.map(row)}
      </ul>

      {query.trim() && !results.length && !linking && (
        <p className="nothing">
          No puzzle by that name.{' '}
          <button type="button" className="text-button" onClick={openLink}>
            Add it by its address
          </button>
        </p>
      )}

      {starters.length > 0 && (
        <>
          <h3 className="list-header">Suggestions</h3>
          <ul className="results">{starters.map(row)}</ul>
        </>
      )}

      {linking ? (
        <form className="link-form" onSubmit={submitLink}>
          <div className="fields">
            <input value={linkName} onChange={(e) => setLinkName(e.target.value)} placeholder="Name" aria-label="Puzzle name" />
            <input
              value={linkUrl}
              onChange={(e) => {
                setLinkUrl(e.target.value);
                setLinkError(false);
              }}
              placeholder="Address, like example.com/daily"
              aria-label="Puzzle address"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={linkError}
            />
          </div>
          {linkError && <p className="error">That isn't a web address.</p>}
          <div className="link-actions">
            <button type="button" className="button plain" onClick={() => setLinking(false)}>
              Cancel
            </button>
            <button type="submit" className="button filled">
              Add
            </button>
          </div>
        </form>
      ) : (
        !(query.trim() && !results.length) && (
          <button type="button" className="text-button by-link" onClick={openLink}>
            <LinkIcon size={18} /> Add by Link
          </button>
        )
      )}
    </section>
  );
}
