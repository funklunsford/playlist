// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import { catalogPuzzle } from '../catalog';
import { shareText } from './capture';
import { ruleFor, type Rule } from './rules';

const rule = (id: string) => ruleFor(catalogPuzzle(id)!.url) as Rule;

/** A button that does something when pressed, as a game's would. */
function button(label: string, onPress: () => void, className = '') {
  const b = document.createElement('button');
  b.textContent = label;
  b.className = className;
  b.addEventListener('click', onPress);
  document.body.append(b);
  return b;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe("catching a game's share text", () => {
  it('when it copies to the clipboard, which still gets the text', async () => {
    let copied = '';
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (t: string) => void (copied = t) } });
    button('Share', () => navigator.clipboard.writeText('Wordle 1,578 3/6\n\n🟩🟩🟩🟩🟩'), 'Footer-module_shareButton__x1');
    expect(await shareText(document, rule('nyt-wordle'))).toBe('Wordle 1,578 3/6\n\n🟩🟩🟩🟩🟩');
    expect(copied).toBe('Wordle 1,578 3/6\n\n🟩🟩🟩🟩🟩');
  });

  it('when it opens the share sheet, which stays shut', async () => {
    let opened = false;
    Object.defineProperty(navigator, 'share', { configurable: true, writable: true, value: async () => void (opened = true) });
    button('Share', () => navigator.share({ text: 'Pips #123 Easy 🟢\n1:23' }));
    expect(await shareText(document, rule('nyt-pips'))).toBe('Pips #123 Easy 🟢\n1:23');
    expect(opened).toBe(false);
  });

  it('pressing the steps to its Share in turn', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => {} } });
    button('View Results', () => button('Share Your Results', () => navigator.clipboard.writeText('Connections\nPuzzle #861\n🟨🟨🟨🟨')));
    expect(await shareText(document, rule('nyt-connections'))).toBe('Connections\nPuzzle #861\n🟨🟨🟨🟨');
  });

  it("not when what's shared isn't the game's result", async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => {} } });
    button('Share', () => navigator.clipboard.writeText('Play Octordle with me! https://octordle.com'));
    expect(await shareText(document, rule('nyt-wordle'))).toBeUndefined();
  });

  it('puts the browser back as it was afterwards', async () => {
    const share = async () => {};
    Object.defineProperty(navigator, 'share', { configurable: true, writable: true, value: share });
    button('Share', () => navigator.share({ text: 'Strands #591' }));
    await shareText(document, rule('nyt-strands'));
    expect(navigator.share).toBe(share);
  });

  it("presses only a rule's own steps, not any Share on the page", async () => {
    let pressed = false;
    button('Share', () => (pressed = true));
    expect(await shareText(document, rule('nyt-wordle'))).toBeUndefined();
    expect(pressed).toBe(false);
  });

  it('presses nothing for a game whose share has no result (The Mini)', async () => {
    let pressed = false;
    button('Share', () => (pressed = true));
    expect(await shareText(document, rule('nyt-mini'))).toBeUndefined();
    expect(pressed).toBe(false);
  });
});
