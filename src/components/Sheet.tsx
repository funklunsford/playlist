import { useEffect, useId } from 'react';

interface Props {
  title: string;
  onClose(): void;
  /** The buttons at either end of the sheet's bar: Cancel at the start, Done at the end. */
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * A sheet, as an iPhone shows one: up from the bottom on a phone, a card in the middle on a wider screen, with its
 * title in a bar along its top. It closes with Escape, or a tap outside it.
 */
export function Sheet({ title, onClose, leading, trailing, className, children }: Props) {
  const titleId = useId();

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <div className="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={className ? `sheet ${className}` : 'sheet'} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="sheet-nav">
          <span className="sheet-nav-start">{leading}</span>
          <h2 id={titleId}>{title}</h2>
          <span className="sheet-nav-end">{trailing}</span>
        </header>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}
