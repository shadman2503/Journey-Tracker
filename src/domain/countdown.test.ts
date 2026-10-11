import { describe, it, expect } from 'vitest';
import {
  calculateCountdown,
  formatDigit,
  DEFAULT_EXAM_DATE,
  URGENCY_MESSAGES,
} from './countdown';

describe('calculateCountdown', () => {
  it('accurately calculates remaining days, hours, minutes, and seconds', () => {
    const now = new Date('2026-06-01T00:00:00Z');
    // 5 days, 4 hours, 30 minutes, 15 seconds later
    const target = new Date('2026-06-06T04:30:15Z');

    const result = calculateCountdown(target, now);
    expect(result.days).toBe(5);
    expect(result.hours).toBe(4);
    expect(result.minutes).toBe(30);
    expect(result.seconds).toBe(15);
    expect(result.isPast).toBe(false);
  });

  it('marks isPast as true and zeros values when target is in the past', () => {
    const now = new Date('2027-07-01T00:00:00Z');
    const target = new Date('2027-06-20T00:00:00Z');

    const result = calculateCountdown(target, now);
    expect(result.isPast).toBe(true);
    expect(result.days).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
    expect(result.urgencyLevel).toBe('completed');
    expect(result.timelineProgress).toBe(100);
  });

  it('assigns correct urgency levels based on days remaining', () => {
    const now = new Date('2027-01-01T00:00:00Z');

    // > 180 days
    const relaxedTarget = new Date('2027-08-01T00:00:00Z');
    expect(calculateCountdown(relaxedTarget, now).urgencyLevel).toBe('relaxed');

    // 120 days -> moderate
    const moderateTarget = new Date('2027-05-01T00:00:00Z');
    expect(calculateCountdown(moderateTarget, now).urgencyLevel).toBe('moderate');

    // 60 days -> high
    const highTarget = new Date('2027-03-02T00:00:00Z');
    expect(calculateCountdown(highTarget, now).urgencyLevel).toBe('high');

    // 20 days -> critical
    const criticalTarget = new Date('2027-01-21T00:00:00Z');
    expect(calculateCountdown(criticalTarget, now).urgencyLevel).toBe('critical');
  });

  it('calculates timeline progress clamped between 0 and 100', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const target = new Date('2026-01-11T00:00:00Z'); // 10 days total
    const halfway = new Date('2026-01-06T00:00:00Z'); // 5 days elapsed = 50%

    const result = calculateCountdown(target, halfway, start);
    expect(result.timelineProgress).toBe(50);
  });

  it('has valid urgency messages defined for all urgency levels', () => {
    expect(URGENCY_MESSAGES.relaxed).toBeTruthy();
    expect(URGENCY_MESSAGES.moderate).toBeTruthy();
    expect(URGENCY_MESSAGES.high).toBeTruthy();
    expect(URGENCY_MESSAGES.critical).toBeTruthy();
    expect(URGENCY_MESSAGES.completed).toBeTruthy();
  });

  it('exposes the standard default DUET exam date constant', () => {
    expect(DEFAULT_EXAM_DATE).toBe('2027-04-30T09:00:00+06:00');
  });
});

describe('formatDigit', () => {
  it('pads single digit numbers with leading zero', () => {
    expect(formatDigit(5)).toBe('05');
    expect(formatDigit(0)).toBe('00');
    expect(formatDigit(9)).toBe('09');
  });

  it('keeps multi-digit numbers unchanged', () => {
    expect(formatDigit(12)).toBe('12');
    expect(formatDigit(145)).toBe('145');
  });
});
