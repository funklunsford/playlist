import { describe, expect, it } from 'vitest';
import { addDays, localDate } from './day';

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

describe('addDays', () => {
  it('counts calendar days, across months and years', () => {
    expect(addDays('2026-10-13', 1)).toBe('2026-10-14');
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31');
    expect(addDays('2026-10-13', -90)).toBe('2026-07-15');
  });
});
