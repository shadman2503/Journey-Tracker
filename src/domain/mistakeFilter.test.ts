import { describe, it, expect } from 'vitest';
import type { Mistake } from './types';
import {
  getReviewUrgency,
  isDueForReview,
  getDueForReviewMistakes,
  getNextSpacedReviewDate,
  calculateAssessment,
  filterAndSortMistakes,
} from './mistakeFilter';

describe('mistakeFilter domain', () => {
  const refDate = new Date('2026-10-15T12:00:00.000Z');

  const sampleMistakes: Mistake[] = [
    {
      id: 1,
      subjectId: 'math',
      topicId: 'math-calc-01',
      questionRef: 'DUET 2024 Math Q3',
      whatWentWrong: 'Missed chain rule on trigonometric function',
      correctSolution: 'd/dx sin(2x) = 2 cos(2x)',
      type: 'formula',
      status: 'unresolved',
      reviewDate: '2026-10-14', // Overdue relative to 2026-10-15
      createdAt: '2026-10-01T10:00:00.000Z',
    },
    {
      id: 2,
      subjectId: 'physics',
      topicId: 'phy-mech-02',
      questionRef: 'Model Test 01 Q12',
      whatWentWrong: 'Ignored friction component along inclined plane',
      correctSolution: 'N = mg cos(theta), friction = mu * N',
      type: 'conceptual',
      status: 'reviewing',
      reviewDate: '2026-10-15', // Due today
      createdAt: '2026-10-05T10:00:00.000Z',
    },
    {
      id: 3,
      subjectId: 'chemistry',
      topicId: 'chem-org-01',
      questionRef: 'Practice Set Chem Q8',
      whatWentWrong: 'Sign slip in enthalpy reaction formula',
      correctSolution: 'Delta H = Products - Reactants',
      type: 'calculation',
      status: 'unresolved',
      reviewDate: '2026-10-20', // Upcoming
      createdAt: '2026-10-10T10:00:00.000Z',
    },
    {
      id: 4,
      subjectId: 'math',
      topicId: 'math-matrix-01',
      questionRef: 'College Test Q1',
      whatWentWrong: 'Determinant calculation 3x3 diagonal sign flip',
      correctSolution: 'Follow cofactor expansion alternating signs',
      type: 'calculation',
      status: 'fixed',
      reviewDate: '2026-10-12', // Past date, but status is fixed
      createdAt: '2026-10-08T10:00:00.000Z',
    },
    {
      id: 5,
      subjectId: 'english',
      topicId: 'eng-vocab-01',
      questionRef: 'Vocab Quiz 02',
      whatWentWrong: 'Confused ephemeral with eternal',
      correctSolution: 'Ephemeral means short-lived, transient',
      type: 'careless',
      status: 'unresolved',
      reviewDate: undefined, // No review date
      createdAt: '2026-10-02T10:00:00.000Z',
    },
  ];

  const topicMap: Record<string, string> = {
    'math-calc-01': 'Differential Calculus',
    'phy-mech-02': 'Friction and Mechanics',
    'chem-org-01': 'Thermochemistry',
    'math-matrix-01': 'Matrices & Determinants',
    'eng-vocab-01': 'Vocabulary & Synonyms',
  };

  describe('getReviewUrgency and isDueForReview', () => {
    it('correctly classifies overdue, due today, upcoming, and none', () => {
      expect(getReviewUrgency(sampleMistakes[0], refDate)).toBe('overdue');
      expect(getReviewUrgency(sampleMistakes[1], refDate)).toBe('due_today');
      expect(getReviewUrgency(sampleMistakes[2], refDate)).toBe('upcoming');
      expect(getReviewUrgency(sampleMistakes[3], refDate)).toBe('none'); // fixed
      expect(getReviewUrgency(sampleMistakes[4], refDate)).toBe('none'); // no date
    });

    it('identifies due mistakes accurately', () => {
      expect(isDueForReview(sampleMistakes[0], refDate)).toBe(true);
      expect(isDueForReview(sampleMistakes[1], refDate)).toBe(true);
      expect(isDueForReview(sampleMistakes[2], refDate)).toBe(false);
      expect(isDueForReview(sampleMistakes[3], refDate)).toBe(false); // fixed
      expect(isDueForReview(sampleMistakes[4], refDate)).toBe(false); // no date
    });

    it('returns all due mistakes for review', () => {
      const due = getDueForReviewMistakes(sampleMistakes, refDate);
      expect(due.map((m) => m.id)).toEqual([1, 2]);
    });
  });

  describe('getNextSpacedReviewDate & calculateAssessment', () => {
    it('calculates +1 day for unclear outcome', () => {
      const nextDate = getNextSpacedReviewDate('unclear', refDate);
      expect(nextDate).toBe('2026-10-16');
    });

    it('calculates +3 days for progressing outcome', () => {
      const nextDate = getNextSpacedReviewDate('progressing', refDate);
      expect(nextDate).toBe('2026-10-18');
    });

    it('returns undefined for fixed outcome', () => {
      const nextDate = getNextSpacedReviewDate('fixed', refDate);
      expect(nextDate).toBeUndefined();
    });

    it('computes complete review assessment for progressing outcome', () => {
      const assessment = calculateAssessment(sampleMistakes[0], 'progressing', refDate);
      expect(assessment).toEqual({
        mistakeId: 1,
        outcome: 'progressing',
        previousStatus: 'unresolved',
        newStatus: 'reviewing',
        newReviewDate: '2026-10-18',
      });
    });

    it('computes complete review assessment for fixed outcome', () => {
      const assessment = calculateAssessment(sampleMistakes[0], 'fixed', refDate);
      expect(assessment).toEqual({
        mistakeId: 1,
        outcome: 'fixed',
        previousStatus: 'unresolved',
        newStatus: 'fixed',
        newReviewDate: undefined,
      });
    });
  });

  describe('filterAndSortMistakes', () => {
    it('returns all mistakes sorted newest by default', () => {
      const results = filterAndSortMistakes(sampleMistakes, {});
      // Expected sorted by createdAt desc: 3 (Oct 10), 4 (Oct 8), 2 (Oct 5), 5 (Oct 2), 1 (Oct 1)
      expect(results.map((m) => m.id)).toEqual([3, 4, 2, 5, 1]);
    });

    it('searches across question reference, reflections, and topic name', () => {
      // Question ref search
      expect(filterAndSortMistakes(sampleMistakes, { searchQuery: 'DUET 2024' }).map((m) => m.id)).toEqual([1]);

      // whatWentWrong search
      expect(filterAndSortMistakes(sampleMistakes, { searchQuery: 'friction' }).map((m) => m.id)).toEqual([2]);

      // correctSolution search
      expect(filterAndSortMistakes(sampleMistakes, { searchQuery: 'transient' }).map((m) => m.id)).toEqual([5]);

      // Topic name search (via topicMap)
      expect(
        filterAndSortMistakes(sampleMistakes, { searchQuery: 'thermochemistry' }, topicMap).map((m) => m.id),
      ).toEqual([3]);
    });

    it('filters by subject', () => {
      const mathMistakes = filterAndSortMistakes(sampleMistakes, { subjectId: 'math' });
      expect(mathMistakes.map((m) => m.id)).toEqual([4, 1]);
    });

    it('filters by mistake type classification', () => {
      const calcMistakes = filterAndSortMistakes(sampleMistakes, { type: 'calculation' });
      expect(calcMistakes.map((m) => m.id)).toEqual([3, 4]);
    });

    it('filters by status', () => {
      const unresolved = filterAndSortMistakes(sampleMistakes, { status: 'unresolved' });
      expect(unresolved.map((m) => m.id)).toEqual([3, 5, 1]);

      const reviewing = filterAndSortMistakes(sampleMistakes, { status: 'reviewing' });
      expect(reviewing.map((m) => m.id)).toEqual([2]);
    });

    it('filters by urgency: due, scheduled, no_date', () => {
      const due = filterAndSortMistakes(sampleMistakes, { urgency: 'due' }, undefined, refDate);
      expect(due.map((m) => m.id)).toEqual([2, 1]);

      const scheduled = filterAndSortMistakes(sampleMistakes, { urgency: 'scheduled' }, undefined, refDate);
      expect(scheduled.map((m) => m.id)).toEqual([3]);

      const noDate = filterAndSortMistakes(sampleMistakes, { urgency: 'no_date' }, undefined, refDate);
      expect(noDate.map((m) => m.id)).toEqual([5]);
    });

    it('sorts by oldest', () => {
      const oldest = filterAndSortMistakes(sampleMistakes, { sortBy: 'oldest' });
      expect(oldest.map((m) => m.id)).toEqual([1, 5, 2, 4, 3]);
    });

    it('sorts by review_date (earliest review date first, unassigned last)', () => {
      const byReviewDate = filterAndSortMistakes(sampleMistakes, { sortBy: 'review_date' });
      // 4: 2026-10-12, 1: 2026-10-14, 2: 2026-10-15, 3: 2026-10-20, 5: undefined
      expect(byReviewDate.map((m) => m.id)).toEqual([4, 1, 2, 3, 5]);
    });

    it('sorts by status (unresolved first, reviewing second, fixed last)', () => {
      const byStatus = filterAndSortMistakes(sampleMistakes, { sortBy: 'status' });
      // unresolved (3, 5, 1), reviewing (2), fixed (4)
      expect(byStatus.map((m) => m.id)).toEqual([3, 5, 1, 2, 4]);
    });

    it('supports multiple combined filters', () => {
      const combined = filterAndSortMistakes(sampleMistakes, {
        subjectId: 'math',
        status: 'unresolved',
        type: 'formula',
      });
      expect(combined.map((m) => m.id)).toEqual([1]);
    });
  });
});

