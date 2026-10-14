# Puzzle Playlist: design doc and plan

## Context
Two players each visit every puzzle's own site, and play whichever puzzles they remember. This site gathers them into a **daily playlist that plays like Spotify**:
- Press ▶ and the first puzzle begins.
- Come back, and the playlist ticks it. One tap on **▶ Next** plays the next.
- A puzzle is added by **typing its name**, with autocomplete that copes with misspellings and partial names. Nobody pastes a URL.

This doc settled the design before anything was built. "Puzzle Playlist" is a working name.

**Decided on 2026-10-13:**

| | |
|---|---|
| Puzzles played | NYT Games, indie dailies, and two first-party games, Strokes and Mountweazel |
| Devices | iPhone and a computer browser |
| Installs | **None.** A plain web page, with no extension and no app |
| Two players | Each device keeps its own playlist and progress, with no server or sign-in. A playlist is sent as a link |
| How puzzles open | **In the same tab.** ▶ takes the tab to the puzzle, and Back returns to the playlist. **One tap per puzzle**, never a jump without one (see below). Nothing is framed |
| What counts as done | **First-party games report it themselves. For other sites, coming back to the playlist counts as done**, and "Not yet" undoes it |
| The look | A Spotify-style playlist of names, each with a small colour tile. No previews of the games |

## What the browser allows (tested 2026-10-13)
**Framing doesn't work.** Each site's headers were checked with curl, then each site was framed from `funklunsford.github.io` in a Chromium browser.
- **Several sites refuse to be framed:**
  - by their headers: every NYT game tried, Clues by Sam, LinkedIn games, Contexto, Waffle, Bandle and the Guardian crosswords
  - with a "play on our site" wall even though their headers allow framing: Worldle, Travle and TimeGuessr
- **The ones that played in a frame started as a new visitor**, without their stats or streaks.
- A puzzle opened as a normal page runs exactly as it always does, with the player's logins and streaks.

**The same tab, started by a tap, works.**
- A tapped link took a `funklunsford.github.io` page to Octordle.
  - The link redirects to Merriam-Webster. That's fine: Back still went straight to the page.
- The page sometimes loads again on Back rather than being restored, so the playlist handles both cases.
- There's no clutter of tabs, and it's the same on iPhone (Back or an edge swipe) and on a computer.

**Moving on with no tap breaks Back, so the playlist never does it.**
- A page that had come back through Back, with no tap since, went on to Framed by itself.
- From Framed, Back then found **no history at all**. Chrome skips a page in Back if the page left without a tap (a rule against back-button hijacking), and Safari is believed to have a similar one.
- So an autoplay countdown would strand the player in the second puzzle. Instead, each puzzle starts from a tap: ▶ for the first, then **▶ Next**.
- That also rules out playing the first puzzle as soon as the site opens.

**A web page can't see inside another site.**
- **First-party games** share an origin with the playlist (`funklunsford.github.io`), so they report finishing themselves.
- **Everything else** is counted done on coming back.
- **Phase 2** reads the game's copied share result to confirm it and keep the score.
- **Seeing NYT finish with no input from the player** would need an extension or an app. That's ruled out.

## Decisions
- **Stack:** Vite, React 19, TypeScript and Vitest, as in Strokes (funklunsford/word-puzzle). `base: './'`, as there, so the site works from any folder.
- **Repo:** its own, funklunsford/playlist, published at **https://funklunsford.github.io/playlist/**. It isn't in Strokes' repo, whose DESIGN.md is Strokes'.
  - Renaming the repo only changes the path. Saved data survives because the origin stays the same.
- **Deploy:** Mountweazel's GitHub Pages workflow (funklunsford/mountweazel, `.github/workflows/deploy.yml`), changed to run `npm ci`, `npm test` and `npm run build`, then upload `dist`.
- **Storage:** localStorage only, under keys prefixed `playlist:`. The origin is shared with Strokes (`strokes:*`) and Mountweazel (`mountweazel-*`), so the prefix keeps them apart.

## How it works

