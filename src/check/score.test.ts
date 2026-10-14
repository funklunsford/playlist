import { describe, expect, it } from 'vitest';
import { scoreOf } from './score';

// Share texts in the formats the games' own code builds (October 2026).
describe('scores from share texts', () => {
  it.each([
    ['Wordle 1,578 3/6\n\n⬛🟨⬛⬛⬛\n🟩🟩⬛🟩⬛\n🟩🟩🟩🟩🟩', '3/6'],
    ['Wordle 1,578 4/6*\n\n⬛⬛⬛⬛⬛', '4/6*'],
    ['Wordle 1,578 X/6\n\n⬛⬛⬛⬛⬛', 'X/6'],
    ['Archive October 1, 2026\nWordle 1,566 5/6', '5/6'],
    ['Connections\nPuzzle #861\n🟨🟨🟨🟨\n🟩🟩🟩🟩\n🟦🟦🟦🟦\n🟪🟪🟪🟪', 'Perfect'],
    ['Connections\nPuzzle #861\n🟨🟨🟩🟨\n🟨🟨🟨🟨\n🟩🟩🟩🟩\n🟦🟪🟦🟦\n🟦🟦🟦🟦\n🟪🟪🟪🟪', '2 mistakes'],
    ['Connections\nPuzzle #861\n🟨🟨🟩🟨\n🟨🟨🟨🟨\n🟩🟦🟩🟩\n🟦🟪🟦🟦\n🟩🟪🟦🟦', 'Not solved'],
    ['Strands #591\n“Shell game”\n🔵🔵🟡🔵\n🔵🔵', 'No hints'],
    ['Strands #591\n“Shell game”\n💡🔵🔵🟡\n🔵💡🔵', '2 hints'],
    ['Pips #123 Easy 🟢\n1:23', 'Easy 1:23'],
    ['Pips #123 Hard 🔴\n12:04 🍪', 'Hard 12:04'],
    ['I solved the daily #CluesBySam, October 13, 2026 (Easy), in 4:32', 'Easy · 4:32'],
    ['I solved the daily #CluesBySam, October 13, 2026!', undefined],
    ['Framed #1677\n🎥 🟥 🟩 ⬛ ⬛ ⬛ ⬛', '2/6'],
    ['Framed #1677\n🎥 🟥 🟥 🟥 🟥 🟥 🟥', 'X/6'],
    ['Daily Octordle #1234\nScore: 70\n8️⃣4️⃣', undefined],
    ['Some game: 4/6 today', '4/6'],
    ['Solved on 10/13/2026', undefined],
    ['Done in 2:07!', '2:07'],
    ['I solved the daily mini!\nhttps://www.nytimes.com/crosswords/game/mini', undefined],
    ['', undefined],
  ])('%j → %s', (text, score) => {
    expect(scoreOf(text)).toBe(score);
  });
});
