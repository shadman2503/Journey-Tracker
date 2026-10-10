import { z } from 'zod';
import type { SubjectId, StudySession } from './types';

export const createStudySessionSchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    subjectId: z.enum(['math', 'physics', 'chemistry', 'english', 'cse'] as const, {
      errorMap: () => ({ message: 'Please select a valid subject' }),
    }),
    topicId: z.string().min(1, 'Please select a topic'),
    durationMinutes: z
      .number({ invalid_type_error: 'Duration must be a number' })
      .int('Duration must be a whole number')
      .min(1, 'Duration must be at least 1 minute')
      .max(1440, 'Duration cannot exceed 24 hours (1440 minutes)'),
    questionsSolved: z
      .number({ invalid_type_error: 'Questions solved must be a number' })
      .int('Questions solved must be a whole number')
      .min(0, 'Questions solved cannot be negative'),
    correctAnswers: z
      .number({ invalid_type_error: 'Correct answers must be a number' })
      .int('Correct answers must be a whole number')
      .min(0, 'Correct answers cannot be negative'),
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  })
  .refine((data) => data.correctAnswers <= data.questionsSolved, {
    message: 'Correct answers cannot exceed total questions solved',
    path: ['correctAnswers'],
  });

export type CreateStudySessionInput = z.infer<typeof createStudySessionSchema>;

export interface StudyMetricsSummary {
  totalMinutes: number;
  totalHoursFormatted: string;
  totalQuestionsSolved: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  sessionCount: number;
}

/**
 * Calculates accuracy percentage (0-100), rounded to 1 decimal place.
 * Returns 0 if total questions is 0.
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total <= 0 || correct <= 0) return 0;
  if (correct >= total) return 100;
  return Math.round((correct / total) * 1000) / 10;
}

/**
 * Formats duration in minutes to human-readable format like "45m", "1h", "1h 30m".
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

/**
 * Formats duration in minutes to hours like "0 hrs", "1.5 hrs", "12 hrs".
 */
export function formatHours(minutes: number): string {
  if (minutes <= 0) return '0 hrs';
  const hrs = Math.round((minutes / 60) * 10) / 10;
  return `${hrs} hrs`;
}

/**
 * Calculates aggregated metrics across all recorded study sessions.
 */
export function calculateStudyMetrics(sessions: StudySession[]): StudyMetricsSummary {
  if (!sessions || sessions.length === 0) {
    return {
      totalMinutes: 0,
      totalHoursFormatted: '0 hrs',
      totalQuestionsSolved: 0,
      totalCorrectAnswers: 0,
      overallAccuracy: 0,
      sessionCount: 0,
    };
  }

  let totalMinutes = 0;
  let totalQuestionsSolved = 0;
  let totalCorrectAnswers = 0;

  for (const session of sessions) {
    totalMinutes += Math.max(0, session.durationMinutes || 0);
    totalQuestionsSolved += Math.max(0, session.questionsSolved || 0);
    totalCorrectAnswers += Math.max(0, session.correctAnswers || 0);
  }

  return {
    totalMinutes,
    totalHoursFormatted: formatHours(totalMinutes),
    totalQuestionsSolved,
    totalCorrectAnswers,
    overallAccuracy: calculateAccuracy(totalCorrectAnswers, totalQuestionsSolved),
    sessionCount: sessions.length,
  };
}

/**
 * Groups sessions by subject ID.
 */
export function groupSessionsBySubject(
  sessions: StudySession[]
): Record<SubjectId, StudySession[]> {
  const result: Record<SubjectId, StudySession[]> = {
    math: [],
    physics: [],
    chemistry: [],
    english: [],
    cse: [],
  };

  for (const session of sessions) {
    if (result[session.subjectId]) {
      result[session.subjectId].push(session);
    }
  }

  return result;
}

