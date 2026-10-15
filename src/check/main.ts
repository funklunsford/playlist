// check.js: what the bookmarklet (src/bookmarklet.ts) loads into a puzzle's page. It works out whether the game
// is finished, and its score, then takes the tab back to the playlist with the result in the address
// (src/done.ts). If the game isn't finished it says so and stays; if it can't tell, it asks.

import { doneHash, type Done } from '../done';
import { shareText } from './capture';
import { overlay, type Overlay } from './overlay';
import { ruleFor } from './rules';
import { scoreOf } from './score';

/** The playlist, if the bookmarklet doesn't say (it always does). */
const PLAYLIST = 'https://strokes.fun/playlist/';

// The script element that loaded this, read now: it's only known while the script first runs.
const base = document.currentScript?.getAttribute('data-playlist') || PLAYLIST;

/** Back to the playlist with the result, after a moment to read the bar. */
function back(ui: Overlay, done: Done, message: string) {
  ui.say(message);
  setTimeout(() => location.assign(base + doneHash(done)), 600);
}

async function check() {
  const ui = overlay();
  const here = location.href;
  if (here.startsWith(base)) return ui.say('This is the playlist. Click it on a puzzle instead.', 3500);

  const rule = ruleFor(here);
  if (!rule) {
    const yes = await ui.ask("There's no check for this site.", 'Count it as done', 'Not yet');
    return yes ? back(ui, { url: here, how: 'asked' }, 'Back to the playlist…') : ui.close();
  }

  ui.say(`Checking ${rule.name}…`);
  let state = rule.state?.(document);
  if (state === 'playing') return ui.say(`${rule.name} isn't finished yet.`, 3000);

  const text = await shareText(document, rule);
  if (text) state = 'done';
  if (state === 'done') {
    const score = (text && scoreOf(text)) || rule.score?.(document);
    return back(ui, { id: rule.id, url: here, text, score, how: 'checked' }, `✓ ${rule.name}${score ? ` · ${score}` : ''}`);
  }

  const yes = await ui.ask(`Can't tell whether ${rule.name} is finished.`, 'Count it as done', 'Not yet');
  if (yes) back(ui, { id: rule.id, url: here, score: rule.score?.(document), how: 'asked' }, `✓ ${rule.name}`);
  else ui.close();
}

// One check at a time, however often the bookmark is clicked.
const page = window as typeof window & { __puzzlePlaylistCheck?: boolean };
if (!page.__puzzlePlaylistCheck) {
  page.__puzzlePlaylistCheck = true;
  check().finally(() => (page.__puzzlePlaylistCheck = false));
}