### The playlist page
It's laid out like a Spotify playlist.
- **Header:** "Today", the date, "2 of 6 done", and a big round **▶**. The ▶ plays the first unfinished puzzle.
- **Rows:**
  - the number, then a small colour tile with the puzzle's initial, an icon rather than a preview of the game
  - the name, then the publisher (NYT, Indie, Yours)
  - the status: ✓ done, ▶ the current one, – skipped
  - Tapping a row plays it.
  - A ⋯ menu offers Mark done, Not yet and Skip today.
- **Bottom bar**, like Spotify's player:
  - after coming back: "✓ Wordle · Up next: Connections **▶ Next**", with **Not yet** beside it
  - on a fresh visit: "Up next: Connections ▶ Continue"
  - or "All done for today"
- **No previews of the games:** no thumbnails, screenshots or embedded glimpses.
- **Phones:** one column, sized with `100dvh` and the safe areas, with large tap targets. ▶ Next is the biggest target on the screen. Light and dark follow the device, in CSS, so they're right before the first paint.
- **Kept eligible for the browser's back/forward cache**, with no `unload` handlers, so Back is instant when the browser can restore the page.

### Playing (`src/player.ts`, plain functions with tests)
1. **▶, ▶ Next or a row tap** saves `playlist:launch = { id, date, at }`, then goes to the puzzle with `location.assign(url)`.
   - It's always the handler of that tap, so Back can always return to the playlist.
2. **Back returns to the playlist.** The page either comes back from the cache (`pageshow` with `persisted`) or loads again, with a navigation type of `back_forward`. Either way, it reads `playlist:launch` and knows which puzzle the player is back from.
3. **It ticks the puzzle, once:**
   - **First-party games:** ✓ only if the game's done signal is there (see below). Coming back before finishing leaves it unticked, with Done on offer.
   - **Other sites:** ✓ just for coming back. "Not yet" un-ticks it.
   - **The launch is then marked handled.** A later Back, Forward or cache restore doesn't tick it again or undo a "Not yet".
4. **The bottom bar offers ▶ Next** for the next unfinished puzzle. The playlist never moves on without a tap.
5. **Opening the site fresh** (from a bookmark, or the next morning) shows ▶ Continue. A launch from earlier today is still ticked, and launches from other days are dropped.

### Adding puzzles
- A search box sits below the list, as in Spotify: "Find puzzles for your playlist (wordle, clues by sam)". It suggests up to six puzzles while typing, each with its name and publisher. A tap or Enter adds one to the end.
- With an empty playlist, the search box is front and centre, with suggestion chips: Wordle, Connections, Strands, The Mini, Clues by Sam, Strokes and Mountweazel.
- **Not in the catalog:** "Add by link" asks for a name and an address.
- **Edit** reorders (drag, plus up and down buttons for touch) and removes puzzles.

### The catalog (`src/catalog.ts`)
A curated list of 42 entries: the NYT games, popular indie dailies (Clues by Sam, Framed, Octordle, Quordle, Squaredle, Murdle, Globle, Worldle, Costcodle, Nerdle, Semantle, Contexto, Waffle, Puzzmo…), LinkedIn's games, Strokes and Mountweazel. Each entry has these fields:
- `id`, `name`, `publisher`, `aliases` and `url`.
  - Each URL is the puzzle's final address. Octordle's is `merriam-webster.com/games/octordle/`, for instance.
  - `nyt-mini` has the alias "mini crossword".
  - Publishers are defined once, each with its own short aliases. New York Times has `nyt`, `nytimes` and `new york times`. So "nyt" finds every NYT game without each entry repeating it.
- `firstParty` (boolean), which is true for Strokes and Mountweazel. It decides how "done" is worked out.
- `daily` (boolean). Mountweazel isn't a daily, so for every puzzle "done" just means "played today".
- `color` for the tile
- `note` (optional), for example "Needs an NYT Games subscription"
- `share` (optional, Phase 2): the result-text pattern

`npm run check-catalog` (`scripts/check-catalog.ts`) confirms every address still answers, and flags any that redirect. It's run by hand when adding entries, not in CI, because network checks are flaky.

