import { defineConfig } from 'vite';

// check.js: what the bookmarklet loads into a puzzle's page (src/check/). It's one self-contained script,
// built next to the site, at a name that doesn't change, so the bookmarklet always finds the latest one.
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    copyPublicDir: false,
    lib: { entry: 'src/check/main.ts', formats: ['iife'], name: 'puzzlePlaylistCheck', fileName: () => 'check.js' },
  },
});
