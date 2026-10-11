import { describe, it, expect } from 'vitest';
import {
  createMistakeSchema,
  updateMistakeSchema,
  calculateMistakeMetrics,
  getSuggestedReviewDate,
  formatReviewDate,
} from './mistake';
import type { Mistake } from './types';

describe('mistake domain', () => {
  describe('createMistakeSchema validation', () => {
    it('validates a correct mistake payload', () => {
      const valid = {
        subjectId: 'math',
        topicId: 'math-calc-limits',
        questionRef: 'DUET 2024 Math Q-15',
        whatWentWrong: 'Forgot to check indeterminacy 0/0 before applying direct substitution.',
        correctSolution: 'Use L Hopitals rule or factor out (x-a) first.',
        type: 'conceptual',
        status: 'unresolved',
        reviewDate: '2026-10-15',
      };

      const result = createMistakeSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.subjectId).toBe('math');
        expect(result.data.type).toBe('conceptual');
      }
    });

    it('defaults status to unresolved if omitted', () => {
      const validWithoutStatus = {
        subjectId: 'physics',
        topicId: 'phy-mech-friction',
        questionRef: 'H.C. Verma Ch 6 Problem 12',
        whatWentWrong: 'Used normal force mg on inclined plane instead of mg cos theta.',
        correctSolution: 'Normal force perpendicular to incline is mg cos(theta).',
        type: 'formula',
      };

      const result = createMistakeSchema.safeParse(validWithoutStatus);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('unresolved');
      }
    });

    it('rejects payloads with missing or short fields', () => {
      const invalid = {
        subjectId: 'invalid_sub',
        topicId: '',
        questionRef: 'Q',
        whatWentWrong: 'no',
        correctSolution: 'ok',
        type: 'unknown_type',
      };

      const result = createMistakeSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorFields = result.error.issues.map((i) => i.path[0]);
        expect(errorFields).toContain('subjectId');
        expect(errorFields).toContain('topicId');
        expect(errorFields).toContain('questionRef');
        expect(errorFields).toContain('whatWentWrong');
        expect(errorFields).toContain('correctSolution');
        expect(errorFields).toContain('type');
      }
    });

    it('allows empty review date string or undefined', () => {
      const validEmptyReview = {
        subjectId: 'chemistry',
        topicId: 'chem-org-reaction',
        questionRef: 'Model Test 2 Q-4',
        whatWentWrong: 'Substituted Markovnikov addition product instead of Anti-Markovnikov with peroxide.',
        correctSolution: 'HBr with benzoyl peroxide gives free-radical Anti-Markovnikov addition.',
        type: 'careless',
        reviewDate: '',
      };

      const result = createMistakeSchema.safeParse(validEmptyReview);
      expect(result.success).toBe(true);
    });

    it('validates partial updates with updateMistakeSchema', () => {
      const partial = {
        status: 'fixed' as const,
        reviewDate: '2026-10-20',
      };

      const result = updateMistakeSchema.safeParse(partial);
      expect(result.success).toBe(true);
    });
  });

  describe('calculateMistakeMetrics', () => {
    const refDate = new Date('2026-10-10T12:00:00Z');

    it('returns zero counts for empty array', () => {
      const metrics = calculateMistakeMetrics([], refDate);
      expect(metrics.totalMistakes).toBe(0);
      expect(metrics.unresolvedCount).toBe(0);
      expect(metrics.reviewingCount).toBe(0);
      expect(metrics.fixedCount).toBe(0);
      expect(metrics.resolutionRate).toBe(0);
      expect(metrics.pendingReviewCount).toBe(0);
    });

    it('calculates totals, status counts, distributions, and resolution rate', () => {
      const mistakes: Mistake[] = [
        {
          id: 1,
          subjectId: 'math',
          topicId: 'math-calc',
          questionRef: 'Q1',
          whatWentWrong: 'Wrong limit',
          correctSolution: 'Factor limit',
          type: 'conceptual',
          status: 'unresolved',
          reviewDate: '2026-10-09', // Overdue relative to refDate 2026-10-10
          createdAt: '',
        },
        {
          id: 2,
          subjectId: 'physics',
          topicId: 'phy-mech',
          questionRef: 'Q2',
          whatWentWrong: 'Sign slip',
          correctSolution: 'Negative acceleration',
          type: 'calculation',
          status: 'reviewing',
          reviewDate: '2026-10-10', // Due today
          createdAt: '',
        },
        {
          id: 3,
          subjectId: 'chemistry',
          topicId: 'chem-org',
          questionRef: 'Q3',
          whatWentWrong: 'Wrong catalyst',
          correctSolution: 'AlCl3 needed',
          type: 'formula',
          status: 'fixed',
          reviewDate: '2026-10-05',
          createdAt: '',
        },
        {
          id: 4,
          subjectId: 'math',
          topicId: 'math-alg',
          questionRef: 'Q4',
          whatWentWrong: 'Rushed calculation',
          correctSolution: 'Matrix determinant rule',
          type: 'time_management',
          status: 'fixed',
          createdAt: '',
        },
      ];

      const metrics = calculateMistakeMetrics(mistakes, refDate);

      expect(metrics.totalMistakes).toBe(4);
      expect(metrics.unresolvedCount).toBe(1);
      expect(metrics.reviewingCount).toBe(1);
      expect(metrics.fixedCount).toBe(2);
      expect(metrics.resolutionRate).toBe(50.0); // 2 out of 4 = 50%
      expect(metrics.pendingReviewCount).toBe(2); // Q1 (overdue) + Q2 (due today), Q3 is fixed so excluded

      // Type distributions
      expect(metrics.byType.conceptual).toBe(1);
      expect(metrics.byType.calculation).toBe(1);
      expect(metrics.byType.formula).toBe(1);
      expect(metrics.byType.time_management).toBe(1);
      expect(metrics.byType.careless).toBe(0);

      // Subject distributions
      expect(metrics.bySubject.math).toBe(2);
      expect(metrics.bySubject.physics).toBe(1);
      expect(metrics.bySubject.chemistry).toBe(1);
      expect(metrics.bySubject.english).toBe(0);
      expect(metrics.bySubject.cse).toBe(0);
    });
  });

  describe('getSuggestedReviewDate', () => {
    it('returns date 3 days in future by default', () => {
      const base = new Date('2026-10-10T10:00:00Z');
      const suggested = getSuggestedReviewDate(3, base);
      expect(suggested).toBe('2026-10-13');
    });
  });

  describe('formatReviewDate', () => {
    const base = new Date('2026-10-10T10:00:00Z');

    it('handles undefined reviewDate', () => {
      const res = formatReviewDate(undefined, base);
      expect(res.label).toBe('No review date');
      expect(res.isOverdue).toBe(false);
      expect(res.isToday).toBe(false);
    });

    it('identifies overdue dates', () => {
      const res = formatReviewDate('2026-10-08', base);
      expect(res.isOverdue).toBe(true);
      expect(res.isToday).toBe(false);
      expect(res.label).toContain('Overdue');
    });

    it('identifies due today dates', () => {
      const res = formatReviewDate('2026-10-10', base);
      expect(res.isOverdue).toBe(false);
      expect(res.isToday).toBe(true);
      expect(res.label).toBe('Review Today');
    });

    it('identifies upcoming future dates', () => {
      const res = formatReviewDate('2026-10-15', base);
      expect(res.isOverdue).toBe(false);
      expect(res.isToday).toBe(false);
      expect(res.label).toBe('Review by 2026-10-15');
    });
  });
});

