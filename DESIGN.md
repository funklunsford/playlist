# Puzzle Playlist: design doc and plan

## Context
Today two players each go to every puzzle's own site, and play whichever puzzles they remember. This site gathers them into a **daily playlist that plays like Spotify**:
- You press ▶ and the first puzzle begins.
- When you come back, the playlist ticks it, and one tap on **▶ Next** plays the next.
- You add a puzzle by **typing its name**, with autocomplete that copes with misspellings and partial names. You never paste a URL.

This doc settles the design before anything is built. "Puzzle Playlist" is a working name.

**Decided on 2026-10-13:**

| | |
|---|---|
| Puzzles you play | NYT Games, indie dailies, and your own Strokes and Mountweazel |
| Devices | iPhone and a computer browser |
| Installs | **None.** A plain web page, with no extension and no app |
| Two people | Each device keeps its own playlist and progress, with no server or sign-in. You send a playlist to each other as a link |
| How puzzles open | **In the same tab.** ▶ takes the tab to the puzzle, and Back returns to the playlist. **One tap per puzzle**, never a jump without one (see below). Nothing is framed |
| What counts as done | **Your games report it themselves. For other sites, coming back to the playlist counts as done**, and "Not yet" undoes it |
| The look | A Spotify-style playlist of names, each with a small colour tile. No previews of the games |

## What the browser allows (tested 2026-10-13)
**Framing doesn't work.** I checked each site's headers with curl, then framed each one from `funklunsford.github.io` in a Chromium browser.
- **Several sites refuse to be framed:**
  - every NYT game tried, Clues by Sam, LinkedIn games, Contexto, Waffle, Bandle and the Guardian crosswords, by their headers
  - Worldle, Travle and TimeGuessr, with a "play on our site" wall even though their headers allow framing
- **The ones that played in a frame started as a new visitor**, without their stats or streaks.
- A puzzle opened as a normal page runs exactly as it does today, with your logins and streaks.

**The same tab, started by a tap, works.**
- I tapped a link from a `funklunsford.github.io` page to Octordle.
  - The link redirects to Merriam-Webster. That's fine: Back still went straight to the page.
- The page sometimes loads again on Back rather than being restored, so the playlist handles both cases.
- There's no clutter of tabs, and it's the same on iPhone (Back or an edge swipe) and on a computer.

**Moving on with no tap breaks Back, so the playlist never does it.**
- A page that had come back through Back, with no tap since, went on to Framed by itself.
- From Framed, Back then found **no history at all**. Chrome skips a page in Back if the page left without a tap (a rule against back-button hijacking), and Safari is believed to have a similar one.
- So an autoplay countdown would trap you in the second puzzle. Instead, each puzzle starts from a tap: ▶ for the first, then **▶ Next**.
- That also rules out playing the first puzzle as soon as the site opens.

**A web page can't see inside another site.**
- **Your own games** share an origin with the playlist (`funklunsford.github.io`), so they report finishing themselves.
- **Everything else** is counted done when you come back.
- **Phase 2** reads the game's copied share result to confirm it and keep your score.
- **Seeing NYT finish with no input from you** would need an extension or an app. That's ruled out.

## Decisions
- **Stack:** Vite, React 19, TypeScript and Vitest, as in Strokes (`word-puzzle/package.json`). `base: './'` as in `word-puzzle/vite.config.ts`.
- **Repo:** a new repo, `playlist` → `github.com/funklunsford/playlist`, published at **https://funklunsford.github.io/playlist/**. It isn't in `word-puzzle`, because that repo's DESIGN.md is Strokes'.
  - Renaming the repo only changes the path. Saved data survives because the origin stays the same.
- **Deploy:** copy Mountweazel's GitHub Pages workflow (`mountweazel/.github/workflows/deploy.yml`). Change it to run `npm ci`, `npm test` and `npm run build`, then upload `dist`.
- **Storage:** localStorage only, under keys prefixed `playlist:`. The origin is shared with Strokes (`strokes:*`) and Mountweazel (`mountweazel-*`), so the prefix keeps them apart.

## How it works

