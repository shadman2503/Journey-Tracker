import { describe, it, expect } from 'vitest';
import {
  createMockTestSchema,
  calculateMockScore,
  calculateMockAccuracy,
  calculateMockPercentage,
  calculateMockTestMetrics,
} from './mockTest';
import type { MockTest } from './types';

describe('createMockTestSchema', () => {
  const validFullSyllabus = {
    testName: 'DUET Full Model Test 1',
    date: '2026-10-10',
    totalQuestions: 100,
    correctAnswers: 70,
    wrongAnswers: 20,
    timeTakenMinutes: 120,
    notes: 'Good performance in Math and CSE',
  };

  it('validates a valid full syllabus mock test payload', () => {
    const result = createMockTestSchema.safeParse(validFullSyllabus);
    expect(result.success).toBe(true);
  });

  it('validates a valid subject-specific sectional test payload', () => {
    const sectional = {
      ...validFullSyllabus,
      testName: 'Math Sectional Test 1',
      subjectId: 'math',
      totalQuestions: 30,
      correctAnswers: 25,
      wrongAnswers: 4,
      timeTakenMinutes: 45,
    };
    const result = createMockTestSchema.safeParse(sectional);
    expect(result.success).toBe(true);
  });

  it('rejects empty or whitespace-only testName', () => {
    const invalid = { ...validFullSyllabus, testName: '   ' };
    const result = createMockTestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const invalid = { ...validFullSyllabus, date: '10/10/2026' };
    const result = createMockTestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects totalQuestions less than 1', () => {
    const invalid = { ...validFullSyllabus, totalQuestions: 0 };
    const result = createMockTestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects negative correct or wrong answers', () => {
    expect(
      createMockTestSchema.safeParse({ ...validFullSyllabus, correctAnswers: -1 })
        .success,
    ).toBe(false);
    expect(
      createMockTestSchema.safeParse({ ...validFullSyllabus, wrongAnswers: -5 })
        .success,
    ).toBe(false);
  });

  it('rejects when correct + wrong answers exceed totalQuestions', () => {
    const invalid = {
      ...validFullSyllabus,
      totalQuestions: 50,
      correctAnswers: 40,
      wrongAnswers: 15, // 40 + 15 = 55 > 50
    };
    const result = createMockTestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('cannot exceed total questions');
    }
  });

  it('rejects timeTakenMinutes less than 1', () => {
    const invalid = { ...validFullSyllabus, timeTakenMinutes: 0 };
    const result = createMockTestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('allows optional or empty notes', () => {
    const withoutNotes = { ...validFullSyllabus, notes: undefined };
    expect(createMockTestSchema.safeParse(withoutNotes).success).toBe(true);

    const emptyNotes = { ...validFullSyllabus, notes: '' };
    expect(createMockTestSchema.safeParse(emptyNotes).success).toBe(true);
  });
});

describe('calculateMockScore', () => {
  it('calculates score with 100% correct answers', () => {
    expect(calculateMockScore(50, 0)).toBe(50);
  });

  it('applies default DUET negative marking (-0.25 per wrong answer)', () => {
    // 80 correct, 20 wrong -> 80 - (20 * 0.25) = 80 - 5 = 75
    expect(calculateMockScore(80, 20)).toBe(75);
  });

  it('handles custom negative marking values', () => {
    // 60 correct, 10 wrong with 0.50 penalty -> 60 - 5 = 55
    expect(calculateMockScore(60, 10, 0.5)).toBe(55);
  });

  it('handles negative net scores correctly', () => {
    // 5 correct, 30 wrong -> 5 - 7.5 = -2.5
    expect(calculateMockScore(5, 30)).toBe(-2.5);
  });
});

describe('calculateMockAccuracy', () => {
  it('returns 0 when 0 questions attempted', () => {
    expect(calculateMockAccuracy(0, 0)).toBe(0);
  });

  it('calculates percentage of attempted questions rounded to 1 decimal', () => {
    // 16 correct out of 20 attempted = 80.0%
    expect(calculateMockAccuracy(16, 4)).toBe(80);
    // 7 correct out of 9 attempted = 77.777... -> 77.8%
    expect(calculateMockAccuracy(7, 2)).toBe(77.8);
  });
});

describe('calculateMockPercentage', () => {
  it('calculates score percentage of total questions', () => {
    expect(calculateMockPercentage(75, 100)).toBe(75);
    expect(calculateMockPercentage(45, 60)).toBe(75);
  });

  it('returns 0 if total questions is 0 or negative', () => {
    expect(calculateMockPercentage(50, 0)).toBe(0);
  });
});

describe('calculateMockTestMetrics', () => {
  it('returns zero summary for empty tests list', () => {
    const summary = calculateMockTestMetrics([]);
    expect(summary.totalTests).toBe(0);
    expect(summary.averageScore).toBe(0);
    expect(summary.averageAccuracy).toBe(0);
    expect(summary.highestScore).toBe(0);
    expect(summary.totalTimeSpentFormatted).toBe('0 hrs');
  });

  it('aggregates metrics across multiple tests correctly', () => {
    const tests: MockTest[] = [
      {
        id: 1,
        testName: 'Mock 1',
        date: '2026-10-01',
        totalQuestions: 100,
        correctAnswers: 70,
        wrongAnswers: 20,
        score: 65,
        accuracy: 77.8,
        timeTakenMinutes: 120,
        createdAt: '',
      },
      {
        id: 2,
        testName: 'Mock 2',
        date: '2026-10-08',
        totalQuestions: 100,
        correctAnswers: 80,
        wrongAnswers: 12,
        score: 77,
        accuracy: 87.0,
        timeTakenMinutes: 90,
        createdAt: '',
      },
    ];

    const summary = calculateMockTestMetrics(tests);
    expect(summary.totalTests).toBe(2);
    expect(summary.averageScore).toBe(71); // (65 + 77) / 2 = 71
    expect(summary.averageAccuracy).toBe(82.4); // (77.8 + 87.0) / 2 = 82.4
    expect(summary.highestScore).toBe(77);
    expect(summary.totalQuestionsAttempted).toBe(182); // (90 + 92)
    expect(summary.totalTimeSpentMinutes).toBe(210);
    expect(summary.totalTimeSpentFormatted).toBe('3.5 hrs');
  });
});

