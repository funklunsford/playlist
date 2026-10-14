import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, loadSettings, saveSettings, SETTINGS_KEY } from './settings';
import { memoryStorage } from './store';

describe('the settings', () => {
  it('start as the device is, ticking puzzles on coming back, with the bookmarklet tucked away', () => {
    expect(loadSettings(memoryStorage())).toEqual({ theme: 'auto', doneOnReturn: true, bookmarklet: false });
  });

  it('come back as saved', () => {
    const kv = memoryStorage();
    saveSettings(kv, { theme: 'dark', doneOnReturn: false, bookmarklet: true });
    expect(loadSettings(kv)).toEqual({ theme: 'dark', doneOnReturn: false, bookmarklet: true });
  });

  it('keep the defaults for anything missing or unreadable', () => {
    const kv = memoryStorage();
    kv.setItem(SETTINGS_KEY, JSON.stringify({ theme: 'purple', doneOnReturn: 'no' }));
    expect(loadSettings(kv)).toEqual(DEFAULT_SETTINGS);
    kv.setItem(SETTINGS_KEY, 'null');
    expect(loadSettings(kv)).toEqual(DEFAULT_SETTINGS);
  });
});
