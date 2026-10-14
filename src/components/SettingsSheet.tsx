import type { Settings, Theme } from '../settings';
import { BookmarkletSetup } from './BookmarkletSetup';
import { Segmented, Switch } from './Controls';
import { Sheet } from './Sheet';

interface Props {
  settings: Settings;
  onChange(settings: Settings): void;
  onClose(): void;
  onToast(text: string): void;
}

const THEMES = [
  ['auto', 'Automatic'],
  ['light', 'Light'],
  ['dark', 'Dark'],
] as const satisfies readonly (readonly [Theme, string])[];

/** Settings, behind the gear, grouped as the Settings app groups them. */
export function SettingsSheet({ settings, onChange, onClose, onToast }: Props) {
  const set = (change: Partial<Settings>) => onChange({ ...settings, ...change });

  return (
    <Sheet
      title="Settings"
      onClose={onClose}
      className="settings"
      trailing={
        <button type="button" className="nav-button strong" onClick={onClose} autoFocus>
          Done
        </button>
      }
    >
      <h3 className="group-header">Appearance</h3>
      <div className="group">
        <div className="cell">
          <Segmented label="Appearance" options={THEMES} value={settings.theme} onChange={(theme) => set({ theme })} />
        </div>
      </div>

      <h3 className="group-header">Playing</h3>
      <div className="group">
        <label className="cell setting-row">
          <span>Mark Done When I Come Back</span>
          <Switch label="Mark done when I come back" checked={settings.doneOnReturn} onChange={(doneOnReturn) => set({ doneOnReturn })} />
        </label>
      </div>
      <p className="group-footer">Coming back from a puzzle ticks it, and Not Yet undoes that. Off, you tick each one yourself.</p>

      <div className="group">
        <label className="cell setting-row">
          <span>
            Puzzle Done Bookmark <span className="setting-note">(Desktop only)</span>
          </span>
          <Switch label="Puzzle done bookmark (desktop only)" checked={settings.bookmarklet} onChange={(bookmarklet) => set({ bookmarklet })} />
        </label>
        {settings.bookmarklet && <BookmarkletSetup onToast={onToast} />}
      </div>
      <p className="group-footer">On a finished puzzle, click it: it checks the puzzle's done, keeps your score and brings you back.</p>
    </Sheet>
  );
}
