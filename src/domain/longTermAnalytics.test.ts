import { describe, it, expect } from 'vitest';
import type { StudySession, MockTest, Mistake } from './types';
import {
  calculateCumulativeVolumeTrend,
  calculateStudyVelocityTrend,
  calculateSubjectTimeDistribution,
  calculatePreparationConsistencyMetrics,
  calculateMistakeResolutionAnalytics,
  calculateLongTermAnalyticsSummary,
  formatShortDate,
  formatHours,
  DUET_SUBJECT_BENCHMARK_PERCENTAGES,
} from './longTermAnalytics';

describe('longTermAnalytics domain logic', () => {
  const sampleSessions: StudySession[] = [
    {
      id: 1,
      date: '2026-10-01',
      subjectId: 'math',
      topicId: 'math-calc-01',
      durationMinutes: 60,
      questionsSolved: 30,
      correctAnswers: 25,
      createdAt: '',
    },
    {
      id: 2,
      date: '2026-10-03',
      subjectId: 'physics',
      topicId: 'phy-mech-01',
      durationMinutes: 90,
      questionsSolved: 45,
      correctAnswers: 36,
      createdAt: '',
    },
    {
      id: 3,
      date: '2026-10-03',
      subjectId: 'chemistry',
      topicId: 'chem-org-01',
      durationMinutes: 30,
      questionsSolved: 15,
      correctAnswers: 12,
      createdAt: '',
    },
    {
      id: 4,
      date: '2026-10-10',
      subjectId: 'cse',
      topicId: 'cse-ds-01',
      durationMinutes: 120,
      questionsSolved: 50,
      correctAnswers: 42,
      createdAt: '',
    },
  ];

  const sampleMockTests: MockTest[] = [
    {
      id: 1,
      testName: 'Model Test 01',
      date: '2026-10-05',
      subjectId: undefined, // full syllabus
      totalQuestions: 100,
      correctAnswers: 70,
      wrongAnswers: 20,
      score: 65,
      accuracy: 70,
      timeTakenMinutes: 120,
      createdAt: '',
    },
    {
      id: 2,
      testName: 'Math Sectional Test 01',
      date: '2026-10-12',
      subjectId: 'math',
      totalQuestions: 30,
      correctAnswers: 24,
      wrongAnswers: 4,
      score: 23,
      accuracy: 80,
      timeTakenMinutes: 45,
      createdAt: '',
    },
  ];

  const sampleMistakes: Mistake[] = [
    {
      id: 1,
      subjectId: 'math',
      topicId: 'math-calc-01',
      questionRef: 'Q12',
      whatWentWrong: 'Integration constant omitted',
      correctSolution: 'Add +C',
      type: 'formula',
      status: 'fixed',
      createdAt: '',
    },
    {
      id: 2,
      subjectId: 'math',
      topicId: 'math-calc-02',
      questionRef: 'Q18',
      whatWentWrong: 'Algebra sign error',
      correctSolution: 'Check signs',
      type: 'calculation',
      status: 'reviewing',
      createdAt: '',
    },
    {
      id: 3,
      subjectId: 'physics',
      topicId: 'phy-mech-01',
      questionRef: 'Q5',
      whatWentWrong: 'Forgot friction',
      correctSolution: 'Include friction term',
      type: 'conceptual',
      status: 'unresolved',
      createdAt: '',
    },
    {
      id: 4,
      subjectId: 'cse',
      topicId: 'cse-ds-01',
      questionRef: 'Q9',
      whatWentWrong: 'Off by one loop bounds',
      correctSolution: 'i <= n',
      type: 'careless',
      status: 'fixed',
      createdAt: '',
    },
  ];

  describe('formatShortDate and formatHours', () => {
    it('formats valid date strings correctly', () => {
      expect(formatShortDate('2026-10-05')).toMatch(/Oct\s*5/);
    });

    it('formats hour quantities appropriately', () => {
      expect(formatHours(0.5)).toBe('30m');
      expect(formatHours(2.5)).toBe('2.5 hrs');
      expect(formatHours(10)).toBe('10 hrs');
    });
  });

  describe('calculateCumulativeVolumeTrend', () => {
    it('returns empty array when no sessions or mock tests are passed', () => {
      expect(calculateCumulativeVolumeTrend([], [])).toEqual([]);
    });

    it('accumulates daily minutes into hours and questions chronologically', () => {
      const trend = calculateCumulativeVolumeTrend(
        sampleSessions,
        sampleMockTests,
      );
      expect(trend.length).toBe(5); // 2026-10-01, 2026-10-03, 2026-10-05, 2026-10-10, 2026-10-12

      // Oct 1: 60 mins (1 hr), 30 questions
      expect(trend[0].date).toBe('2026-10-01');
      expect(trend[0].cumulativeHours).toBe(1);
      expect(trend[0].cumulativeQuestions).toBe(30);

      // Oct 3: 90 + 30 = 120 mins (2 hrs), 45 + 15 = 60 questions => cumulative 3 hrs, 90 questions
      expect(trend[1].date).toBe('2026-10-03');
      expect(trend[1].dailyHours).toBe(2);
      expect(trend[1].cumulativeHours).toBe(3);
      expect(trend[1].cumulativeQuestions).toBe(90);

      // Oct 5 (Mock test): 120 mins (2 hrs), 100 questions => cumulative 5 hrs, 190 questions
      expect(trend[2].date).toBe('2026-10-05');
      expect(trend[2].dailyHours).toBe(2);
      expect(trend[2].cumulativeHours).toBe(5);
      expect(trend[2].cumulativeQuestions).toBe(190);

      // Final point: includes all sessions and tests
      const last = trend[trend.length - 1];
      expect(last.date).toBe('2026-10-12');
      expect(last.cumulativeQuestions).toBe(30 + 60 + 100 + 50 + 30);
    });
  });

  describe('calculateStudyVelocityTrend', () => {
    it('returns empty array when input is empty', () => {
      expect(calculateStudyVelocityTrend([], [])).toEqual([]);
    });

    it('groups activity into weekly periods and calculates accuracy and volume', () => {
      const velocity = calculateStudyVelocityTrend(
        sampleSessions,
        sampleMockTests,
      );
      expect(velocity.length).toBeGreaterThanOrEqual(2);

      const firstWeek = velocity[0];
      expect(firstWeek.periodKey).toBe('W1');
      expect(firstWeek.questionsSolved).toBeGreaterThan(0);
      expect(firstWeek.hoursSpent).toBeGreaterThan(0);
      expect(firstWeek.accuracy).toBeGreaterThan(0);
    });
  });

  describe('calculateSubjectTimeDistribution', () => {
    it('returns 5 DUET subjects with 0% when no activity is logged', () => {
      const dist = calculateSubjectTimeDistribution([], []);
      expect(dist.length).toBe(5);
      dist.forEach((s) => {
        expect(s.minutes).toBe(0);
        expect(s.percentage).toBe(0);
        expect(s.targetBenchmarkPercentage).toBe(
          DUET_SUBJECT_BENCHMARK_PERCENTAGES[s.subjectId],
        );
      });
    });

    it('calculates proportional time invested per subject correctly', () => {
      const dist = calculateSubjectTimeDistribution(
        sampleSessions,
        sampleMockTests,
      );
      const math = dist.find((s) => s.subjectId === 'math')!;
      const physics = dist.find((s) => s.subjectId === 'physics')!;
      const cse = dist.find((s) => s.subjectId === 'cse')!;
      const english = dist.find((s) => s.subjectId === 'english')!;

      // Math: 60 session mins + 45 mock test mins = 105 mins
      expect(math.minutes).toBe(105);
      expect(math.hours).toBe(1.8);

      // Physics: 90 session mins
      expect(physics.minutes).toBe(90);

      // CSE: 120 session mins
      expect(cse.minutes).toBe(120);

      // English: 0 mins
      expect(english.minutes).toBe(0);
      expect(english.percentage).toBe(0);

      const totalPercentage = dist.reduce(
        (acc, curr) => acc + curr.percentage,
        0,
      );
      expect(Math.round(totalPercentage)).toBe(100);
    });
  });

  describe('calculatePreparationConsistencyMetrics', () => {
    it('handles empty sessions safely', () => {
      const metrics = calculatePreparationConsistencyMetrics([]);
      expect(metrics.totalActiveDays).toBe(0);
      expect(metrics.totalSessions).toBe(0);
      expect(metrics.totalHours).toBe(0);
      expect(metrics.questionsPerHour).toBe(0);
      expect(metrics.averageSessionDurationMinutes).toBe(0);
    });

    it('computes consistency metrics accurately for sessions', () => {
      const metrics = calculatePreparationConsistencyMetrics(sampleSessions);
      // Unique dates: 2026-10-01, 2026-10-03, 2026-10-10 = 3 days
      expect(metrics.totalActiveDays).toBe(3);
      expect(metrics.totalSessions).toBe(4);
      // Total minutes: 60 + 90 + 30 + 120 = 300 mins (5 hrs)
      expect(metrics.totalHours).toBe(5);
      // Average session: 300 / 4 = 75 mins
      expect(metrics.averageSessionDurationMinutes).toBe(75);
      // Total questions: 30 + 45 + 15 + 50 = 140 questions in 5 hrs => 28 q/hr
      expect(metrics.questionsPerHour).toBe(28);
      // Average questions per active day: 140 / 3 = 47
      expect(metrics.averageQuestionsPerDay).toBe(47);
    });
  });

  describe('calculateMistakeResolutionAnalytics', () => {
    it('handles empty mistakes safely', () => {
      const metrics = calculateMistakeResolutionAnalytics([]);
      expect(metrics.totalMistakes).toBe(0);
      expect(metrics.resolutionRate).toBe(0);
      expect(metrics.resolvedCount).toBe(0);
    });

    it('calculates resolution rate and error type counts accurately', () => {
      const metrics = calculateMistakeResolutionAnalytics(sampleMistakes);
      expect(metrics.totalMistakes).toBe(4);
      expect(metrics.resolvedCount).toBe(2); // 2 fixed
      expect(metrics.reviewingCount).toBe(1);
      expect(metrics.unresolvedCount).toBe(1);
      // Resolution rate = 2 / 4 = 50%
      expect(metrics.resolutionRate).toBe(50);

      expect(metrics.byType.formula).toBe(1);
      expect(metrics.byType.calculation).toBe(1);
      expect(metrics.byType.conceptual).toBe(1);
      expect(metrics.byType.careless).toBe(1);

      expect(metrics.bySubject.math.total).toBe(2);
      expect(metrics.bySubject.math.resolved).toBe(1);
      expect(metrics.bySubject.physics.unresolved).toBe(1);
    });
  });

  describe('calculateLongTermAnalyticsSummary', () => {
    it('compiles full unified summary structure', () => {
      const summary = calculateLongTermAnalyticsSummary(
        sampleSessions,
        sampleMockTests,
        sampleMistakes,
      );

      expect(summary.cumulativeVolume.length).toBe(5);
      expect(summary.studyVelocity.length).toBeGreaterThan(0);
      expect(summary.subjectTimeDistribution.length).toBe(5);
      expect(summary.consistencyMetrics.totalActiveDays).toBe(3);
      expect(summary.mistakeResolution.totalMistakes).toBe(4);
      expect(summary.totalQuestionsSolved).toBe(140 + 130); // 140 practice + 130 mock
      expect(summary.totalHoursInvested).toBeGreaterThan(0);
    });
  });
});
