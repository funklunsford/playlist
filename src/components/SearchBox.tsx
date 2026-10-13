import { useId, useState } from 'react';
import { catalogPuzzle, publisherLabel } from '../catalog';
import { search } from '../search';
import { CheckIcon, CloseIcon, LinkIcon, PlusIcon, SearchIcon } from './icons';
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

/** Finding puzzles by name, as in Spotify's "find something for your playlist". */
export function SearchBox({ added, onAdd, onAddLink, prominent }: Props) {
  const [query, setQuery] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState(false);
  const listId = useId();

  const results = query.trim() ? search(query).slice(0, SHOWN) : [];
  const has = (id: string) => added.includes(id);

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

  return (
    <section className={prominent ? 'finder prominent' : 'finder'} aria-label="Add puzzles">
      {prominent ? <h2>Add your puzzles</h2> : <h2 className="finder-title">Find puzzles for your playlist</h2>}
      <form className="search" role="search" onSubmit={submit}>
        <SearchIcon />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="wordle, clues by sam, nyt mini…"
          aria-label="Search for a puzzle"
          aria-controls={listId}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="go"
        />
        {query && (
          <button type="button" className="icon-button" onClick={() => setQuery('')} aria-label="Clear">
            <CloseIcon size={18} />
          </button>
        )}
      </form>

      <ul className="results" id={listId}>
        {results.map((p) => (
          <li key={p.id} className="result">
            <Tile puzzle={p} size={40} />
            <span className="title">
              <span className="name">{p.name}</span>
              <span className="by">
                {publisherLabel(p)}
                {p.note && ` · ${p.note}`}
              </span>
            </span>
            {has(p.id) ? (
              <span className="added" aria-label={`${p.name} is in your playlist`}>
                <CheckIcon size={18} />
              </span>
            ) : (
              <button type="button" className="add" onClick={() => onAdd(p.id)} aria-label={`Add ${p.name}`}>
                <PlusIcon size={18} />
              </button>
            )}
          </li>
        ))}
      </ul>

      {query.trim() && !results.length && !linking && (
        <p className="nothing">
          No puzzle by that name.{' '}
          <button type="button" className="text-button" onClick={openLink}>
            Add it by its address
          </button>
        </p>
      )}

      {prominent && !query && (
        <div className="starters" aria-label="Suggestions">
          {STARTERS.filter((id) => !has(id))
            .flatMap((id) => catalogPuzzle(id) ?? [])
            .map((p) => (
              <button type="button" key={p.id} className="chip" onClick={() => onAdd(p.id)}>
                <PlusIcon size={16} /> {p.name}
              </button>
            ))}
        </div>
      )}

      {linking ? (
        <form className="link-form" onSubmit={submitLink}>
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
          {linkError && <p className="error">That isn't a web address.</p>}
          <div className="link-actions">
            <button type="button" className="text-button" onClick={() => setLinking(false)}>
              Cancel
            </button>
            <button type="submit" className="pill">
              Add
            </button>
          </div>
        </form>
      ) : (
        !(query.trim() && !results.length) && (
          <button type="button" className="text-button by-link" onClick={openLink}>
            <LinkIcon size={16} /> Add by link
          </button>
        )
      )}
    </section>
  );
}
