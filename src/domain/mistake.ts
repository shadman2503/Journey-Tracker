import { z } from 'zod';
import type { SubjectId, MistakeType, MistakeStatus, Mistake } from './types';

export const ALL_MISTAKE_TYPES: MistakeType[] = [
  'conceptual',
  'calculation',
  'formula',
  'careless',
  'misreading',
  'time_management',
];

export const ALL_MISTAKE_STATUSES: MistakeStatus[] = [
  'unresolved',
  'reviewing',
  'fixed',
];

export const mistakeTypeSchema = z.enum([
  'conceptual',
  'calculation',
  'formula',
  'careless',
  'misreading',
  'time_management',
]);

export const mistakeStatusSchema = z.enum(['unresolved', 'reviewing', 'fixed']);

export const createMistakeSchema = z.object({
  subjectId: z.enum(['math', 'physics', 'chemistry', 'english', 'cse']),
  topicId: z.string().min(1, 'Please select a syllabus topic'),
  questionRef: z
    .string()
    .min(2, 'Question reference must be at least 2 characters')
    .max(150, 'Question reference cannot exceed 150 characters'),
  whatWentWrong: z
    .string()
    .min(5, 'Explanation must be at least 5 characters')
    .max(1000, 'Explanation cannot exceed 1000 characters'),
  correctSolution: z
    .string()
    .min(5, 'Correct concept/solution must be at least 5 characters')
    .max(1000, 'Solution cannot exceed 1000 characters'),
  type: mistakeTypeSchema,
  status: mistakeStatusSchema.default('unresolved'),
  reviewDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Invalid review date format (expected YYYY-MM-DD)',
    )
    .optional()
    .or(z.literal('')),
});

export type CreateMistakeInput = z.infer<typeof createMistakeSchema>;

export const updateMistakeSchema = createMistakeSchema.partial();
export type UpdateMistakeInput = z.infer<typeof updateMistakeSchema>;

export interface MistakeTypeMeta {
  id: MistakeType;
  label: string;
  description: string;
  badgeClass: string;
}

export const MISTAKE_TYPE_CONFIG: Record<MistakeType, MistakeTypeMeta> = {
  conceptual: {
    id: 'conceptual',
    label: 'Conceptual Error',
    description:
      'Misunderstood core theory, physical law, or mathematical principle',
    badgeClass:
      'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  calculation: {
    id: 'calculation',
    label: 'Calculation Slip',
    description:
      'Arithmetic error, sign mistake (+/-), or algebraic simplification slip',
    badgeClass:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  formula: {
    id: 'formula',
    label: 'Formula Mistake',
    description:
      'Recalled wrong formula, missed constant, or confused formula variables',
    badgeClass:
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
  careless: {
    id: 'careless',
    label: 'Careless Oversight',
    description: 'Hurried work, skipped step, or avoidable transcription error',
    badgeClass:
      'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
  misreading: {
    id: 'misreading',
    label: 'Question Misread',
    description:
      'Missed question constraint, unit conversion, or inverted question premise',
    badgeClass:
      'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  time_management: {
    id: 'time_management',
    label: 'Time Pressure',
    description:
      'Spent too long solving, rushed last steps, or ran out of test time',
    badgeClass:
      'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
  },
};

export interface MistakeStatusMeta {
  id: MistakeStatus;
  label: string;
  badgeClass: string;
}

export const MISTAKE_STATUS_CONFIG: Record<MistakeStatus, MistakeStatusMeta> = {
  unresolved: {
    id: 'unresolved',
    label: 'Unresolved',
    badgeClass:
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
  reviewing: {
    id: 'reviewing',
    label: 'In Review',
    badgeClass:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  fixed: {
    id: 'fixed',
    label: 'Mastered & Fixed',
    badgeClass:
      'bg-primary/10 text-primary border-primary/20',
  },
};

export interface MistakeMetricsSummary {
  totalMistakes: number;
  unresolvedCount: number;
  reviewingCount: number;
  fixedCount: number;
  resolutionRate: number; // 0 to 100 percentage
  pendingReviewCount: number;
  byType: Record<MistakeType, number>;
  bySubject: Record<SubjectId, number>;
}

/**
 * Calculates aggregate metrics and category distribution across mistakes.
 */
export function calculateMistakeMetrics(
  mistakes: Mistake[] = [],
  referenceDate: Date = new Date(),
): MistakeMetricsSummary {
  const byType: Record<MistakeType, number> = {
    conceptual: 0,
    calculation: 0,
    formula: 0,
    careless: 0,
    misreading: 0,
    time_management: 0,
  };

  const bySubject: Record<SubjectId, number> = {
    math: 0,
    physics: 0,
    chemistry: 0,
    english: 0,
    cse: 0,
  };

  let unresolvedCount = 0;
  let reviewingCount = 0;
  let fixedCount = 0;
  let pendingReviewCount = 0;

  const refDayString = referenceDate.toISOString().split('T')[0];

  for (const m of mistakes) {
    if (m.type && byType[m.type] !== undefined) {
      byType[m.type] += 1;
    }
    if (m.subjectId && bySubject[m.subjectId] !== undefined) {
      bySubject[m.subjectId] += 1;
    }

    if (m.status === 'fixed') {
      fixedCount += 1;
    } else if (m.status === 'reviewing') {
      reviewingCount += 1;
      if (m.reviewDate && m.reviewDate <= refDayString) {
        pendingReviewCount += 1;
      }
    } else {
      unresolvedCount += 1;
      if (m.reviewDate && m.reviewDate <= refDayString) {
        pendingReviewCount += 1;
      }
    }
  }

  const totalMistakes = mistakes.length;
  const resolutionRate =
    totalMistakes > 0
      ? Math.round((fixedCount / totalMistakes) * 1000) / 10
      : 0;

  return {
    totalMistakes,
    unresolvedCount,
    reviewingCount,
    fixedCount,
    resolutionRate,
    pendingReviewCount,
    byType,
    bySubject,
  };
}

/**
 * Generates a default suggested spaced-repetition review date (+3 days).
 */
export function getSuggestedReviewDate(
  daysAhead = 3,
  baseDate: Date = new Date(),
): string {
  const d = new Date(baseDate.getTime());
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

/**
 * Formats a review date string with urgency cues.
 */
export function formatReviewDate(
  reviewDate?: string,
  referenceDate: Date = new Date(),
): { label: string; isOverdue: boolean; isToday: boolean } {
  if (!reviewDate) {
    return { label: 'No review date', isOverdue: false, isToday: false };
  }

  const todayStr = referenceDate.toISOString().split('T')[0];
  if (reviewDate === todayStr) {
    return { label: 'Review Today', isOverdue: false, isToday: true };
  }

  if (reviewDate < todayStr) {
    return {
      label: `Overdue (${reviewDate})`,
      isOverdue: true,
      isToday: false,
    };
  }

  return { label: `Review by ${reviewDate}`, isOverdue: false, isToday: false };
}
