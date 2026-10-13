import { describe, expect, it } from 'vitest';
import { localDate } from './day';

describe('localDate', () => {
  it('is the calendar date on this device, from just after midnight to just before the next', () => {
    expect(localDate(new Date(2026, 9, 13, 0, 0, 1))).toBe('2026-10-13');
    expect(localDate(new Date(2026, 9, 13, 23, 59, 59))).toBe('2026-10-13');
    expect(localDate(new Date(2026, 9, 14, 0, 0, 0))).toBe('2026-10-14');
  });

  it('pads the month and day', () => {
    expect(localDate(new Date(2027, 0, 5))).toBe('2027-01-05');
  });
});
