// How the check tells whether each game is finished. The NYT games and Clues by Sam have their own rules,
// written from their code as it was in October 2026: the markers named here are the ones those pages use.
// Your own games say for themselves (src/firstParty.ts). Every other catalog puzzle gets a plain rule: press the
// game's own Share and count it only if the text names the game.

import { CATALOG, catalogPuzzle } from '../catalog';
import { localDate } from '../day';
import { doneKey } from '../firstParty';
import { belongs } from '../match';

/** Finished, still playing, or undefined when the page doesn't say. */
export type State = 'done' | 'playing' | undefined;

export interface Rule {
  /** The puzzle's catalog id. */
  id: string;
  name: string;
  /** Whether a page is this game's. */
  matches(url: string): boolean;
  /** Finished or not, from the page as it is. */
  state?(doc: Document): State;
  /** A score read off the page, for a game whose share text has none (The Mini's time). */
  score?(doc: Document): string | undefined;
  /** Buttons to press in turn to reach the game's own Share: each a button's words, or a CSS selector. */
  share?: string[];
  /** What the game's shared result looks like. A rule without one never presses Share. */
  result?: { test(text: string): boolean };
}

/** Words as they read: lower case, letters and digits only. */
const plain = (s: string | null | undefined) =>
  (s ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

const textOf = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, ' ').trim() ?? '';

/** Whether an element is on show: not hidden, and (where the browser can say) laid out. */
function shown(el: Element): boolean {
  if (el.closest('[hidden], [aria-hidden="true"]')) return false;
  const check = (el as Element & { checkVisibility?: () => boolean }).checkVisibility;
  return typeof check === 'function' ? check.call(el) : true;
}

const BUTTONS = 'button, [role="button"], a';

/** Whether pressing it stays on the page: a button, or a link that goes nowhere (no address, "#…", or script). */
function pressable(el: Element): boolean {
  if (el.tagName !== 'A') return true;
  const href = el.getAttribute('href');
  return el.getAttribute('target') !== '_blank' && (href === null || href === '' || href.startsWith('#') || href.startsWith('javascript:'));
}

/** Whatever a button says: its words, else its label. */
const labelOf = (el: Element) => plain(el.textContent) || plain(el.getAttribute('aria-label')) || plain(el.getAttribute('title'));