### Search (`src/search.ts`)
A small ranking function written for this, with tests. The catalog is small, so speed doesn't matter, and ranking it here lets "nyt mini" work.
- **Normalise:** lower case, no accents or punctuation. Split the query into words, leaving out small ones like "by" and "the". Do the same for each entry's name, aliases, publisher and publisher aliases, and its **site name** (the hostname's words, like `nytimes`, `octordle` or `cluesbysam`). That way typing a site's name works as well as a puzzle's.
- **Score each query word** against its best-matching word in the entry:

  | Match | Score |
  |---|---|
  | Exact | 1 |
  | Prefix | 0.9 |
  | Substring | 0.7 |
  | Typo (an edit distance of ≤ 1 at 4–6 letters, ≤ 2 at 7 or more) | 0.6 |
  | Typo in an unfinished word, from 5 letters ("conecti") | 0.5 |

  An entry is dropped if any query word matches nothing in it.
- **Bonuses:** a match in the name counts more than one in an alias, and an alias more than the publisher or site. The query being the name, or its start, scores higher.
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
- **Today** is the device's local date, worked out as Strokes does (`localDate()` in its `src/daily/daily.ts`), so the playlist and Strokes agree on what today is.
- **Reset time:** every puzzle resets at local midnight for now. The catalog can carry its own reset time later; NYT's crossword and Mini publish the evening before.
- **Keys:**
  - `playlist:items` holds the order as `{ ids, links }`, with the puzzles added by link.
  - `playlist:day:<date>` holds `{ [id]: { status: 'done' | 'skipped' | 'todo', at } }`, where `todo` is a "Not yet". Records older than 90 days are pruned.
  - `playlist:launch` holds `{ id, date, at, handled }`, and is dropped once the day changes.
- **Storage risk:** Safari can clear a site's storage after 7 days without a visit. A daily visit avoids that, and the playlist link doubles as a backup.

### First-party games mark themselves done (no server)
- **The signal:** when a first-party game finishes, it writes
  `localStorage['puzzle-done:<game>:<YYYY-MM-DD>'] = JSON.stringify({ at, share? })`
  The date is the local date the player finished.
- **The playlist reads these keys** when it loads, when it comes back from a puzzle, and when it becomes visible again. It also listens for `storage` events, which a same-origin page fires when a game in another tab writes one.
  - So Strokes played outside the playlist is ticked too.
  - A signal newer than a "Not yet" ticks the game again; an older one doesn't.
- **Strokes:** one write, where it saves today's daily result.
- **Mountweazel:** a write when a page is finished. Its save format is changing on its `climb` branch, so this comes after that lands.
- **This only works while all three sites share `funklunsford.github.io`.** A custom domain, if ever added, goes on the user site so all three move together.

### Sharing a playlist
- The link looks like `…/playlist/#add=nyt-wordle,nyt-connections,clues-by-sam,strokes`. Entries added by link travel as `name|url`, URL-encoded.
- Opening the link asks "Add these puzzles?" with **Add** and **Replace mine**, then takes the `#add=` part out of the address.
- **Share** uses the share sheet on iPhone (`navigator.share`), and falls back to copying the link.

## Phases
**Phase 1: the player.** Each step can be shipped on its own:
1. **Scaffold.** The repo, Vite, React, TypeScript and Vitest, the Pages workflow, `.claude/launch.json` (`npm run dev` on **port 5174**, leaving 5173 for Strokes), README and this doc.
2. **Catalog, search, and adding and editing puzzles**, with tests for search.
3. **The playlist page and the play loop:** ▶, rows, coming back and ticking once, Not yet, ▶ Next, Skip, All done.
4. **Playlist links:** sending and importing them.
5. **First-party detection:** the signal in the playlist, Strokes' write, and Mountweazel's once `climb` lands.

**Phase 2: scores.**
- **Reading the share result.** On coming back, the playlist reads the game's copied share result, confirms the puzzle and keeps the score for the day.
  - In Chrome on a computer it reads by itself once "Read results from my clipboard" is on (a one-time browser permission).
  - In Safari and on iPhone it's a **Paste result** button in the bottom bar.
  - Only text matching that puzzle's `share` pattern is kept, and a result already counted is ignored. The patterns are tested against real share texts saved as fixtures.
