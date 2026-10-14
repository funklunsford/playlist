// The jigsaw: each puzzle on the list is a piece of construction paper, of the next colour in turn, both in the
// list and on the header's board. The colours are sampled from paper jigsaw pieces, and dark ink reads on every
// one (5.4:1 or better).

export const PIECES = ['#f4c742', '#de73a6', '#4aa3dc', '#3db08e', '#f47452', '#7fcca5', '#f59a69', '#f2a9c7', '#55aee3'] as const;

/** The colour of the piece at place `i` on the list. */
export const pieceColor = (i: number) => PIECES[((i % PIECES.length) + PIECES.length) % PIECES.length];

/** How many pieces across the header's board is, for `n` puzzles: up to three, two for four (a square). */
export const boardColumns = (n: number) => (n <= 3 ? Math.max(n, 1) : n === 4 ? 2 : 3);

export type Side = 'top' | 'right' | 'bottom' | 'left';

/**
 * The knobs a board piece has. As in a real jigsaw, alternate pieces (a checkerboard) have a knob towards every
 * neighbour, and the others have holes for them. So an empty place still shows its neighbours' knobs, and a
 * placed piece shows the holes the missing ones will fill.
 */
export function knobsOf(i: number, n: number, cols: number): Side[] {
  const r = Math.floor(i / cols);
  const c = i % cols;
  if ((r + c) % 2 === 1) return [];
  const sides: Side[] = [];
  if (r > 0) sides.push('top');
  if (c < cols - 1 && i + 1 < n) sides.push('right');
  if (i + cols < n) sides.push('bottom');
  if (c > 0) sides.push('left');
  return sides;
}
