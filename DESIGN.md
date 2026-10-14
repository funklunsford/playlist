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
| The look | Apple's Human Interface Guidelines, laid out like an Apple Music playlist: each puzzle with its own site's icon, a cover mixed from the first four as Spotify mixes one, Play beside a Shuffle switch, plain rows, and a floating mini player, in the system's font and colours (see "The Apple way, with Shuffle" and "Real icons, and a cover mixed from them"). No previews of the games |

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
4. **The bottom bar offers ▶ Next** for the next unfinished puzzle: in the list's order, or a shuffled one with Shuffle on (see "The Apple way, with Shuffle"). The playlist never moves on without a tap.
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

- **Getting it:** in Settings, behind the header's gear (see the next section). On a computer, drag the "✓ Puzzle done" button to the bookmarks bar. For iPhone, Settings copies the code to paste into a Safari bookmark.
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
    | Clues by Sam | `.modal.complete`, or its "🏆 Share results" button | its "Solved in …" time |
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

## Settings (2026-10-13, branch `settings`)
- **The gear,** top right of the header, opens Settings: a sheet like the playlist link's (bottom sheet on phones, centred on wider screens). It closes with ×, Escape, or a click outside.
- **Why:** the bookmarklet is optional, and the no-setup flow (Back, then ▶ Next) works without it. So its setup lives in Settings, off the playlist. It used to be a card below the search box.
- **Setting up the bookmarklet:**
  - **Computer:** show the bookmarks bar (⌘⇧B, or Ctrl+Shift+B), then drag "✓ Puzzle done" onto it.
  - **Without dragging:** copy the code, then in Chrome's Bookmark Manager (⌥⌘B) choose ⋮ → Add new bookmark and paste the code as its URL.
  - **A key, on a Mac:** in System Settings → Keyboard → Keyboard Shortcuts → App Shortcuts, add Google Chrome with the menu title "Puzzle done". Chrome lists bookmarks in its Bookmarks menu, so the key presses it there. The dragged bookmark's title is exactly "Puzzle done", which this relies on.
  - **iPhone:** copy the code, put it in a Safari bookmark named "Puzzle done", then on a finished puzzle type "Puzzle done" in the address bar and tap it.
- **No page can do this setup itself:** browsers give websites no way to add a bookmark or a keyboard shortcut.

## A worksheet, not a music app (2026-10-13, branch `worksheet`)
- **The owner's call:** less blatantly Spotify, more puzzlecore and scholastic. The page is now a daily puzzle worksheet. How it works is unchanged.
- **Paper:** graph paper by day, cream with a faint blue grid. In dark mode it's a chalkboard: green-black, chalk-white ink, chalk-pink marks and chalk-yellow highlights.
- **The heading:**
  - "Puzzle Playlist · Daily worksheet" in typewriter type, then "Today's Puzzles", then "Date:" written in by hand on a line.
  - A Score box filled in in red pen (done / total), with a gold star stuck on its corner when the day is done.
  - A row of answer cells, one per puzzle, where the progress bar was. Each is ticked, struck through if skipped, or highlighted if it's next.
  - A double rule underneath.
- **Puzzles as crossword squares:** the initial, the list number in the corner, and a wash of the puzzle's colour. The separate number column is gone.
- **Marks:**
  - Done: a red-pen tick and grade ("3/6", "Perfect", "1 hint", a time).
  - Next: a highlighter over the name.
  - Skipped: a strike-through.
- **Buttons:**
  - Edit, Share and Done are stamped labels: typewriter capitals, ink border, offset shadow.
  - Start / Continue and Next are a school-bus-yellow sticker.
  - Links are in red pen.
- **Along the bottom:** an index card with a red line along its top. At the end of the day: "All done for today!" with a gold star.
- **Adding puzzles:** "Make today's list" when empty, else "Add a puzzle", written on a line in handwriting. Suggestion chips and add boxes are stamped tiles.
- **Sheets** (a playlist link, Settings) are notebook paper with a red margin. Keys show as letter tiles, and the toast is a sticky note.
- **Type, bundled with the site** (no outside requests): Fraunces for headings and names, Courier Prime for labels, Caveat for handwriting.
- **The icon:** a crossword square numbered 1, with a red tick.
- **Grades stay short:** Clues by Sam is graded by its time alone, and a long grade is cut short before a name is.

## A jigsaw of felt (2026-10-13, branch `jigsaw`)
- **The owner's call:** more fun, with a photo of a 3 × 3 jigsaw of coloured felt pieces on teal as the reference. It replaces the worksheet look. How it works is unchanged.
- **The board:** teal felt, or deep teal in dark mode. A fine grain is an SVG noise filter laid over the colours (`--grain`).
- **The list is a jigsaw.** Each puzzle is a piece of its own colour (`src/pieces.ts`): yellow, magenta, blue, green, coral, mint, peach, pink and sky, in turn, sampled from the photo.
  - Dark ink reads on every piece, at 5.4:1 or better.
  - Each piece's knob, with its neck, reaches across the seam into the next. The pieces are stacked so the knob shows over the piece below.
  - The outer corners of the whole column are rounded, and it casts a soft shadow, like the photo.
