import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths, so the built site works from any folder (GitHub Pages serves it at /playlist/).
  base: './',
  // Strokes' dev server has 5173.
  server: { port: 5174, strictPort: true },
  // Agents' worktrees live under .claude/worktrees: their copies of the tests aren't this checkout's.
  test: { exclude: [...configDefaults.exclude, '.claude/**'] },
});
