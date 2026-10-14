// Small line icons, drawn in the current text colour.

type Props = { size?: number };

const Svg = ({ size = 20, children }: Props & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const PlayIcon = ({ size = 20 }: Props) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z" fill="currentColor" />
  </svg>
);

export const CheckIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);

export const PlusIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const SearchIcon = (p: Props) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.2-4.2" />
  </Svg>
);

export const CloseIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const UpIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M6 15l6-6 6 6" />
  </Svg>
);

export const DownIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);

export const GripIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M5 8h14M5 12h14M5 16h14" />
  </Svg>
);

export const MoreIcon = ({ size = 20 }: Props) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="5.5" cy="12" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="18.5" cy="12" r="1.8" />
  </svg>
);

export const LinkIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
  </Svg>
);

export const ShareIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M12 3v12M7.5 7.5L12 3l4.5 4.5" />
    <path d="M5 12v6.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V12" />
  </Svg>
);

export const GearIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M18.98 9.87 L22.05 10.23 L22.05 13.77 L18.98 14.13 L18.45 15.43 L20.36 17.85 L17.85 20.36 L15.43 18.45 L14.13 18.98 L13.77 22.05 L10.23 22.05 L9.87 18.98 L8.57 18.45 L6.15 20.36 L3.64 17.85 L5.55 15.43 L5.02 14.13 L1.95 13.77 L1.95 10.23 L5.02 9.87 L5.55 8.57 L3.64 6.15 L6.15 3.64 L8.57 5.55 L9.87 5.02 L10.23 1.95 L13.77 1.95 L14.13 5.02 L15.43 5.55 L17.85 3.64 L20.36 6.15 L18.45 8.57Z" strokeWidth={1.6} />
    <circle cx="12" cy="12" r="3.2" strokeWidth={1.6} />
  </Svg>
);
