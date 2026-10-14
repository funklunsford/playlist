// Small icons in the manner of Apple's SF Symbols, drawn in the current text colour.

type Props = { size?: number };

const Svg = ({ size = 20, children }: Props & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

/** A solid shape, its corners rounded by a stroke of the same colour. */
const Solid = ({ size = 20, children }: Props & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

/** play.fill */
export const PlayIcon = (p: Props) => (
  <Solid {...p}>
    <path d="M7.5 5.2v13.6l11-6.8z" />
  </Solid>
);

/** forward.fill: the next one. */
export const ForwardIcon = (p: Props) => (
  <Solid {...p}>
    <path d="M3 6.5v11l8-5.5zM12.5 6.5v11l8.5-5.5z" />
  </Solid>
);

/** shuffle */
export const ShuffleIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M3 7h3c1.7 0 2.7.6 3.6 1.9l4.8 6.2c.9 1.3 1.9 1.9 3.6 1.9h3" />
    <path d="M3 17h3c1.7 0 2.7-.6 3.6-1.9l4.8-6.2c.9-1.3 1.9-1.9 3.6-1.9h3" />
    <path d="M18.5 4.5 21 7l-2.5 2.5M18.5 14.5 21 17l-2.5 2.5" />
  </Svg>
);

/** checkmark */
export const CheckIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);

/** checkmark.circle.fill: done. */
export const CheckCircleIcon = ({ size = 20 }: Props) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="glyph-circle">
    <circle cx="12" cy="12" r="10.5" fill="currentColor" />
    <path d="M7.3 12.4l3.1 3.1 6.3-6.6" fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** plus.circle.fill: add. */
export const PlusCircleIcon = ({ size = 20 }: Props) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="glyph-circle">
    <circle cx="12" cy="12" r="10.5" fill="currentColor" />
    <path d="M12 7.2v9.6M7.2 12h9.6" fill="none" strokeWidth={2.2} strokeLinecap="round" />
  </svg>
);

/** minus.circle.fill: the red delete control while editing. */
export const MinusCircleIcon = ({ size = 20 }: Props) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="glyph-circle">
    <circle cx="12" cy="12" r="10.5" fill="currentColor" />
    <path d="M7.2 12h9.6" fill="none" strokeWidth={2.4} strokeLinecap="round" />
  </svg>
);

/** xmark.circle.fill: clears a search. */
export const ClearIcon = ({ size = 20 }: Props) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="glyph-circle">
    <circle cx="12" cy="12" r="10.5" fill="currentColor" />
    <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" fill="none" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

/** magnifyingglass */
export const SearchIcon = (p: Props) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M20 20l-4.8-4.8" />
  </Svg>
);

/** line.3.horizontal: the handle to drag a row by. */
export const GripIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M4.5 8h15M4.5 12h15M4.5 16h15" />
  </Svg>
);

/** ellipsis */
export const MoreIcon = ({ size = 20 }: Props) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="12" r="1.9" />
    <circle cx="12" cy="12" r="1.9" />
    <circle cx="19" cy="12" r="1.9" />
  </svg>
);

/** arrow.uturn.backward: Not yet, and Don't skip. */
export const UndoIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M9 14.5 4 9.5l5-5" />
    <path d="M4 9.5h10.5a5.5 5.5 0 0 1 0 11H11" />
  </Svg>
);

/** forward.end: Skip today. */
export const SkipIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M5 6.5v11l9-5.5z" />
    <path d="M18.5 6v12" />
  </Svg>
);

/** pencil: rename. */
export const PencilIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M15.6 4.4a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 1 0 2.8L8.5 19.5 3.5 20.5l1-5z" />
    <path d="M13.5 6.5l4 4" />
  </Svg>
);

/** link */
export const LinkIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
  </Svg>
);

/** square.and.arrow.up */
export const ShareIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M12 3.5v11M8 7.5l4-4 4 4" />
    <path d="M8.5 10.5H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1.5" />
  </Svg>
);

/** gearshape */
export const GearIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M18.98 9.87 L22.05 10.23 L22.05 13.77 L18.98 14.13 L18.45 15.43 L20.36 17.85 L17.85 20.36 L15.43 18.45 L14.13 18.98 L13.77 22.05 L10.23 22.05 L9.87 18.98 L8.57 18.45 L6.15 20.36 L3.64 17.85 L5.55 15.43 L5.02 14.13 L1.95 13.77 L1.95 10.23 L5.02 9.87 L5.55 8.57 L3.64 6.15 L6.15 3.64 L8.57 5.55 L9.87 5.02 L10.23 1.95 L13.77 1.95 L14.13 5.02 L15.43 5.55 L17.85 3.64 L20.36 6.15 L18.45 8.57Z" strokeWidth={1.6} />
    <circle cx="12" cy="12" r="3.2" strokeWidth={1.6} />
  </Svg>
);

/** square.grid.2x2: an empty playlist's cover. */
export const GridIcon = (p: Props) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.8" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.8" />
  </Svg>
);

/** star.fill, in yellow: all done. */
export const StarIcon = ({ size = 28 }: Props) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="star">
    <path d="M12 2.6l2.75 5.82 6.35.78-4.68 4.37 1.2 6.29L12 16.77l-5.62 3.09 1.2-6.29L2.9 9.2l6.35-.78z" fill="var(--yellow)" stroke="var(--yellow)" strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);