- **On the pieces:**
  - Each has a white felt badge with its initial.
  - A done one wears a white sticker with a green tick and its grade.
  - The next one is outlined with white dashes and says "Up next".
  - A skipped one fades into the board and is struck through.
- **The header's board** is today's jigsaw: a piece per puzzle, up to three across, set into slots.
  - **Knobs** alternate like a real jigsaw: a checkerboard of pieces with a knob towards each neighbour, the rest with holes. An empty slot still shows its neighbours' knobs, and a placed piece shows the holes the missing ones will fill.
  - **States:** the next slot is outlined, a skipped one hatched.
  - **Motion:** the piece you've just finished drops in, with a bounce. When all are done, the picture is whole: it wiggles, and a gold star is stuck on. The caption says "3 of 6", then "Complete!".
- **Buttons** are chunky paper you press down: an edge underneath that flattens on a press.
  - Start / Continue / Next is a big coral piece. Edit and Share are white felt. All done becomes a yellow badge.
- **The bottom card** is felt with a knob on top, like the next piece waiting.
- **Everything else is felt:** the date is a sticker, search is a felt pill, suggestions are pieces to pick up, sheets are felt, keys are felt keycaps, and a message is a yellow piece that pops in.
- **Type, round like the knobs** and bundled with the site: Fredoka for headings, names and buttons, and Nunito for text.
- **The icon** is a coral jigsaw piece on teal.
- **Reduced motion:** with "reduce motion" on, nothing animates.

## Simpler, same colours (2026-10-13, branch `simple`)
- **The owner's call:** the jigsaw was too much. Keep its colours and make it simpler.
- **Kept:** the teal page (deep teal in dark mode), the nine puzzle colours in turn (`src/pieces.ts`), coral for the button to press, yellow for "All done", and white for everything else.
- **Gone:**
  - the felt grain
  - the knobs between cards
  - the header's jigsaw board, with its drop-in and wiggle
  - rotated stickers, the chunky press-down edges on buttons, and the knob on the bottom bar
- **Now:**
  - Each puzzle is a flat rounded card in its colour, with a white badge for its initial.
  - A done one has a small white "✓ 3/6" label. The next is ringed in white with a dark "Up next" label. A skipped one fades.
  - Progress is a row of dots in the header, one per puzzle in its colour, filled when done, ringed for the next and dimmed if skipped. Next to the date: "2 of 6 done".
  - Buttons are flat: coral to press, white otherwise.
  - The bottom bar, search, results, menus and sheets are plain white, rounded.
- **Type:** Fredoka for the title only, and Nunito for everything else.
- **The icon:** four rounded squares in the puzzle colours, on teal.

## The Apple way, with Shuffle (2026-10-14, branch `apple`)
- **The owner's call:** remodel the look on Apple's Human Interface Guidelines, still as a playlist, with a Shuffle switch, Edit and the rest. It replaces "Simpler, same colours".
  - The page moves off teal to the system's white, or black in dark mode. The nine puzzle colours stay, as the puzzles' artwork.
- **Laid out as Apple Music lays out a playlist:**
  - **The bar along the top:** Settings at the left, Share and Edit at the right (Done while editing).
    - It's clear at the top of the page and turns to frosted glass as the list scrolls under it. The title fades into it as the big one passes beneath.
    - That's tied to scrolling in CSS (scroll-driven animations), with no script, so the page stays eligible for the back/forward cache. A browser without them shows the bar frosted throughout, with no small title.
  - **The cover:** a 2 × 2 mosaic of the first four puzzles' artwork, as Apple Music makes a cover from a playlist's albums. With fewer than four, it's the first one's alone. An empty playlist has a grey cover with a grid symbol.
  - **Under the cover:** "Today's Puzzles", then "Puzzle Playlist" in the key colour where Apple Music names the curator, then the date and "2 of 6 done" in small capitals.
  - **Play and Shuffle,** side by side.
    - Play becomes Resume once something's been played or skipped today, and All Done at the end.
    - It plays the same puzzle as the mini player, and the row marked next.
  - **The list:** plain rows, with hairlines from the text onward.
    - Each row has the puzzle's artwork (its initial on a rounded square of its colour, with a slight sheen), its name and publisher, and ⋯.
    - Done: a green tick, with the grade before it. Next: ▶ over its artwork, and its name in the key colour. Skipped: greyed.
    - Below the list: "6 puzzles".
  - **The ⋯ menu** is a frosted context menu: Mark as Done, Skip Today, Not Yet or Don't Skip, each with its symbol. Near the bottom of the window, it opens upward.
  - **The mini player** floats just above the bottom edge, frosted.
    - Ready: the puzzle that's up next, with ▶ Play (or Resume).
    - After coming back: ✓ the puzzle, with its grade and "Up next: …" on the line below, then Not Yet (or Done, for first-party games) and ⏭ Next.
    - The grade stays off the name's line, so a long one ("3 mistakes", a time) never crowds out the name. On a phone, the artwork steps aside to make room.
    - At the end: a yellow star and "All done for today".
