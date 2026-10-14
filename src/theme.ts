// Light or dark: the page's colours follow `data-theme` on <html> (src/styles.css). index.html sets it before the
// first paint, from the saved setting; this keeps it in step when the setting changes, and, on Automatic, when the
// device switches between light and dark.

import type { Theme } from './settings';

const deviceDark = matchMedia('(prefers-color-scheme: dark)');
let current: Theme = 'auto';

/** Shows the page light, dark, or as the device is. */
export function applyTheme(theme: Theme) {
  current = theme;
  const dark = theme === 'dark' || (theme === 'auto' && deviceDark.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  // The browser's own colour around the page.
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#000000' : '#ffffff');
}

// On Automatic, the page follows the device as it switches; and checks again when it's shown, in case it switched
// while the page was out of sight.
deviceDark.addEventListener('change', () => current === 'auto' && applyTheme('auto'));
document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && current === 'auto' && applyTheme('auto'));
