import { describe, it, expect } from 'vitest';
import { calculateTopicProgressPercentage, calculateStudyStreak } from './calculations';

describe('calculateTopicProgressPercentage', () => {
  it('returns 0 when there are no topics', () => {
    expect(calculateTopicProgressPercentage(0, [])).toBe(0);
  });

  it('calculates progress accurately according to status weightings', () => {
    const progressList = [
      { topicId: '1', status: 'strong' as const, updatedAt: '' },
      { topicId: '2', status: 'learning' as const, updatedAt: '' },
    ];
    // 1.0 + 0.4 = 1.4 / 2 = 70%
    expect(calculateTopicProgressPercentage(2, progressList)).toBe(70);
  });
});

describe('calculateStudyStreak', () => {
  it('returns 0 streaks for empty dates', () => {
    expect(calculateStudyStreak([])).toEqual({ currentStreak: 0, bestStreak: 0 });
  });

  it('calculates best streak correctly across consecutive dates', () => {
    const dates = ['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-05', '2026-03-06'];
    const result = calculateStudyStreak(dates);
    expect(result.bestStreak).toBe(3);
  });
});

