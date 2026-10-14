import { useState } from 'react';
import { initialOf, type Puzzle } from '../catalog';
import { iconsFor } from '../icons';

interface Props {
  puzzle: Puzzle;
  /** Its colour on the list (src/pieces.ts), behind its initial when it has no icon; the catalog's own if it isn't on the list. */
  color?: string;
  size?: number;
  /** Fills its place in the playlist's cover, square, rather than being a tile of its own. */
  fill?: boolean;
}

/**
 * A puzzle's artwork, as a song has its album's cover: its site's own icon (src/icons.ts) on a rounded square. With
 * no icon, or none that loads, it's the puzzle's initial on a square of its colour.
 */
export function Tile({ puzzle, color, size = 48, fill }: Props) {
  // The icons that wouldn't load: the tile tries the next, and then the initial.
  const [failed, setFailed] = useState<string[]>([]);
  const icon = iconsFor(puzzle).find((i) => !failed.includes(i.src));
  const box = fill ? undefined : { width: size, height: size, borderRadius: Math.round(size / 8) };

  if (!icon)
    return (
      <span
        className={fill ? 'tile fill' : 'tile'}
        aria-hidden="true"
        style={{ '--piece': color ?? puzzle.color, ...box, fontSize: fill ? undefined : Math.round(size * 0.46) } as React.CSSProperties}
      >
        {initialOf(puzzle.name)}
      </span>
    );

  const scale = `${(icon.inset ?? 1) * 100}%`;
  return (
    <span className={fill ? 'tile icon fill' : 'tile icon'} aria-hidden="true" style={{ '--plate': icon.plate, ...box } as React.CSSProperties}>
      <img
        src={icon.src}
        alt=""
        draggable={false}
        decoding="async"
        referrerPolicy="no-referrer"
        style={{ width: scale, height: scale, maxWidth: icon.px, maxHeight: icon.px }}
        onError={() => setFailed([...failed, icon.src])}
      />
    </span>
  );
}
