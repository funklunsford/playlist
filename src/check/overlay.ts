// The check's word on the puzzle's page: a small bar along the bottom, in its own shadow root so the page's
// styles can't reach it. It says what it's doing, and asks when it can't tell.

export interface Overlay {
  /** Shows a message; with `ms`, takes it away after that long. */
  say(text: string, ms?: number): void;
  /** Asks a question with two answers: true for the first. */
  ask(text: string, yes: string, no: string): Promise<boolean>;
  close(): void;
}

const STYLE = `
  .bar { pointer-events: auto; display: flex; align-items: center; gap: 12px; max-width: min(92vw, 560px);
    padding: 12px 14px 12px 18px; border-radius: 999px; background: #1b1b20; color: #f3f3f6;
    font: 600 15px/1.35 -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    box-shadow: 0 8px 28px rgb(0 0 0 / 0.35); }
  .who { color: #63e6e2; font-weight: 700; white-space: nowrap; }
  .text { flex: 1; }
  button { font: inherit; border: none; border-radius: 999px; padding: 8px 14px; cursor: pointer; white-space: nowrap; }
  .yes { background: #63e6e2; color: #000000; font-weight: 600; }
  .no { background: transparent; color: #f3f3f6; }
`;

export function overlay(): Overlay {
  document.getElementById('puzzle-playlist-check')?.remove();
  const host = document.createElement('div');
  host.id = 'puzzle-playlist-check';
  host.style.cssText = 'all:initial;position:fixed;left:0;right:0;bottom:24px;z-index:2147483647;display:flex;justify-content:center;pointer-events:none';
  const root = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = STYLE;
  const bar = document.createElement('div');
  bar.className = 'bar';
  bar.setAttribute('role', 'status');
  const who = document.createElement('span');
  who.className = 'who';
  who.textContent = 'Puzzle Playlist';
  const text = document.createElement('span');
  text.className = 'text';
  bar.append(who, text);
  root.append(style, bar);
  document.documentElement.append(host);

  let timer: ReturnType<typeof setTimeout> | undefined;
  const close = () => {
    clearTimeout(timer);
    host.remove();
  };
  const clearButtons = () => bar.querySelectorAll('button').forEach((b) => b.remove());

  return {
    say(message, ms) {
      clearTimeout(timer);
      clearButtons();
      text.textContent = message;
      if (ms) timer = setTimeout(close, ms);
    },
    ask(message, yes, no) {
      clearTimeout(timer);
      clearButtons();
      text.textContent = message;
      return new Promise((resolve) => {
        const button = (label: string, className: string, answer: boolean) => {
          const b = document.createElement('button');
          b.className = className;
          b.textContent = label;
          b.onclick = () => resolve(answer);
          return b;
        };
        bar.append(button(no, 'no', false), button(yes, 'yes', true));
      });
    },
    close,
  };
}