- A **Copy today** summary, for the two players to send each other, and a short history per puzzle.

**Phase 3: maybe.**
- **First-party games show a "Back to playlist" button on their win screen** when opened from the playlist (checked with `document.referrer`). Tapping it runs `history.back()`, landing on ▶ Next without reaching for the browser's Back.
- An `/add-puzzle` Claude Code command, like Strokes' `/daily`. It finds the puzzle's address, adds the entry and opens a PR.
- Each puzzle's own reset time.
- Polish for the home-screen app.

**Not doing:**
- Framing puzzles inside the site, or previews of them on the playlist page.
- Moving on without a tap: no autoplay countdown, and no playing the first puzzle as soon as the site opens. Both break Back (see above).
- A browser extension or an iPhone app.
- Accounts or sync.

## Files
- `index.html`, `src/main.tsx` and `src/App.tsx`. The app works out how the page arrived, once, and acts on the launch.
- `src/catalog.ts`, `src/search.ts`, `src/playlist.ts`, `src/day.ts`, `src/store.ts`, `src/player.ts`, `src/link.ts` and `src/firstParty.ts`, with tests alongside.
  - `player.ts` works out, from the launch, the navigation type, the first-party signals and the date, what to tick and what the bottom bar shows.
- Components in `src/components/`: `PlaylistHeader`, `PuzzleRow`, `PlayerBar`, `SearchBox`, `EditList`, `ImportSheet` and `Tile`.
- `dev/fake-game.html`, a stand-in first-party game with a Finish button that writes the done key. It's for local testing, because `localhost:5174` isn't the same origin as the real Strokes. The catalog lists it on the dev server only, and the build leaves it out.
- `scripts/check-catalog.ts`, `.github/workflows/deploy.yml` and `.claude/launch.json`.
- In other repos: one write in Strokes (`src/MazeApp.tsx`), and Mountweazel's after `climb`.

## To settle on the iPhones
1. **Play three puzzles in a row with ▶ Next, using Safari's real Back button or edge swipe.** Each Back should land on the playlist in one step, and the puzzle should be ticked. Some sites' redirects or in-page routes may need a second Back; any that do get a note in the catalog.
2. **A Safari tab or a home-screen app?** A home-screen app opens other sites in a sheet rather than in its own view, so there's no Back, and its storage is separate from Safari's. v1 targets a Safari tab (a favorite or bookmark); the home-screen version needs testing.
3. **Finishing Strokes, then going Back,** ticks it, and leaving it unfinished doesn't.
4. **Back restoring the page from the cache:** Safari may show the playlist as it was left, firing `pageshow` with `persisted`, rather than load it again. That path should tick the puzzle and show ▶ Next too. The Chromium used for testing always loaded the page again, so the phone is the only place this path gets tried.

## Verification
- **`npm test`:**
  - search, using the cases above
  - `player.ts`, covering:
    - coming back with `back_forward` or from the cache: tick, and offer ▶ Next
    - opening fresh: ▶ Continue
    - a launch from yesterday: dropped
    - a first-party game with no signal: not ticked
    - Not yet
    - a launch handled only once, so a second Back doesn't re-tick it after Not yet
  - the day changing, and pruning
  - encoding and decoding playlist links
  - the first-party signal
- **In a browser on the dev server**, at desktop size and at 375 × 812, in light and dark:
  1. Add puzzles by search, using a typo and a partial name. Reorder them.
  2. Run three puzzles in a row: ▶, then Back, then ▶ Next, and so on. Each Back lands on the playlist with that puzzle ticked. Not yet un-ticks it, and a second Back doesn't re-tick it.
  3. Play `dev/fake-game.html`: press Finish, then go back, and it's ticked. Again without Finish, and it isn't.
  4. Reloading the page fresh shows ▶ Continue. Skip a puzzle, then finish the rest, and All done appears.
  5. A playlist link adds its puzzles after localStorage is cleared.
