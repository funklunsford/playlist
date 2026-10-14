// The colours: each puzzle on the list takes the next of these in turn, for its card and its progress dot.
// Dark ink reads on every one (5.4:1 or better).

export const PIECES = ['#f4c742', '#de73a6', '#4aa3dc', '#3db08e', '#f47452', '#7fcca5', '#f59a69', '#f2a9c7', '#55aee3'] as const;

/** The colour of the puzzle at place `i` on the list. */
export const pieceColor = (i: number) => PIECES[((i % PIECES.length) + PIECES.length) % PIECES.length];