### The playlist page
It's laid out like a Spotify playlist.
- **Header:** "Today", the date, "2 of 6 done", and a big round **▶**. The ▶ plays the first unfinished puzzle.
- **Rows:**
  - the number, then a small colour tile with the puzzle's initial, an icon rather than a preview of the game
  - the name, then the publisher (NYT, Indie, Yours)
  - the status: ✓ done, ♪ the current one, – skipped
  - Tapping a row plays it.
  - A ⋯ menu offers Done, Not yet and Skip today.
- **Bottom bar**, like Spotify's player:
  - after you come back: "✓ Wordle · Up next: Connections **▶ Next**", with **Not yet** beside it
  - on a fresh visit: "▶ Continue: Connections"
  - or "All done for today"
- **No previews of the games:** no thumbnails, screenshots or embedded glimpses.
- **Phones:** one column, sized with `100dvh` and the safe areas, with large tap targets. ▶ Next is the biggest target on the screen. Light and dark themes are set before the first paint, as in Strokes' `word-puzzle/index.html`.
- **Keep the page eligible for the browser's back/forward cache**, with no `unload` handlers, so Back is instant when the browser can restore it.

### Playing (`src/player.ts`, a pure function with tests)
1. **▶, ▶ Next or a row tap** saves `playlist:launch = { id, at }`, then goes to the puzzle with `location.assign(url)`.
   - It's always the handler of that tap, so Back can always return to the playlist.
2. **Back returns to the playlist.** The page either comes back from the cache (`pageshow` with `persisted`) or loads again, with a navigation type of `back_forward`. Either way, it reads `playlist:launch` and knows you're back from that puzzle.
3. **It ticks the puzzle, once:**
   - **Your games:** ✓ only if the game's done signal is there (see below). If you came back before finishing, it stays unticked.
   - **Other sites:** ✓ just for coming back. "Not yet" un-ticks it.
   - **The launch is then marked handled.** A later Back, Forward or cache restore doesn't tick it again or undo your "Not yet".
4. **The bottom bar offers ▶ Next** for the next unfinished puzzle. The playlist never moves on without a tap.
5. **Opening the site fresh** (from a bookmark, or the next morning) shows ▶ Continue. A launch from earlier today is still ticked, and launches from other days are dropped.

### Adding puzzles
- A search box sits below the list, as in Spotify: "Find puzzles for your playlist (wordle, clues by sam)". It suggests up to six puzzles as you type, each with its name and publisher. A tap or Enter adds it to the end.
- With an empty playlist, the search box is front and centre, with suggestion chips: Wordle, Connections, Strands, Mini, Clues by Sam, Strokes and Mountweazel.
- **Not in the catalog:** "Add by link" asks for a name and a URL.
- **Edit** lets you reorder (drag, plus up and down buttons for touch) and remove puzzles.

### The catalog (`src/catalog.ts`)
A curated list of about 40 entries: the NYT games, popular indie dailies (Clues by Sam, Framed, Octordle, Quordle, Squaredle, Murdle, Globle, Worldle, Costcodle, Nerdle, Semantle, Contexto, Waffle, Puzzmo…), Strokes and Mountweazel. Each entry has these fields:
- `id`, `name`, `publisher`, `aliases` and `url`.
  - Each URL is the puzzle's final address. Octordle's is `merriam-webster.com/games/octordle/`, for instance.
  - `nyt-mini` has the alias "mini crossword".
  - Publishers are defined once, each with its own short aliases. New York Times has `nyt`, `nytimes` and `new york times`. So "nyt" finds every NYT game without each entry repeating it.
- `firstParty` (boolean), which is true for Strokes and Mountweazel. It decides how "done" is worked out.
- `daily` (boolean). Mountweazel isn't a daily, so for every puzzle "done" just means "played today".
- `color` for the tile
- `note` (optional), for example "Needs an NYT subscription"
- `share` (optional), the result-text pattern Phase 2 uses

`scripts/check-catalog.ts` confirms every URL still answers and flags any that redirect. Run it by hand when adding entries; it isn't in CI, because network checks are flaky.

