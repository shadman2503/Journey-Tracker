import { describe, it, expect } from 'vitest';
import {
  isDateInTimeRange,
  formatShortDate,
  calculateMockPerformanceTrend,
  calculatePracticeTrend,
  calculateSubjectPerformance,
  calculatePerformanceTrajectory,
  generatePerformanceAnalytics,
} from './performanceAnalytics';
import type { MockTest, StudySession } from './types';

describe('performanceAnalytics domain', () => {
  const refDate = new Date(2026, 9, 20); // 2026-10-20

  describe('isDateInTimeRange', () => {
    it('returns true for all range', () => {
      expect(isDateInTimeRange('2025-01-01', 'all', refDate)).toBe(true);
    });

    it('filters correctly for 30d range', () => {
      expect(isDateInTimeRange('2026-10-15', '30d', refDate)).toBe(true); // 5 days ago
      expect(isDateInTimeRange('2026-09-25', '30d', refDate)).toBe(true); // 25 days ago
      expect(isDateInTimeRange('2026-08-01', '30d', refDate)).toBe(false); // ~80 days ago
    });

    it('filters correctly for 60d and 90d ranges', () => {
      expect(isDateInTimeRange('2026-08-25', '60d', refDate)).toBe(true); // ~56 days ago
      expect(isDateInTimeRange('2026-07-01', '60d', refDate)).toBe(false); // >100 days ago
      expect(isDateInTimeRange('2026-07-25', '90d', refDate)).toBe(true); // ~87 days ago
    });
  });

  describe('formatShortDate', () => {
    it('formats YYYY-MM-DD into short display date', () => {
      const formatted = formatShortDate('2026-10-05');
      expect(formatted).toMatch(/Oct 5/);
    });
  });

  describe('calculateMockPerformanceTrend', () => {
    const tests: MockTest[] = [
      {
        id: 1,
        testName: 'Mock 1',
        date: '2026-10-01',
        totalQuestions: 100,
        correctAnswers: 60,
        wrongAnswers: 20,
        score: 55,
        accuracy: 75,
        timeTakenMinutes: 120,
        createdAt: '',
      },
      {
        id: 2,
        testName: 'Math Mock 1',
        date: '2026-10-05',
        subjectId: 'math',
        totalQuestions: 30,
        correctAnswers: 25,
        wrongAnswers: 4,
        score: 24,
        accuracy: 86.2,
        timeTakenMinutes: 45,
        createdAt: '',
      },
      {
        id: 3,
        testName: 'Mock 2',
        date: '2026-10-10',
        totalQuestions: 100,
        correctAnswers: 72,
        wrongAnswers: 16,
        score: 68,
        accuracy: 81.8,
        timeTakenMinutes: 110,
        createdAt: '',
      },
    ];

    it('sorts points chronologically oldest to newest for charting', () => {
      // Pass in reverse order to ensure it sorts oldest to newest
      const points = calculateMockPerformanceTrend([tests[2], tests[0], tests[1]]);
      expect(points.length).toBe(3);
      expect(points[0].date).toBe('2026-10-01');
      expect(points[1].date).toBe('2026-10-05');
      expect(points[2].date).toBe('2026-10-10');
      expect(points[0].score).toBe(55);
      expect(points[2].score).toBe(68);
    });

    it('filters by subjectId when specified', () => {
      const mathPoints = calculateMockPerformanceTrend(tests, 'all', 'math');
      expect(mathPoints.length).toBe(1);
      expect(mathPoints[0].testName).toBe('Math Mock 1');
    });

    it('returns empty array for empty tests list', () => {
      expect(calculateMockPerformanceTrend([])).toEqual([]);
    });
  });

  describe('calculatePracticeTrend', () => {
    const sessions: StudySession[] = [
      {
        id: 1,
        date: '2026-10-01',
        subjectId: 'math',
        topicId: 'math-1',
        durationMinutes: 45,
        questionsSolved: 20,
        correctAnswers: 16,
        createdAt: '',
      },
      {
        id: 2,
        date: '2026-10-01',
        subjectId: 'physics',
        topicId: 'phys-1',
        durationMinutes: 30,
        questionsSolved: 10,
        correctAnswers: 8,
        createdAt: '',
      },
      {
        id: 3,
        date: '2026-10-05',
        subjectId: 'chemistry',
        topicId: 'chem-1',
        durationMinutes: 60,
        questionsSolved: 25,
        correctAnswers: 20,
        createdAt: '',
      },
    ];

    it('aggregates multiple sessions on the same date', () => {
      const trend = calculatePracticeTrend(sessions);
      expect(trend.length).toBe(2); // 2026-10-01 and 2026-10-05
      expect(trend[0].date).toBe('2026-10-01');
      expect(trend[0].questionsSolved).toBe(30); // 20 + 10
      expect(trend[0].correctAnswers).toBe(24); // 16 + 8
      expect(trend[0].accuracy).toBe(80); // 24 / 30 = 80%
      expect(trend[0].durationMinutes).toBe(75); // 45 + 30
    });
  });

  describe('calculateSubjectPerformance', () => {
    const sessions: StudySession[] = [
      {
        id: 1,
        date: '2026-10-01',
        subjectId: 'math',
        topicId: 'm-1',
        durationMinutes: 60,
        questionsSolved: 40,
        correctAnswers: 32,
        createdAt: '',
      },
    ];

    const tests: MockTest[] = [
      {
        id: 1,
        testName: 'Math Sec 1',
        date: '2026-10-02',
        subjectId: 'math',
        totalQuestions: 30,
        correctAnswers: 24,
        wrongAnswers: 4,
        score: 23,
        accuracy: 85.7,
        timeTakenMinutes: 45,
        createdAt: '',
      },
    ];

    it('computes breakdown across all 5 DUET subjects', () => {
      const breakdown = calculateSubjectPerformance(sessions, tests);
      expect(breakdown.length).toBe(5);

      const math = breakdown.find((b) => b.subjectId === 'math')!;
      expect(math.practiceQuestions).toBe(40);
      expect(math.practiceAccuracy).toBe(80); // 32/40
      expect(math.mockTestsCount).toBe(1);
      expect(math.mockAverageScore).toBe(23);

      const physics = breakdown.find((b) => b.subjectId === 'physics')!;
      expect(physics.practiceQuestions).toBe(0);
      expect(physics.mockTestsCount).toBe(0);
    });
  });

  describe('calculatePerformanceTrajectory', () => {
    it('returns insufficient_data when fewer than 2 tests', () => {
      expect(calculatePerformanceTrajectory([]).direction).toBe('insufficient_data');
      expect(
        calculatePerformanceTrajectory([
          {
            id: 1,
            testName: 'M1',
            date: '2026-10-01',
            totalQuestions: 100,
            correctAnswers: 50,
            wrongAnswers: 20,
            score: 45,
            accuracy: 71.4,
            timeTakenMinutes: 100,
            createdAt: '',
          },
        ]).direction,
      ).toBe('insufficient_data');
    });

    it('detects improving score trajectory', () => {
      const tests: MockTest[] = [
        {
          id: 1,
          testName: 'M1',
          date: '2026-10-01',
          totalQuestions: 100,
          correctAnswers: 50,
          wrongAnswers: 20,
          score: 45,
          accuracy: 71.4,
          timeTakenMinutes: 100,
          createdAt: '',
        },
        {
          id: 2,
          testName: 'M2',
          date: '2026-10-05',
          totalQuestions: 100,
          correctAnswers: 60,
          wrongAnswers: 16,
          score: 56,
          accuracy: 78.9,
          timeTakenMinutes: 105,
          createdAt: '',
        },
        {
          id: 3,
          testName: 'M3',
          date: '2026-10-10',
          totalQuestions: 100,
          correctAnswers: 75,
          wrongAnswers: 12,
          score: 72,
          accuracy: 86.2,
          timeTakenMinutes: 110,
          createdAt: '',
        },
      ];

      const trajectory = calculatePerformanceTrajectory(tests);
      expect(trajectory.direction).toBe('improving');
      expect(trajectory.deltaScore).toBeGreaterThan(0);
      expect(trajectory.percentageChange).toBeGreaterThan(0);
    });

    it('detects declining score trajectory', () => {
      const tests: MockTest[] = [
        {
          id: 1,
          testName: 'M1',
          date: '2026-10-01',
          totalQuestions: 100,
          correctAnswers: 75,
          wrongAnswers: 10,
          score: 72.5,
          accuracy: 88,
          timeTakenMinutes: 110,
          createdAt: '',
        },
        {
          id: 2,
          testName: 'M2',
          date: '2026-10-10',
          totalQuestions: 100,
          correctAnswers: 50,
          wrongAnswers: 25,
          score: 43.75,
          accuracy: 66.7,
          timeTakenMinutes: 110,
          createdAt: '',
        },
      ];

      const trajectory = calculatePerformanceTrajectory(tests);
      expect(trajectory.direction).toBe('declining');
      expect(trajectory.deltaScore).toBeLessThan(0);
    });
  });

  describe('generatePerformanceAnalytics', () => {
    it('aggregates complete summary across sessions and tests', () => {
      const sessions: StudySession[] = [
        {
          id: 1,
          date: '2026-10-01',
          subjectId: 'math',
          topicId: 'm-1',
          durationMinutes: 90,
          questionsSolved: 30,
          correctAnswers: 24,
          createdAt: '',
        },
      ];

      const tests: MockTest[] = [
        {
          id: 1,
          testName: 'M1',
          date: '2026-10-05',
          totalQuestions: 100,
          correctAnswers: 70,
          wrongAnswers: 20,
          score: 65,
          accuracy: 77.8,
          timeTakenMinutes: 120,
          createdAt: '',
        },
      ];

      const summary = generatePerformanceAnalytics(sessions, tests);
      expect(summary.totalPracticeQuestions).toBe(30);
      expect(summary.overallPracticeAccuracy).toBe(80);
      expect(summary.totalMockQuestions).toBe(90); // 70 + 20
      expect(summary.averageMockScore).toBe(65);
      expect(summary.highestMockScore).toBe(65);
      expect(summary.totalHoursSpent).toBe(1.5); // 90m
      expect(summary.totalHoursFormatted).toBe('1.5 hrs');
      expect(summary.mockTrend.length).toBe(1);
      expect(summary.practiceTrend.length).toBe(1);
    });
  });
});

