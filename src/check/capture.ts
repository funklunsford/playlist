// Catching what a game shares when the check presses its Share button. Games hand their text to
// navigator.clipboard.writeText, navigator.share, or (older ones) document.execCommand("copy"); for a moment
// each is wrapped to keep a copy of the text. A copy still reaches the clipboard as the game meant, but the share
// sheet isn't opened. stop() puts everything back.

import { findStep, shareButtons, type Rule } from './rules';

interface Capture {
  /** The text shared, once there is some. */
  text: Promise<string>;
  stop(): void;
}

/** The text being copied: the selection, or the selected part of a text field (how execCommand copies). */
function selectedText(): string {
  const el = document.activeElement as HTMLTextAreaElement | HTMLInputElement | null;
  if (el && typeof el.value === 'string' && typeof el.selectionStart === 'number')
    return el.value.slice(el.selectionStart, el.selectionEnd ?? undefined) || el.value;
  return String(document.getSelection() ?? '');
}

export function capture(): Capture {
  let found: (text: string) => void = () => {};
  const text = new Promise<string>((resolve) => (found = resolve));
  const undo: (() => void)[] = [];

  /** Puts `value` on `obj` as its own property, to be taken off again by stop(). */
  const wrap = (obj: object, key: string, value: unknown) => {
    const own = Object.getOwnPropertyDescriptor(obj, key);
    try {
      Object.defineProperty(obj, key, { configurable: true, writable: true, value });
      undo.push(() => (own ? Object.defineProperty(obj, key, own) : delete (obj as Record<string, unknown>)[key]));
    } catch {
      /* not wrappable here: that way of sharing goes uncaught */
    }
  };

  const clipboard = navigator.clipboard;
  if (clipboard) {
    const write = clipboard.writeText?.bind(clipboard);
    wrap(clipboard, 'writeText', (t: string) => {
      found(String(t));
      return write ? write(t).catch(() => {}) : Promise.resolve();
    });
  }
  wrap(navigator, 'share', (data?: ShareData) => {
    found([data?.title, data?.text, data?.url].filter(Boolean).join('\n'));
    return Promise.resolve();
  });
  wrap(navigator, 'canShare', () => true);
  const exec = typeof document.execCommand === 'function' ? document.execCommand.bind(document) : undefined;
  if (exec)
    wrap(document, 'execCommand', (command: string, ...rest: [boolean?, string?]) => {
      if (String(command).toLowerCase() === 'copy') found(selectedText());
      return exec(command, ...rest);
    });

  return { text, stop: () => undo.reverse().forEach((f) => f()) };
}

const wait = (ms: number) => new Promise<undefined>((resolve) => setTimeout(resolve, ms));

/**
 * The game's own share text, by pressing the rule's buttons in turn (a step not on the page is passed over), or,
 * for a rule without steps, the page's Share buttons. Undefined if nothing was shared, or what was shared isn't
 * the game's result.
 */
export async function shareText(doc: Document, rule: Rule): Promise<string | undefined> {
  if (!rule.result) return undefined;
  const result = rule.result;
  const caught = capture();
  try {
    const presses = rule.share ? rule.share.map((step) => () => findStep(doc, step)) : [() => shareButtons(doc)[0], () => shareButtons(doc)[1]];
    for (const press of presses) {
      const button = press();
      if (!button) continue;
      button.click();
      const text = await Promise.race([caught.text, wait(800)]);
      if (text !== undefined) return result.test(text) ? text : undefined;
    }
    return undefined;
  } finally {
    caught.stop();
  }
}
