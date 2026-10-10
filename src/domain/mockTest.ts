import { z } from 'zod';
import type { MockTest } from './types';

export const createMockTestSchema = z
  .object({
    testName: z
      .string({ required_error: 'Test name is required' })
      .trim()
      .min(1, 'Test name is required')
      .max(100, 'Test name must be 100 characters or fewer'),
    date: z
      .string({ required_error: 'Test date is required' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    subjectId: z
      .enum(['math', 'physics', 'chemistry', 'english', 'cse'] as const)
      .optional(),
    totalQuestions: z
      .number({ required_error: 'Total questions is required' })
      .int('Total questions must be an integer')
      .min(1, 'Total questions must be at least 1')
      .max(500, 'Total questions cannot exceed 500'),
    correctAnswers: z
      .number({ required_error: 'Correct answers count is required' })
      .int('Correct answers must be an integer')
      .min(0, 'Correct answers cannot be negative'),
    wrongAnswers: z
      .number({ required_error: 'Wrong answers count is required' })
      .int('Wrong answers must be an integer')
      .min(0, 'Wrong answers cannot be negative'),
    timeTakenMinutes: z
      .number({ required_error: 'Time taken is required' })
      .int('Time taken must be an integer in minutes')
      .min(1, 'Time taken must be at least 1 minute')
      .max(1440, 'Time taken cannot exceed 24 hours (1440 minutes)'),
    notes: z
      .string()
      .trim()
      .max(1000, 'Notes must be 1000 characters or fewer')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => data.correctAnswers + data.wrongAnswers <= data.totalQuestions,
    {
      message: 'Sum of correct and wrong answers cannot exceed total questions',
      path: ['correctAnswers'],
    },
  );

export type CreateMockTestInput = z.infer<typeof createMockTestSchema>;

export interface MockTestMetricsSummary {
  totalTests: number;
  averageScore: number;
  averageAccuracy: number;
  highestScore: number;
  totalQuestionsAttempted: number;
  totalTimeSpentMinutes: number;
  totalTimeSpentFormatted: string;
}

/**
 * Calculates score using DUET standard negative marking (default -0.25 per wrong answer).
 */
export function calculateMockScore(
  correctAnswers: number,
  wrongAnswers: number,
  negativeMarking: number = 0.25,
): number {
  const rawScore = correctAnswers * 1 - wrongAnswers * negativeMarking;
  return Math.round(rawScore * 100) / 100;
}

/**
 * Calculates accuracy percentage across attempted questions (0 - 100).
 */
export function calculateMockAccuracy(
  correctAnswers: number,
  wrongAnswers: number,
): number {
  const attempted = correctAnswers + wrongAnswers;
  if (attempted <= 0) return 0;
  const accuracy = (correctAnswers / attempted) * 100;
  return Math.round(accuracy * 10) / 10;
}

/**
 * Calculates score percentage against total questions.
 */
export function calculateMockPercentage(
  score: number,
  totalQuestions: number,
): number {
  if (totalQuestions <= 0) return 0;
  const pct = (score / totalQuestions) * 100;
  return Math.round(pct * 10) / 10;
}

/**
 * Calculates summary metrics across a collection of mock tests.
 */
export function calculateMockTestMetrics(
  tests: MockTest[],
): MockTestMetricsSummary {
  if (!tests || tests.length === 0) {
    return {
      totalTests: 0,
      averageScore: 0,
      averageAccuracy: 0,
      highestScore: 0,
      totalQuestionsAttempted: 0,
      totalTimeSpentMinutes: 0,
      totalTimeSpentFormatted: '0 hrs',
    };
  }

  let totalScore = 0;
  let totalAccuracy = 0;
  let highestScore = -Infinity;
  let totalQuestionsAttempted = 0;
  let totalTimeSpentMinutes = 0;

  for (const t of tests) {
    totalScore += t.score;
    totalAccuracy += t.accuracy;
    if (t.score > highestScore) {
      highestScore = t.score;
    }
    totalQuestionsAttempted += t.correctAnswers + t.wrongAnswers;
    totalTimeSpentMinutes += t.timeTakenMinutes || 0;
  }

  const totalTests = tests.length;
  const averageScore = Math.round((totalScore / totalTests) * 100) / 100;
  const averageAccuracy = Math.round((totalAccuracy / totalTests) * 10) / 10;

  const hours = totalTimeSpentMinutes / 60;
  const totalTimeSpentFormatted =
    hours % 1 === 0 ? `${hours} hrs` : `${hours.toFixed(1)} hrs`;

  return {
    totalTests,
    averageScore,
    averageAccuracy,
    highestScore: highestScore === -Infinity ? 0 : highestScore,
    totalQuestionsAttempted,
    totalTimeSpentMinutes,
    totalTimeSpentFormatted,
  };
}

