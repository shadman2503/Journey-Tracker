import { describe, it, expect } from 'vitest';
import {
  calculateStreak,
  getRecentDaysStatus,
  normalizeDateString,
} from './streak';

describe('normalizeDateString', () => {
  it('handles YYYY-MM-DD string as-is', () => {
    expect(normalizeDateString('2026-10-10')).toBe('2026-10-10');
  });

  it('formats full ISO string to YYYY-MM-DD', () => {
    expect(normalizeDateString('2026-10-10T14:32:00.000Z')).toBe('2026-10-10');
  });

  it('formats Date object to YYYY-MM-DD', () => {
    const d = new Date(2026, 9, 10); // Note: month is 0-indexed in JS (9 = Oct)
    expect(normalizeDateString(d)).toBe('2026-10-10');
  });
});

describe('getRecentDaysStatus', () => {
  const refDate = '2026-10-10';

  it('returns 7 days by default with correct isToday flag', () => {
    const days = getRecentDaysStatus([], refDate);
    expect(days).toHaveLength(7);
    expect(days[6].isToday).toBe(true);
    expect(days[6].date).toBe('2026-10-10');
    expect(days[5].isToday).toBe(false);
    expect(days[5].date).toBe('2026-10-09');
    expect(days[0].date).toBe('2026-10-04');
    expect(days.every((d) => !d.hasStudied)).toBe(true);
  });

  it('flags studied days correctly', () => {
    const sessions = ['2026-10-08', '2026-10-10'];
    const days = getRecentDaysStatus(sessions, refDate);

    expect(days.find((d) => d.date === '2026-10-10')?.hasStudied).toBe(true);
    expect(days.find((d) => d.date === '2026-10-09')?.hasStudied).toBe(false);
    expect(days.find((d) => d.date === '2026-10-08')?.hasStudied).toBe(true);
    expect(days.find((d) => d.date === '2026-10-07')?.hasStudied).toBe(false);
  });

  it('supports custom day counts', () => {
    const days = getRecentDaysStatus([], refDate, 3);
    expect(days).toHaveLength(3);
    expect(days[2].date).toBe('2026-10-10');
    expect(days[0].date).toBe('2026-10-08');
  });
});

describe('calculateStreak', () => {
  const refDate = '2026-10-10';

  it('returns zero and inactive status for empty dates', () => {
    const result = calculateStreak([], refDate);

    expect(result.currentStreak).toBe(0);
    expect(result.bestStreak).toBe(0);
    expect(result.status).toBe('inactive');
    expect(result.lastStudiedDate).toBeNull();
    expect(result.totalActiveDays).toBe(0);
    expect(result.recentDays).toHaveLength(7);
    expect(result.message).toContain('Start your study streak today');
  });

  it('calculates active 1-day streak when user studied today only', () => {
    const result = calculateStreak(['2026-10-10'], refDate);

    expect(result.currentStreak).toBe(1);
    expect(result.bestStreak).toBe(1);
    expect(result.status).toBe('active');
    expect(result.lastStudiedDate).toBe('2026-10-10');
    expect(result.totalActiveDays).toBe(1);
    expect(result.message).toContain('1-day streak started');
  });

  it('calculates at-risk 1-day streak when user studied yesterday but not today', () => {
    const result = calculateStreak(['2026-10-09'], refDate);

    expect(result.currentStreak).toBe(1);
    expect(result.bestStreak).toBe(1);
    expect(result.status).toBe('at_risk');
    expect(result.lastStudiedDate).toBe('2026-10-09');
    expect(result.totalActiveDays).toBe(1);
    expect(result.message).toContain('turn your 1-day momentum into a streak');
  });

  it('calculates at-risk multi-day streak with warning message', () => {
    const dates = ['2026-10-07', '2026-10-08', '2026-10-09'];
    const result = calculateStreak(dates, refDate);

    expect(result.currentStreak).toBe(3);
    expect(result.bestStreak).toBe(3);
    expect(result.status).toBe('at_risk');
    expect(result.message).toContain('3-day streak at risk');
  });

  it('marks streak as inactive if last studied 2 or more days ago', () => {
    const dates = ['2026-10-05', '2026-10-06', '2026-10-07']; // last studied on 7th, ref is 10th (3 days ago)
    const result = calculateStreak(dates, refDate);

    expect(result.currentStreak).toBe(0);
    expect(result.bestStreak).toBe(3);
    expect(result.status).toBe('inactive');
    expect(result.lastStudiedDate).toBe('2026-10-07');
    expect(result.totalActiveDays).toBe(3);
  });

  it('calculates multi-day active streak including today', () => {
    const dates = [
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
    ];
    const result = calculateStreak(dates, refDate);

    expect(result.currentStreak).toBe(5);
    expect(result.bestStreak).toBe(5);
    expect(result.status).toBe('active');
    expect(result.message).toContain('personal best');
  });

  it('handles deduplication of multiple sessions on the same day', () => {
    const dates = [
      '2026-10-09',
      '2026-10-09T08:00:00Z',
      '2026-10-09T18:30:00Z',
      '2026-10-10',
      '2026-10-10T12:00:00Z',
    ];
    const result = calculateStreak(dates, refDate);

    expect(result.totalActiveDays).toBe(2);
    expect(result.currentStreak).toBe(2);
    expect(result.bestStreak).toBe(2);
    expect(result.status).toBe('active');
  });

  it('handles unordered dates correctly', () => {
    const dates = ['2026-10-10', '2026-10-08', '2026-10-09'];
    const result = calculateStreak(dates, refDate);

    expect(result.currentStreak).toBe(3);
    expect(result.bestStreak).toBe(3);
    expect(result.status).toBe('active');
  });

  it('retains past historical best streak when current streak is smaller or reset', () => {
    // 4-day streak in September, then broken, then 2-day streak ending today
    const dates = [
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04', // 4-day historical run
      '2026-10-09',
      '2026-10-10', // 2-day current run
    ];
    const result = calculateStreak(dates, refDate);

    expect(result.bestStreak).toBe(4);
    expect(result.currentStreak).toBe(2);
    expect(result.status).toBe('active');
    expect(result.totalActiveDays).toBe(6);
  });

  it('calculates streaks correctly across month boundaries', () => {
    const monthBoundaryDates = [
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
    ];
    const octRefDate = '2026-10-02';
    const result = calculateStreak(monthBoundaryDates, octRefDate);

    expect(result.currentStreak).toBe(4);
    expect(result.bestStreak).toBe(4);
    expect(result.status).toBe('active');
  });

  it('calculates streaks correctly across leap year boundaries', () => {
    const leapYearDates = ['2028-02-28', '2028-02-29', '2028-03-01'];
    const leapRefDate = '2028-03-01';
    const result = calculateStreak(leapYearDates, leapRefDate);

    expect(result.currentStreak).toBe(3);
    expect(result.bestStreak).toBe(3);
    expect(result.status).toBe('active');
  });
});