- **After deploying:**
  - Play Strokes from the playlist at funklunsford.github.io/playlist/, solve it, and go back. It should be ticked, with ▶ Next on the next puzzle.
  - Run the iPhone checks on both phones.

## Phase 1 built (2026-10-13)
- **Built:** steps 1–5, each on its own branch and merged. 74 tests cover search, the play loop, storage, links and signals.
- **Tried in a Chromium browser**, at 375 × 812 and at desktop size, in light and dark:
  - Adding puzzles by chips, a typo ("conections") and a partial name, and by link.
  - Edit's drag, arrows and remove.
  - **Three puzzles in a row** (Octordle, Framed, Squaredle): ▶, Back, ▶ Next. Each Back landed on the playlist with that puzzle ticked.
  - **Not yet:** it un-ticks, and Forward then Back doesn't re-tick.
  - **First-party games:** Strokes without its signal stays unticked, with Done offered.
  - **Ending a day:** skip, mark done, and "All done for today".
  - **Playlist links:** Share, then Add and Replace mine on a cleared playlist.
- **The built site:** `vite preview` of the production build ran the loop the same way. Back loaded the page again rather than restoring it, even without the dev server's live reload. That leaves the restore path for the iPhone checks.
- **The first-party signal**, with the stand-in game:
  - Finish then Back ticks it.
  - Back without Finish doesn't.
  - Finishing it in another tab ticks the open playlist at once.
- **Strokes** sends its signal from funklunsford/word-puzzle PR #37 (branch `playlist-done`). Mountweazel's waits for `climb`.
- **Catalog checks:**
  - `npm run check-catalog` found all 42 addresses answering, with no redirects.
  - Bracket City turns scripts away, but its page checked out by hand.
  - The Washington Post turns automated browsers away, so **Keyword's address is unconfirmed**.
  - The test browser wouldn't open nytimes.com at all, so the loop was tried with other sites.
- **The dev server:** `.claude/launch.json` calls it "playlist", with `autoPort`, and `vite.config.ts` takes the port from `PORT` (else 5174).
- **Still to do:**
  - The iPhone checks.
  - Mountweazel's signal.
  - Phase 2.

## Published (2026-10-13)
- **Live at https://funklunsford.github.io/playlist/.** The repo is public at funklunsford/playlist, and Pages builds from Actions. The first run's tests, build and deploy all passed.
- **Strokes' signal is live:** PR #37 was merged, and the deployed Strokes bundle writes `puzzle-done:strokes:<date>`.
- **On the live site:**
  - The playlist reads the same storage as Strokes and Mountweazel.
  - Tapping Strokes, writing its done key by hand on the Strokes page as a stand-in for a solve, then going Back ticked Strokes, with ▶ Next on the next puzzle.
  - A real solve in Strokes wasn't played through, because a test browser can't easily draw its strokes.

## The bookmarklet: one click to check a puzzle (2026-10-13, branch `bookmarklet`)
A web page can't see inside another site, but a bookmarklet can: it's a bookmark whose address is JavaScript, and clicking it runs that code inside the page you're on. It doesn't play the game. On a finished puzzle it confirms the puzzle is done, keeps the score, and goes back to the playlist; it replaces Back rather than adding a click.

- **Getting it:** a card below the search box. On a computer, drag its "✓ Puzzle done" button to the bookmarks bar. For iPhone, the card copies the code to paste into a Safari bookmark, which is clumsier to reach.
- **Loading (`src/bookmarklet.ts`):** the bookmark only loads `check.js` from the playlist's site, with `?<time>` so it's always the latest version. Checks can then be fixed without reinstalling the bookmark.
  - It holds no "%", which a browser would decode first.
  - NYT's security policy allows scripts from any https site. Clues by Sam and Octordle have none.
  - If `check.js` can't load, the bookmark asks whether to count the puzzle anyway.
