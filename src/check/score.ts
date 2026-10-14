// A short result for a puzzle's row, from the text the game shares: "3/6", "Perfect", "1 hint", "Easy 1:23".
// The formats come from the games' own code (October 2026); anything else falls back to a score like 3/6 or a
// time like 1:23, else nothing.

const lines = (text: string) =>
  text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Connections' coloured squares. */
const SQUARES = new Set(['🟨', '🟩', '🟦', '🟪']);

export function scoreOf(text: string): string | undefined {
  const t = text.trim();
  if (!t) return undefined;
  let m: RegExpMatchArray | null;

  // "Wordle 1,578 3/6", with X/6 when missed and a * in hard mode (and "Archive <date>" before an old one).
  if ((m = t.match(/Wordle\s+[\d,.]+\s+([1-6X])\/6(\*?)/))) return `${m[1]}/6${m[2]}`;

  // "Connections\nPuzzle #861", then a row of four squares per guess: four one-colour rows is solved.
  if (/^Connections\b/m.test(t) && /Puzzle\s*#\d+/.test(t)) {
    const rows = lines(t)
      .map((l) => [...l.replace(/\s/g, '')])
      .filter((cs) => cs.length === 4 && cs.every((c) => SQUARES.has(c)));
    const solved = rows.filter((cs) => cs.every((c) => c === cs[0])).length;
    if (solved < 4) return 'Not solved';
    const mistakes = rows.length - solved;
    return mistakes ? plural(mistakes, 'mistake') : 'Perfect';
  }

  // "Strands #591\n“Theme”\n🔵🟡💡…": each 💡 is a hint.
  if (/Strands\s*#\d+/.test(t)) {
    const hints = [...t].filter((c) => c === '💡').length;
    return hints ? plural(hints, 'hint') : 'No hints';
  }

  // "Pips #123 Easy 🟢\n1:23", with 🍪 when speedy.
  if ((m = t.match(/Pips\s*#\d+\s+([A-Za-z]+)[^\n]*\n\s*(\d+:\d{2}(?::\d{2})?)/))) return `${m[1]} ${m[2]}`;

  // "I solved the daily #CluesBySam, October 13, 2026 (Easy), in 4:32": graded by the time, kept short.
  if ((m = t.match(/#CluesBySam[^\n]*?\bin\s+([^\n!]+)/i))) return m[1].trim();

  // "Framed #1677\n🎥 🟥 🟩 ⬛ ⬛ ⬛ ⬛": the green is the guess that got it.
  if (/Framed\s*#\d+/.test(t)) {
    const marks = [...t].filter((c) => c === '🟥' || c === '🟩' || c === '⬛');
    const got = marks.indexOf('🟩');
    return got >= 0 ? `${got + 1}/6` : 'X/6';
  }

  // Anything else: a score like 3/6 (not a date like 10/13/2026), or a time like 1:23.
  if ((m = t.match(/(?:^|\s)([\dX]{1,2}\/\d{1,2})(?=[\s*]|$)/m))) return m[1];
  if ((m = t.match(/\b(\d{1,2}:\d{2}(?::\d{2})?)\b/))) return m[1];
  return undefined;
}
