// Today, as this device's calendar date. It's Strokes' localDate() (word-puzzle/src/daily/daily.ts), so the
// playlist and Strokes agree on what today is, and every puzzle starts afresh at local midnight.

/** A date as YYYY-MM-DD, in this device's time zone. */
export const localDate = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** A YYYY-MM-DD date as midnight on that day, in this device's time zone. */
const midnight = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** A YYYY-MM-DD date for the page, in the device's language: "Tuesday, October 13". */
export const longDate = (date: string) => midnight(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
