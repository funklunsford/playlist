// The playlist's settings, kept on this device: how it looks, whether coming back from a puzzle ticks it, and
// whether Settings shows the bookmarklet's setup.

import { readJson, writeJson, type KeyValue } from './store';

export type Theme = 'auto' | 'light' | 'dark';

export interface Settings {
  /** Light or dark, or as the device is ('auto'). */
  theme: Theme;
  /** Coming back from another site's puzzle ticks it, with Not yet to undo. Your own games always say for themselves. */
  doneOnReturn: boolean;
  /** Settings shows how to set up the bookmarklet (src/bookmarklet.ts). */
  bookmarklet: boolean;
}

// index.html reads the theme from here too, before the page is drawn.
export const SETTINGS_KEY = 'playlist:settings';

export const DEFAULT_SETTINGS: Settings = { theme: 'auto', doneOnReturn: true, bookmarklet: false };

const THEMES: readonly string[] = ['auto', 'light', 'dark'];

/** The saved settings; any that are missing or unreadable are the defaults. */
export function loadSettings(kv: KeyValue): Settings {
  const v = (readJson(kv, SETTINGS_KEY) ?? {}) as Record<string, unknown>;
  const flag = (key: 'doneOnReturn' | 'bookmarklet') => (typeof v[key] === 'boolean' ? (v[key] as boolean) : DEFAULT_SETTINGS[key]);
  return {
    theme: THEMES.includes(v.theme as string) ? (v.theme as Theme) : DEFAULT_SETTINGS.theme,
    doneOnReturn: flag('doneOnReturn'),
    bookmarklet: flag('bookmarklet'),
  };
}

export const saveSettings = (kv: KeyValue, settings: Settings) => writeJson(kv, SETTINGS_KEY, settings);
