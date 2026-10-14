import { describe, expect, it } from 'vitest';
import { pieceColor, PIECES } from './pieces';

describe('the colours', () => {
  it('are taken in turn, so neighbours always differ', () => {
    expect(pieceColor(0)).toBe(PIECES[0]);
    expect(pieceColor(PIECES.length)).toBe(PIECES[0]);
    for (let i = 0; i < 30; i++) expect(pieceColor(i)).not.toBe(pieceColor(i + 1));
  });
});
