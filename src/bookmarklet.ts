// The bookmarklet: a bookmark whose address is a little JavaScript. Clicked on a puzzle, it loads check.js (see
// src/check/) from the playlist's own site, the latest version every time, so the checks can be fixed without
// reinstalling it. It holds no "%", since a browser decodes %-escapes in a bookmark's address before running it.
// If check.js can't load (a site that blocks outside scripts), it asks whether to count the puzzle anyway.

/** The bookmarklet for the playlist at `base` (its address, ending in "/"). */
export function bookmarklet(base: string): string {
  const b = JSON.stringify(base);
  const fallback = `if(confirm("Puzzle Playlist can't check this page. Count the puzzle as done?"))location.href=b+"#done=&how=unchecked&url="+encodeURIComponent(location.href)`;
  return (
    `javascript:(function(){var b=${b},d=document;try{var s=d.createElement("script");` +
    `s.src=b+"check.js?"+Date.now();s.setAttribute("data-playlist",b);s.onerror=function(){${fallback}};` +
    `(d.head||d.documentElement).appendChild(s)}catch(e){${fallback}}})()`
  );
}
