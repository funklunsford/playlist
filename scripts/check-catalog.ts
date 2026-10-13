// Checks that every catalog address still answers, and flags any that redirect. The catalog keeps final
// addresses, so one Back from a puzzle returns to the playlist. Run it by hand when adding puzzles:
//
//   npm run check-catalog
//
// Some sites turn scripts away (403, 429), so those are marked to check by hand in a browser.
// Only a missing page (404, 410), a server error or no answer at all fails the run.

import { CATALOG } from '../src/catalog';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
const headers = { 'user-agent': UA, accept: 'text/html,application/xhtml+xml' };

type Verdict = 'ok' | 'redirects' | 'check by hand' | 'FAILS';

async function check(url: string): Promise<{ verdict: Verdict; detail: string }> {
  try {
    const first = await fetch(url, { redirect: 'manual', headers, signal: AbortSignal.timeout(20_000) });
    if (first.status >= 300 && first.status < 400) {
      const to = new URL(first.headers.get('location') ?? '', url).href;
      const last = await fetch(to, { headers, signal: AbortSignal.timeout(20_000) });
      return { verdict: 'redirects', detail: `${first.status} → ${last.url} (${last.status})` };
    }
    if (first.ok) return { verdict: 'ok', detail: String(first.status) };
    if (first.status === 403 || first.status === 429) return { verdict: 'check by hand', detail: `${first.status}: turned the script away` };
    return { verdict: 'FAILS', detail: String(first.status) };
  } catch (e) {
    return { verdict: 'FAILS', detail: e instanceof Error ? `${e.name}: ${e.message}` : String(e) };
  }
}

const results: { id: string; url: string; verdict: Verdict; detail: string }[] = [];
// (Only real addresses: on the dev server the catalog also has a stand-in game, by a relative one.)
const queue = CATALOG.filter((p) => /^https?:/.test(p.url));
await Promise.all(
  Array.from({ length: 6 }, async () => {
    for (let p = queue.shift(); p; p = queue.shift()) results.push({ id: p.id, url: p.url, ...(await check(p.url)) });
  }),
);

const order = new Map(CATALOG.map((p, i) => [p.id, i]));
results.sort((a, b) => order.get(a.id)! - order.get(b.id)!);
for (const r of results) console.log(`${r.verdict.padEnd(13)} ${r.id.padEnd(22)} ${r.detail}`);

const failed = results.filter((r) => r.verdict === 'FAILS');
const redirected = results.filter((r) => r.verdict === 'redirects');
console.log(`\n${results.length} puzzles: ${failed.length} failing, ${redirected.length} redirecting, ${results.filter((r) => r.verdict === 'check by hand').length} to check by hand.`);
if (failed.length) process.exit(1);
