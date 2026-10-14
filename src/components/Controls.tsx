// Settings' controls, as an iPhone draws them: a switch, and a segmented control to choose one of a few.

interface SwitchProps {
  checked: boolean;
  onChange(checked: boolean): void;
  /** Its name, for a screen reader. */
  label: string;
}

/** An on/off switch. Put it in a <label> with its name, so tapping the name toggles it too. */
export function Switch({ checked, onChange, label }: SwitchProps) {
  return <button type="button" role="switch" className="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} />;
}

interface SegmentedProps<T extends string> {
  /** Each choice: its value and its name. */
  options: readonly (readonly [T, string])[];
  value: T;
  onChange(value: T): void;
  label: string;
}

/** One of a few choices, side by side. The arrow keys move between them. */
export function Segmented<T extends string>({ options, value, onChange, label }: SegmentedProps<T>) {
  const keys = (e: React.KeyboardEvent) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const i = (options.findIndex(([v]) => v === value) + step + options.length) % options.length;
    onChange(options[i][0]);
    (e.currentTarget.children[i] as HTMLElement | undefined)?.focus();
  };
  return (
    <div className="segmented" role="radiogroup" aria-label={label} onKeyDown={keys}>
      {options.map(([v, name]) => (
        <button key={v} type="button" role="radio" aria-checked={v === value} tabIndex={v === value ? 0 : -1} onClick={() => onChange(v)}>
          {name}
        </button>
      ))}
    </div>
  );
}
