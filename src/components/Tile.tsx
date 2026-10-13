import { initialOf, type Puzzle } from '../catalog';

/** Whether dark text reads better than white on a colour (by its relative luminance). */
function lightBackground(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.32;
}

/** A puzzle's square: its colour and initial, like album art. It's an icon, not a preview of the game. */
export function Tile({ puzzle, size = 44 }: { puzzle: Puzzle; size?: number }) {
  return (
    <span
      className="tile"
      aria-hidden="true"
      style={{ background: puzzle.color, color: lightBackground(puzzle.color) ? '#16161a' : '#ffffff', width: size, height: size, fontSize: size * 0.48 }}
    >
      {initialOf(puzzle.name)}
    </span>
  );
}