/** The button a step names: by CSS selector, else by its words (exactly, then as a start). */
export function findStep(doc: Document, step: string): HTMLElement | undefined {
  if (/^[[.#]/.test(step)) return [...doc.querySelectorAll<HTMLElement>(step)].find(shown);
  const want = plain(step);
  const buttons = [...doc.querySelectorAll<HTMLElement>(BUTTONS)].filter((b) => shown(b) && pressable(b));
  return buttons.find((b) => labelOf(b) === want) ?? buttons.find((b) => labelOf(b).startsWith(want));
}

/** A game's own Share buttons, the likeliest first. Ones for sharing elsewhere (Facebook, a link…) are left out. */
export function shareButtons(doc: Document): HTMLElement[] {
  const buttons = [...doc.querySelectorAll<HTMLElement>(BUTTONS)].filter((b) => shown(b) && pressable(b));
  const exact = buttons.filter((b) => /^(share( your)?( results?| score)?|share text|copy( results?)?)$/.test(labelOf(b)));
  const loose = buttons.filter(
    (b) => !exact.includes(b) && /\bshare\b/.test(labelOf(b)) && !/facebook|twitter|whatsapp|email|link|friend|custom|bluesky|threads/.test(labelOf(b)),
  );
  return [...exact, ...loose];
}

const at = (id: string) => {
  const url = catalogPuzzle(id)?.url ?? '';
  return (page: string) => belongs(url, page) >= 0;
};

/** Wordle's six rows of five tiles, each tile's state ("correct", "present", "absent", "empty", "tbd"). */
function wordleRows(doc: Document): string[][] | undefined {
  const rows = [...doc.querySelectorAll('[aria-label^="Row "]')]
    .map((row) => [...row.querySelectorAll('[data-testid="tile"]')].map((t) => t.getAttribute('data-state') ?? ''))
    .filter((r) => r.length === 5);
  if (rows.length === 6) return rows;
  const tiles = [...doc.querySelectorAll('[data-testid="tile"]')].map((t) => t.getAttribute('data-state') ?? '');
  return tiles.length === 30 ? Array.from({ length: 6 }, (_, i) => tiles.slice(i * 5, i * 5 + 5)) : undefined;
}

const solvedRow = (rows: string[][]) => rows.findIndex((r) => r.every((s) => s === 'correct'));

const wordle: Rule = {
  id: 'nyt-wordle',
  name: 'Wordle',
  matches: at('nyt-wordle'),
  state(doc) {
    const rows = wordleRows(doc);
    if (!rows) return undefined;
    if (solvedRow(rows) >= 0) return 'done';
    return rows.every((r) => r.every((s) => s && s !== 'empty' && s !== 'tbd')) ? 'done' : 'playing';
  },
  score(doc) {
    const rows = wordleRows(doc);
    if (!rows) return undefined;
    const n = solvedRow(rows);
    return n >= 0 ? `${n + 1}/6` : 'X/6';
  },
  // The end screen's Share (a button whose class names it shareButton), when it's open.
  share: ['[class*="shareButton"]'],
  result: /Wordle\s+[\d,.]+\s+[1-6X]\/6/,
};

const connections: Rule = {
  id: 'nyt-connections',
  name: 'Connections',
  matches: at('nyt-connections'),
  state(doc) {
    if (doc.querySelector('[data-testid="conn-congrats__share"]')) return 'done';
    if (doc.querySelectorAll('[data-testid="solved-category-card"]').length >= 4) return 'done';
    if (doc.querySelector('[data-testid="mistake-text"]')) return 'playing';
    return undefined;
  },
  share: ['View Results', 'Share Your Results'],
  result: /Connections[\s\S]*Puzzle\s*#\d+/,
};

const strands: Rule = {
  id: 'nyt-strands',
  name: 'Strands',
  matches: at('nyt-strands'),
  state(doc) {
    const m = textOf(doc.querySelector('[data-testid="strands-found-counter"]')).match(/(\d+)\s*of\s*(\d+)/);
    if (!m) return undefined;
    return Number(m[1]) >= Number(m[2]) ? 'done' : 'playing';
  },
  share: ['[class*="resultsButton"]', 'Share Your Results'],
  result: /Strands\s*#\d+/,
};

// The Mini shares a link without its time, so the time comes off the page.
const mini: Rule = {
  id: 'nyt-mini',
  name: 'The Mini',
  matches: at('nyt-mini'),
  state(doc) {
    const congrats = [...doc.querySelectorAll('.xwd__congrats-modal, .xwd__congrats-container, .xwd__congrats-moment')];
    return congrats.some((el) => shown(el) && /you solved|congratulations/i.test(textOf(el))) ? 'done' : undefined;
  },
  score: (doc) => textOf(doc.querySelector('.timer-count')) || undefined,
};

const pips: Rule = { id: 'nyt-pips', name: 'Pips', matches: at('nyt-pips'), result: /Pips\s*#\d+/ };

const cluesBySam: Rule = {
  id: 'clues-by-sam',
  name: 'Clues by Sam',
  matches: at('clues-by-sam'),
  state(doc) {
    // The results box is open, or its "🏆 Share results" button shows (only after solving).
    return doc.querySelector('.modal.complete') || findStep(doc, 'Share results') ? 'done' : undefined;
  },
  // Graded by the time it took, kept short like the other grades.
  score: (doc) => textOf(doc.querySelector('.modal.complete .result h3')).match(/Solved in (.+)/)?.[1],
  share: ['Share results', 'Share Text'],
  result: /#CluesBySam/i,
};

// Your own games write a done key on this origin when they finish, so the check reads it.
const yours: Rule[] = CATALOG.filter((p) => p.firstParty).map((p) => ({
  id: p.id,
  name: p.name,
  matches: at(p.id),
  state() {
    try {
      return localStorage.getItem(doneKey(p.id, localDate())) ? 'done' : undefined;
    } catch {
      return undefined;
    }
  },
}));

const OWN = [wordle, connections, strands, mini, pips, cluesBySam, ...yours];

/** A game's name as a pattern for its share text: "Box Office Game" matches "box office game". */
const named = (name: string) => new RegExp(name.replace(/^the\s+/i, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*'), 'i');

/**
 * What only a result has, beside the game's name: a puzzle number ("#1234"), coloured squares, a score like 3/6,
 * or a time like 1:23. So "Play Octordle with me!" from a share-the-game button doesn't count.
 */
const RESULTISH = /#\s?\d+|[🟩🟨🟥🟦🟪🟧🟫⬛⬜]|(?:^|\s)[\dX]{1,2}\/\d{1,2}(?=[\s*]|$)|\b\d{1,2}:\d{2}\b/mu;

/** A result from the game: it names the game, and looks like a result. */
const resultOf = (name: string) => {
  const game = named(name);
  return { test: (text: string) => game.test(text) && RESULTISH.test(text) };
};

const plainRules: Rule[] = CATALOG.filter((p) => !OWN.some((r) => r.id === p.id) && /^https?:/.test(p.url)).map((p) => ({
  id: p.id,
  name: p.name,
  matches: at(p.id),
  result: resultOf(p.name),
}));

export const RULES: readonly Rule[] = [...OWN, ...plainRules];

/** The rule for a page, if it's one of the catalog's games. */
export const ruleFor = (url: string) => RULES.find((r) => r.matches(url));
