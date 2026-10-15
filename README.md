# Puzzle Playlist

Today's puzzles as a playlist. Press ▶ and the first one opens in this tab; come back, and it's ticked, with ▶ Next on the one after. Add a puzzle by typing its name. [DESIGN.md](DESIGN.md) has the design, and what browsers do and don't allow.

```bash
npm install
npm run dev     # http://localhost:5174 (Strokes' dev server keeps 5173)
npm test
npm run build
```

Play it at **https://strokes.fun/playlist/**. Strokes' site (funklunsford/word-puzzle, `functions/playlist/`) forwards it from GitHub Pages, so it shares Strokes' origin and sees when Strokes is done. Every merge to `main` is tested and published to GitHub Pages, https://funklunsford.github.io/playlist/, by GitHub Actions (`.github/workflows/deploy.yml`), with Pages set to build from Actions; strokes.fun shows it at once.