### Search (`src/search.ts`)
A small ranking function written for this, with tests. The catalog is about 40 entries, so speed doesn't matter, and ranking it ourselves lets "nyt mini" work.
- **Normalise:** lower case, no accents or punctuation. Split the query into words. Do the same for each entry's name, aliases, publisher and publisher aliases, and its **site name** (the hostname's words, like `nytimes`, `octordle` or `cluesbysam`). That way typing a site's name works as well as a puzzle's.
- **Score each query word** against its best-matching word in the entry:

  | Match | Score |
  |---|---|
  | Exact | 1 |
  | Prefix | 0.9 |
  | Substring | 0.7 |
  | Typo (Damerau–Levenshtein distance ≤ 1 at 4–6 letters, ≤ 2 at 7 or more) | 0.6 |

  An entry is dropped if any query word matches nothing in it.
- **Bonuses:** a match in the name counts more than one in an alias, and an alias more than the publisher or site. The whole query being the start of the name also scores higher.
- **Tests:**

  | Query | Should find |
  |---|---|
  | `wordel` | Wordle |
  | `conections` | Connections |
  | `nyt mini` | The Mini |
  | `sam` | Clues by Sam |
  | `cluesbysam` | Clues by Sam |
  | `bee` | Spelling Bee |
  | `octo` | Octordle |
  | `quardle` | Quordle |
  | `mountweasel` | Mountweazel |
  | `nyt` | every NYT game |
  | `nytimes` | every NYT game |
  | `puzzmo` | Puzzmo |

### Today and storage (`src/day.ts`, `src/store.ts`)
- **Today** is the device's local date. Copy `localDate()` from Strokes (`word-puzzle/src/daily/daily.ts:43`) so the playlist and Strokes agree on what today is.
- **Reset time:** every puzzle resets at local midnight for now. The catalog can carry its own reset time later; NYT's crossword and Mini publish the evening before.
- **Keys:**
  - `playlist:items` holds the order as `[id]`, plus any entries added by link.
  - `playlist:day:<date>` holds `{ [id]: { status: 'done' | 'skipped', at, share? } }`. Records older than 90 days are pruned.
  - `playlist:launch` holds `{ id, at, handled }`, and is dropped once the day changes.
- **Storage risk:** Safari can clear a site's storage after 7 days without a visit. A daily visit avoids that, and the playlist link doubles as a backup.

### Your games mark themselves done (no server)
- **The signal:** when a first-party game finishes, it writes
  `localStorage['puzzle-done:<game>:<YYYY-MM-DD>'] = JSON.stringify({ at, share? })`
  The date is the local date the player finished, from `localDate()`.
- **The playlist reads these keys** when it loads, when it comes back from a puzzle, and when it becomes visible again. It also listens for `storage` events, which a same-origin page fires when a game in another tab writes one.
  - So Strokes played outside the playlist is ticked too.
- **Strokes:** add the one write where it saves the result, at `word-puzzle/src/MazeApp.tsx:366`.
- **Mountweazel:** add the write when a page is finished. Its save format is changing on the `climb` branch, so do this after that branch lands.
- **This only works while all three sites share `funklunsford.github.io`.** If you ever add a custom domain, put it on the user site so all three move together.

### Sharing a playlist
- The link looks like `…/playlist/#add=nyt-wordle,nyt-connections,clues-by-sam,strokes`. Entries added by link travel as `name|url`, URL-encoded.
- Opening the link asks "Add these 4 puzzles?" with **Add** and **Replace mine**.
- **Send playlist** uses the share sheet on iPhone (`navigator.share`), and falls back to copying the link.

## Phases
**Phase 1: the player.** Each step can be shipped on its own:
1. **Scaffold.** The repo, Vite, React, TypeScript and Vitest, the Pages workflow, `.claude/launch.json` (`npm run dev` on **port 5174**, leaving 5173 for Strokes), README and DESIGN.md (this doc). Once you've agreed to the GitHub repo and Pages, publish an empty page.
2. **Catalog, search, and adding and editing puzzles**, with tests for search.
3. **The playlist page and the play loop:** ▶, rows, coming back and ticking once, Not yet, ▶ Next, Skip, All done.
4. **Playlist links:** sending and importing them.
5. **First-party detection:** the signal in the playlist, Strokes' one-line write (a PR to `word-puzzle`), and Mountweazel's once `climb` lands.

