import { describe, expect, it } from 'vitest';
import { bookmarklet } from './bookmarklet';

const BASE = 'https://strokes.fun/playlist/';

describe('the bookmarklet', () => {
  const code = bookmarklet(BASE);

  it('is a javascript: address without a "%", which a browser would decode', () => {
    expect(code.startsWith('javascript:')).toBe(true);
    expect(code).not.toContain('%');
  });

  it("loads the playlist's check.js, fresh each time, and says where the playlist is", () => {
    const appended: { src?: string; attrs: Record<string, string> }[] = [];
    const element = { attrs: {} as Record<string, string>, src: '', setAttribute(k: string, v: string) { this.attrs[k] = v; } };
    const document = { createElement: () => element, head: { appendChild: (el: typeof element) => appended.push(el) } };
    new Function('document', 'location', 'confirm', 'encodeURIComponent', code.slice('javascript:'.length))(document, {}, () => false, encodeURIComponent);
    expect(appended).toHaveLength(1);
    expect(appended[0].src).toMatch(new RegExp(`^${BASE}check\\.js\\?\\d+$`));
    expect(appended[0].attrs['data-playlist']).toBe(BASE);
  });

  it("asks to count the puzzle when the page won't let it load, and goes back with the page's address", () => {
    const location = { href: 'https://strict.example/puzzle' };
    const document = { createElement: () => { throw new TypeError('blocked'); } };
    new Function('document', 'location', 'confirm', 'encodeURIComponent', code.slice('javascript:'.length))(document, location, () => true, encodeURIComponent);
    expect(location.href).toBe(`${BASE}#done=&how=unchecked&url=${encodeURIComponent('https://strict.example/puzzle')}`);
  });
});
