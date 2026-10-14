import { describe, expect, it } from 'vitest';
import { boardColumns, knobsOf, pieceColor, PIECES } from './pieces';

describe('the pieces', () => {
  it('take the colours in turn, so neighbours always differ', () => {
    expect(pieceColor(0)).toBe(PIECES[0]);
    expect(pieceColor(PIECES.length)).toBe(PIECES[0]);
    for (let i = 0; i < 30; i++) expect(pieceColor(i)).not.toBe(pieceColor(i + 1));
  });

  it('make a board up to three across, and a square for four', () => {
    expect([1, 2, 3, 4, 5, 6, 9, 12].map(boardColumns)).toEqual([1, 2, 3, 2, 3, 3, 3, 3]);
  });

  it('alternate knobs and holes like a checkerboard, a knob towards each neighbour', () => {
    // A 3 × 2 board of six: the corners and middle-bottom have knobs; the rest have holes.
    expect(knobsOf(0, 6, 3)).toEqual(['right', 'bottom']);
    expect(knobsOf(1, 6, 3)).toEqual([]);
    expect(knobsOf(2, 6, 3)).toEqual(['bottom', 'left']);
    expect(knobsOf(4, 6, 3)).toEqual(['top', 'right', 'left']);
    expect(knobsOf(3, 6, 3)).toEqual([]);
  });

  it('give no knob towards a place the board leaves empty', () => {
    // Five on a three-across board: the second row has two, so the top right has no piece below it.
    expect(knobsOf(2, 5, 3)).toEqual(['left']);
    expect(knobsOf(4, 5, 3)).toEqual(['top', 'left']);
    expect(knobsOf(0, 1, 1)).toEqual([]);
  });
});