- **Shuffle is a switch,** filled in the key colour when it's on.
  - With it on, Play, Next and the mini player take today's puzzles in a shuffled order. The list keeps its own order, as in a music app. The mini player shows the shuffle symbol beside "Up next".
  - **The order** sorts the puzzles by a hash of the seed, the date and each puzzle's id (`src/shuffle.ts`).
    - So it comes out the same every time the page loads or comes back, which every play does.
    - A new day gives a new order, and so does turning Shuffle off and on again (a new seed).
    - Adding or removing a puzzle leaves the others' order as it was.
  - **Storage:** `playlist:shuffle = { on, seed }`, on each device. A playlist link doesn't carry it.
- **Edit** works as a list edits on an iPhone.
  - A red − at the left shows Delete at the right, and Delete removes the puzzle.
  - The handle at the right drags a row to a new place. With the keyboard, the handle moves its row with the up and down arrows. The separate up and down buttons are gone.
- **Sheets** are iOS sheets: up from the bottom on a phone, a card in the middle on a wider screen, with a title bar (Cancel, Done).
  - Settings is grouped cells on grey, as in the Settings app, with numbered steps.
  - A shared playlist shows its cover and its puzzles, with Add and Replace Mine.
- **Search** is an iOS search field. Results are rows with + to add, and an empty playlist lists its suggestions the same way.
- **Type:** the system font (San Francisco on Apple devices, Segoe UI or Roboto elsewhere), at iOS's sizes and tracking, with SF Pro Rounded for the initials. Fredoka and Nunito are gone.
- **Colours:** the system's labels, fills, separators, materials, green, red and yellow, in light and dark.
  - The key colour is mint: Apple's own in dark mode (#63e6e2), and darkened in light mode (#00766f) so text in it reads at 4.5:1 or better, even on the grey buttons.
- **Accessibility:** touch targets are 44 × 44 points or more. Reduce Motion stills the sheets, menus and messages. Reduce Transparency makes the frosted glass solid.
- **The icon:** the cover's four colours, with a white ▶ in the middle. The bookmarklet's bar on puzzle pages takes the key colour too.

## Real icons, and a cover mixed from them (2026-10-14, branch `icons`)
- **The owner's call:** each puzzle shows its site's own icon, and the playlist's cover mixes the first few, as Spotify's does.
- **Where the icons come from:** each site's own, as it gives one to a browser. That's its home-screen icon (`apple-touch-icon`, about 180px) where it has one, else its favicon.
  - They're copies, kept in `public/icons/` and listed in `src/icons.ts`, so the page asks nothing of other sites as it opens, as with the type before.
  - Most are full squares, shown edge to edge.
  - Marks on a clear background (Contexto, Octordle, Pips, Murdle, Tradle) sit smaller, on a white plate.
  - An icon with rounded corners of its own sits on its own colour: Strokes, LinkedIn and Semantle.
  - A small favicon (Murdle's is 32px) is never drawn larger than itself.
- **A few special cases:**
  - The Mini and The Crossword use the icons their pages show in a browser tab, not the Times' generic "T".
  - Every LinkedIn game has LinkedIn's icon, as their pages give no other.
  - Bracket City has The Atlantic's icon: its page turns scripts away, so its own couldn't be fetched.
  - Poeltl's site has no icon, so it keeps its initial on its colour. So does any puzzle whose icon won't load.
- **Puzzles added by link** try their site's home-screen icon, then its favicon, straight from that site and with no referrer, then their initial.
- **The cover** is made as Spotify and Apple Music make a playlist's: the first four puzzles with different icons, in a 2 × 2 mosaic. A puzzle whose icon is already on the cover (a second LinkedIn game) is passed over, as a second song from the same album is.
  - Two or three different icons are mixed into the mosaic too, with the first repeated on the diagonal: A B / B A, or A B / C A. (Spotify would show the first alone; the owner wanted the first few mixed.) One icon fills the cover alone.
  - The mosaic's tracks have no minimum and the icons are placed in them rather than sizing them, so an icon's own size can't push the others out of view. Safari was showing the first icon filling most of the cover.
- **A hairline** edges every icon, as Apple Music edges artwork, so a white icon keeps its shape on a white page. The ▶ marking the next puzzle has a darker wash under it, so it shows on white icons.
- **Adding an icon for a new catalog puzzle:** save its site's apple-touch-icon (or its favicon, as a PNG) in `public/icons/`, no more than 256px across, and list it in `src/icons.ts`. A test fails if a catalog puzzle has neither an icon nor a place on the no-icon list.
- The nine colours in `src/pieces.ts` now colour only the tiles with initials.