- **Checking (`src/check/`, built by `vite.check.config.ts` into `dist/check.js`):**
  - **Finished?** Each game's rule reads what the page shows (`rules.ts`). The markers come from the games' code as it was on 2026-10-13:

    | Game | Finished when | Score |
    |---|---|---|
    | Wordle | a row of `data-state="correct"` tiles (`data-testid="tile"`, in `aria-label="Row N"` rows), or six rows used | from the rows, e.g. "3/6" |
    | Connections | `conn-congrats__share` (its results) or four `solved-category-card`s; `mistake-text` means still playing | from the share text: "Perfect", "2 mistakes" |
    | Strands | `strands-found-counter` reads "N of N theme words found" | hints, from the 💡s in the share text |
    | The Mini | `.xwd__congrats-modal` (or `-container`, `-moment`) | the `.timer-count` time, since its share text has none |
    | Pips | its share text | level and time |
    | Clues by Sam | `.modal.complete`, or its "🏆 Share results" button | level and "Solved in …" |
    | Strokes, Mountweazel | their done key on this origin | — |
    | Other catalog puzzles | their share text names the game | a 3/6-style score or a time, if the text has one |

  - **Share capture:** for the score, the check presses the game's own Share (each rule names the buttons to get there) and catches the text (`capture.ts`).
    - It briefly wraps `navigator.clipboard.writeText`, `navigator.share` and `document.execCommand("copy")`, the three ways these games share.
    - The copy still reaches the clipboard. The share sheet stays shut.
    - The text counts only if it matches the game's result pattern.
  - **Scores** are parsed from the share text (`score.ts`), with formats from the games' code.
  - **What the player sees:** a bar on the puzzle's page, in a shadow root. It says "Checking…", "isn't finished yet", or asks "Can't tell whether … is finished" with "Count it as done" and "Not yet". A site the catalog doesn't have gets the question too.
- **Back to the playlist (`src/done.ts`):** the check goes to `…/playlist/#done=<id>&url=…&score=…&text=…&how=checked|asked|unchecked`.
  - The playlist matches the puzzle by id, else by page (`src/match.ts`), else (for an unknown game) by the puzzle ▶ opened.
  - It ticks the puzzle with its score and shows the bar's ✓ and ▶ Next.
  - It marks the launch handled, so the puzzle isn't also ticked for coming back.
  - It takes `#done=` out of the address.
  - Rows and the bar show the score ("Indie · 2/6").
- **Tried:**
  - The real bookmark loader, on a page the catalog doesn't know, served locally: it asked, and "Count it as done" went back to the playlist. The playlist matched the page by address, ticked it, handled the launch and cleaned the address.
  - A checked result with a score shows on its row.
  - The rules and capture are tested against pages built from the games' markers and a stand-in game (29 tests, with `happy-dom`). The score parser is tested against share texts in the games' formats (21 tests).
- **Guards against a wrong tick**, from a review before shipping:
  - A plain rule's share text must name the game *and* look like a result (a puzzle number, coloured squares, a 3/6 score or a time), so "Play Octordle with me!" doesn't count.
  - Only buttons, and links that go nowhere, are ever pressed. A rule with its own steps (Wordle, Connections, Strands, Clues by Sam) presses only those, not any Share on the page.
  - The Mini counts only congratulations that are on show and say "You solved" or "Congratulations".
  - The bookmark's base is the playlist's folder, even if the page was opened as `…/index.html`.
- **Tried on the live site** (the deployed `check.js`, loaded the way the bookmark loads it, in a Chromium browser):
  - **Framed, finished by skipping to the end:** the check pressed Framed's own SHARE and caught "Framed #1677 🎥 🟥🟥🟥🟥🟥🟥". It went back to the playlist, which ticked Framed "Indie · X/6".
  - **Ten fresh, unfinished games** (Octordle, Quordle, Squaredle, Murdle, Globle, Costcodle, Nerdle, Semantle, Waffle, Clues by Sam): each asked "Can't tell whether … is finished". None ticked, each stayed on its page, and no tab opened.
  - **The playlist page itself:** "This is the playlist. Click it on a puzzle instead."
- **Not yet tried:** a finished NYT game. The test browser won't open nytimes.com, so those rules come from the games' code, not from use. A game whose markers change gets the question instead of a wrong answer, and its rule is fixed in `rules.ts`.
