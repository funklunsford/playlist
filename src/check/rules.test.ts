// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { catalogPuzzle } from '../catalog';
import { findStep, ruleFor, shareButtons, type Rule } from './rules';

// Pages built from the markers the games' own code uses (October 2026).
const page = (html: string) => {
  document.body.innerHTML = html;
  return document;
};
const rule = (id: string) => ruleFor(catalogPuzzle(id)!.url) as Rule;

/** Wordle's board: rows of five tiles, each with its data-state. */
const wordleBoard = (rows: string[][]) =>
  rows
    .map(
      (r, i) =>
        `<div aria-label="Row ${i + 1}" role="group">${r.map((s) => `<div role="img" aria-roledescription="tile" data-state="${s}" data-testid="tile"></div>`).join('')}</div>`,
    )
    .join('');
const row = (s: string) => Array(5).fill(s);
const mixed = ['absent', 'present', 'correct', 'absent', 'absent'];

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('the rule for a page', () => {
  it('is the game whose page it is', () => {
    expect(ruleFor('https://www.nytimes.com/games/wordle/index.html')?.id).toBe('nyt-wordle');
    expect(ruleFor('https://www.nytimes.com/games/connections')?.id).toBe('nyt-connections');
    expect(ruleFor('https://www.nytimes.com/crosswords/game/mini')?.id).toBe('nyt-mini');
    expect(ruleFor('https://cluesbysam.com/')?.id).toBe('clues-by-sam');
    expect(ruleFor('https://funklunsford.github.io/strokes/')?.id).toBe('strokes');
  });

  it("is a plain one, matching the game's name, for the rest of the catalog", () => {
    const octordle = ruleFor('https://www.merriam-webster.com/games/octordle/');
    expect(octordle?.id).toBe('octordle');
    expect(octordle?.state).toBeUndefined();
    expect(octordle?.result?.test('Daily Octordle #1234')).toBe(true);
    expect(octordle?.result?.test('Daily Quordle 1234')).toBe(false);
    expect(ruleFor('https://boxofficega.me/')?.result?.test('🎬 Box Office Game – October 13')).toBe(true);
  });

  it("is nothing for a site the catalog doesn't have", () => {
    expect(ruleFor('https://example.com/')).toBeUndefined();
  });
});

describe('Wordle', () => {
  const wordle = rule('nyt-wordle');
  it('is done on a row of greens, with its row as the score', () => {
    const doc = page(wordleBoard([mixed, mixed, row('correct'), row('empty'), row('empty'), row('empty')]));
    expect(wordle.state!(doc)).toBe('done');
    expect(wordle.score!(doc)).toBe('3/6');
  });
  it('is still playing with rows to go', () => {
    expect(wordle.state!(page(wordleBoard([mixed, mixed, row('tbd'), row('empty'), row('empty'), row('empty')])))).toBe('playing');
  });
  it('is done, missed, when all six rows are used', () => {
    const doc = page(wordleBoard(Array(6).fill(mixed)));
    expect(wordle.state!(doc)).toBe('done');
    expect(wordle.score!(doc)).toBe('X/6');
  });
  it("isn't fooled by the help's example tiles", () => {
    const example = '<div class="help"><div data-testid="tile" data-state="correct"></div></div>';
    expect(wordle.state!(page(example + wordleBoard([mixed, row('empty'), row('empty'), row('empty'), row('empty'), row('empty')])))).toBe('playing');
  });
  it("can't tell without a board", () => {
    expect(wordle.state!(page('<main></main>'))).toBeUndefined();
  });
});

describe('Connections', () => {
  const connections = rule('nyt-connections');
  const card = '<li data-testid="solved-category-card"></li>';
  it('is done when its results are open, or all four groups are solved', () => {
    expect(connections.state!(page('<dl data-testid="conn-congrats__share" aria-label="5 by 4 grid"></dl>'))).toBe('done');
    expect(connections.state!(page(card.repeat(4)))).toBe('done');
  });
  it('is still playing while mistakes remain to be made', () => {
    expect(connections.state!(page(`${card.repeat(2)}<p data-testid="mistake-text">Mistakes Remaining:</p>`))).toBe('playing');
  });
});

describe('Strands', () => {
  const strands = rule('nyt-strands');
  const counter = (n: number, of: number) => `<p data-testid="strands-found-counter"><b>${n}</b> of <b>${of}</b> theme words found.</p>`;
  it('goes by its count of theme words found', () => {
    expect(strands.state!(page(counter(3, 7)))).toBe('playing');
    expect(strands.state!(page(counter(7, 7)))).toBe('done');
    expect(strands.state!(page('<main></main>'))).toBeUndefined();
  });
});

describe('The Mini', () => {
  const mini = rule('nyt-mini');
  it('is done when it congratulates you, and its score is the time', () => {
    const doc = page('<div class="timer-count">0:41</div><div class="xwd__congrats-modal"><div class="xwd__center">You solved the crossword</div></div>');
    expect(mini.state!(doc)).toBe('done');
    expect(mini.score!(doc)).toBe('0:41');
    expect(mini.result).toBeUndefined();
  });
  it("can't tell otherwise", () => {
    expect(mini.state!(page('<div class="timer-count">0:12</div>'))).toBeUndefined();
  });
});

describe('Clues by Sam', () => {
  const cbs = rule('clues-by-sam');
  it('is done when its results show, scored by level and time', () => {
    const doc = page('<div class="modal complete"><h3>October 13, 2026 (Easy)</h3><div class="result"><h3>Solved in 4:32</h3></div></div>');
    expect(cbs.state!(doc)).toBe('done');
    expect(cbs.score!(doc)).toBe('Easy · 4:32');
  });
  it('is done when its 🏆 Share results button shows', () => {
    expect(cbs.state!(page('<button class="wide-button with-icon"><span>🏆</span>Share results</button>'))).toBe('done');
  });
  it("can't tell from the board alone", () => {
    expect(cbs.state!(page('<div class="card flipped"></div>'))).toBeUndefined();
  });
});

describe('your own games', () => {
  it("are done when they've written today's done key", () => {
    const strokes = rule('strokes');
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    localStorage.removeItem(`puzzle-done:strokes:${today}`);
    expect(strokes.state!(document)).toBeUndefined();
    localStorage.setItem(`puzzle-done:strokes:${today}`, JSON.stringify({ at: 1 }));
    expect(strokes.state!(document)).toBe('done');
    localStorage.removeItem(`puzzle-done:strokes:${today}`);
  });
});

describe('finding buttons', () => {
  it('by their words, whatever the case or emoji, or by a selector', () => {
    const doc = page('<button>View Results</button><button class="Footer-module_shareButton__x1">Share</button><button><span>🏆</span> Share results</button>');
    expect(findStep(doc, 'view results')?.textContent).toBe('View Results');
    expect(findStep(doc, '[class*="shareButton"]')?.textContent).toBe('Share');
    expect(findStep(doc, 'Share results')?.textContent).toContain('Share results');
    expect(findStep(doc, 'Nothing like this')).toBeUndefined();
  });

  it("puts a game's own Share first, and leaves out sharing elsewhere", () => {
    const doc = page('<a>Share on Facebook</a><button aria-label="Share"></button><button>Share this puzzle with friends</button><button>Share Your Results</button>');
    expect(shareButtons(doc).map((b) => b.textContent || b.getAttribute('aria-label'))).toEqual(['Share', 'Share Your Results']);
  });

  it('passes over hidden ones', () => {
    const doc = page('<div hidden><button>Share</button></div><div aria-hidden="true"><button>Share</button></div>');
    expect(shareButtons(doc)).toEqual([]);
  });
});