**Phase 2: scores.**
- **Reading the share result.** On coming back, the playlist reads the game's copied share result, confirms the puzzle and keeps the score for the day.
  - In Chrome on a computer it reads by itself once you've switched on "Read results from my clipboard" (a one-time browser permission).
  - In Safari and on iPhone it's a **Paste result** button in the bottom bar.
  - Only text matching that puzzle's `share` pattern is kept, and a result already counted is ignored. The patterns are tested against real share texts saved as fixtures.
- A **Copy today** summary, to send each other a combined result, and a short history per puzzle.

**Phase 3: maybe.**
- **Your games show a "Back to playlist" button on their win screen** when you came from the playlist (checked with `document.referrer`). Tapping it runs `history.back()`, so you land on ▶ Next without reaching for the browser's Back.
- An `/add-puzzle` Claude Code command, like `/daily`. It finds the puzzle's URL, adds the entry and opens a PR.
- Each puzzle's own reset time.
- Polish for the home-screen app.

**Not doing:**
- Framing puzzles inside the site, or previews of them on the playlist page.
- Moving on without a tap: no autoplay countdown, and no playing the first puzzle as soon as the site opens. Both break Back (see above).
- A browser extension or an iPhone app.
- Accounts or sync.

## Files (new repo `playlist`)
- `index.html` (the theme set before the first paint, as in Strokes), `src/main.tsx` and `src/App.tsx`.
- `src/catalog.ts`, `src/search.ts`, `src/day.ts`, `src/store.ts`, `src/player.ts`, `src/link.ts` and `src/firstParty.ts`, each with a `*.test.ts`.
  - `player.ts` works out, from the launch, the navigation type, the first-party signal and the date, what to tick and what the bottom bar shows.
- Components in `src/components/`: `PlaylistHeader`, `PuzzleRow`, `PlayerBar`, `SearchBox` and `EditList`.
- `public/dev/fake-game.html`, a stand-in first-party game with a Finish button that writes the done key. It's for local testing, because `localhost:5174` isn't the same origin as the real Strokes.
- `scripts/check-catalog.ts`, `.github/workflows/deploy.yml` and `.claude/launch.json`.
- In other repos: one write in `word-puzzle/src/MazeApp.tsx`, and Mountweazel after `climb`.

## To settle on the iPhones in step 3
1. **Play three puzzles in a row with ▶ Next, using Safari's real Back button or edge swipe.** Each Back should land on the playlist in one step, and the puzzle should be ticked. Some sites' redirects or in-page routes may need a second Back; any that do get a note in the catalog.
2. **A Safari tab or a home-screen app?** A home-screen app opens other sites in a sheet rather than in its own view, so there's no Back, and its storage is separate from Safari's. v1 targets a Safari tab (a favorite or bookmark); the home-screen version needs testing.
3. **Finishing Strokes, then going Back,** ticks it, and leaving it unfinished doesn't.

## Verification
- **`npm test`:**
  - search, using the cases above
  - `player.ts`, covering:
    - coming back with `back_forward` or from the cache: tick, and offer ▶ Next
    - opening fresh: ▶ Continue
    - a launch from yesterday: dropped
    - your game with no signal: not ticked
    - Not yet
    - a launch handled only once, so a second Back doesn't re-tick it after Not yet
  - the day changing, and pruning
  - encoding and decoding playlist links
  - the first-party signal, against a fake `storage` event
- **The browser pane** (`preview_start` with "dev"), run at desktop size and then at 375 × 812, in light and dark:
  1. Add puzzles by search, using a typo and a partial name. Reorder them.
  2. Run three puzzles in a row: ▶, then `navigate` "back", then ▶ Next, and so on. Each Back lands on the playlist with that puzzle ticked. Not yet un-ticks it, and a second Back doesn't re-tick it.
  3. Play `/dev/fake-game.html`: press Finish, then go back, and it's ticked. Again without Finish, and it isn't.
  4. Reloading the page fresh shows ▶ Continue. Skip a puzzle, then finish the rest, and All done appears.
  5. A playlist link adds its puzzles after localStorage is cleared.
- **After deploying:**
  - Play Strokes from the playlist at funklunsford.github.io/playlist/, solve it, and go back. It should be ticked, with ▶ Next on Connections.
  - Run the iPhone checklist on both phones.
