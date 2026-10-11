import type { Mistake, SubjectId, MistakeType, MistakeStatus } from './types';

export type MistakeUrgencyFilter = 'all' | 'due' | 'scheduled' | 'no_date';
export type MistakeSortOption = 'newest' | 'oldest' | 'review_date' | 'status';

export interface MistakeFilterOptions {
  searchQuery?: string;
  subjectId?: SubjectId | 'all';
  type?: MistakeType | 'all';
  status?: MistakeStatus | 'all';
  urgency?: MistakeUrgencyFilter;
  sortBy?: MistakeSortOption;
}

export type ReviewOutcome = 'unclear' | 'progressing' | 'fixed';

export interface ReviewAssessment {
  mistakeId: number;
  outcome: ReviewOutcome;
  previousStatus: MistakeStatus;
  newStatus: MistakeStatus;
  newReviewDate?: string;
}

/**
 * Categorizes a mistake's review urgency relative to referenceDate.
 */
export function getReviewUrgency(
  mistake: Mistake,
  referenceDate: Date = new Date(),
): 'overdue' | 'due_today' | 'upcoming' | 'none' {
  if (!mistake.reviewDate || mistake.status === 'fixed') {
    return 'none';
  }

  const todayStr = referenceDate.toISOString().split('T')[0];
  if (mistake.reviewDate < todayStr) {
    return 'overdue';
  }
  if (mistake.reviewDate === todayStr) {
    return 'due_today';
  }
  return 'upcoming';
}

/**
 * Determines whether a mistake is due for review today or overdue.
 */
export function isDueForReview(
  mistake: Mistake,
  referenceDate: Date = new Date(),
): boolean {
  if (mistake.status === 'fixed' || !mistake.reviewDate) {
    return false;
  }
  const todayStr = referenceDate.toISOString().split('T')[0];
  return mistake.reviewDate <= todayStr;
}

/**
 * Returns all active mistakes due for spaced repetition review.
 */
export function getDueForReviewMistakes(
  mistakes: Mistake[],
  referenceDate: Date = new Date(),
): Mistake[] {
  return mistakes.filter((m) => isDueForReview(m, referenceDate));
}

/**
 * Calculates the next spaced repetition review date given a review outcome.
 */
export function getNextSpacedReviewDate(
  outcome: ReviewOutcome,
  referenceDate: Date = new Date(),
): string | undefined {
  if (outcome === 'fixed') {
    return undefined;
  }

  const daysAhead = outcome === 'unclear' ? 1 : 3;
  const d = new Date(referenceDate.getTime());
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

/**
 * Computes the complete assessment payload for a reviewed mistake.
 */
export function calculateAssessment(
  mistake: Mistake,
  outcome: ReviewOutcome,
  referenceDate: Date = new Date(),
): ReviewAssessment {
  let newStatus: MistakeStatus;
  if (outcome === 'fixed') {
    newStatus = 'fixed';
  } else if (outcome === 'progressing') {
    newStatus = 'reviewing';
  } else {
    newStatus = 'unresolved';
  }

  const newReviewDate = getNextSpacedReviewDate(outcome, referenceDate);

  return {
    mistakeId: mistake.id ?? 0,
    outcome,
    previousStatus: mistake.status,
    newStatus,
    newReviewDate,
  };
}

const STATUS_PRIORITY: Record<MistakeStatus, number> = {
  unresolved: 0,
  reviewing: 1,
  fixed: 2,
};

/**
 * Pure filtering and sorting engine for mistakes.
 */
export function filterAndSortMistakes(
  mistakes: Mistake[],
  options: MistakeFilterOptions,
  topicMap?: Record<string, string>,
  referenceDate: Date = new Date(),
): Mistake[] {
  const query = options.searchQuery?.trim().toLowerCase();
  const subject = options.subjectId && options.subjectId !== 'all' ? options.subjectId : undefined;
  const type = options.type && options.type !== 'all' ? options.type : undefined;
  const status = options.status && options.status !== 'all' ? options.status : undefined;
  const urgency = options.urgency && options.urgency !== 'all' ? options.urgency : undefined;
  const sortBy = options.sortBy ?? 'newest';

  const todayStr = referenceDate.toISOString().split('T')[0];

  const filtered = mistakes.filter((m) => {
    // Subject filter
    if (subject && m.subjectId !== subject) {
      return false;
    }

    // Type filter
    if (type && m.type !== type) {
      return false;
    }

    // Status filter
    if (status && m.status !== status) {
      return false;
    }

    // Urgency filter
    if (urgency) {
      if (urgency === 'due') {
        if (!isDueForReview(m, referenceDate)) return false;
      } else if (urgency === 'scheduled') {
        if (m.status === 'fixed' || !m.reviewDate || m.reviewDate <= todayStr) return false;
      } else if (urgency === 'no_date') {
        if (m.status === 'fixed' || !!m.reviewDate) return false;
      }
    }

    // Search query matching
    if (query) {
      const topicName = (topicMap?.[m.topicId] ?? '').toLowerCase();
      const ref = (m.questionRef ?? '').toLowerCase();
      const wrong = (m.whatWentWrong ?? '').toLowerCase();
      const sol = (m.correctSolution ?? '').toLowerCase();

      const matches =
        ref.includes(query) ||
        wrong.includes(query) ||
        sol.includes(query) ||
        topicName.includes(query);

      if (!matches) {
        return false;
      }
    }

    return true;
  });

  return filtered.sort((a, b) => {
    switch (sortBy) {
      case 'oldest': {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeA - timeB || (a.id ?? 0) - (b.id ?? 0);
      }
      case 'review_date': {
        // Entries with review dates come before entries without
        if (a.reviewDate && !b.reviewDate) return -1;
        if (!a.reviewDate && b.reviewDate) return 1;
        if (a.reviewDate && b.reviewDate) {
          const comp = a.reviewDate.localeCompare(b.reviewDate);
          if (comp !== 0) return comp;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      case 'status': {
        const prioDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
        if (prioDiff !== 0) return prioDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      case 'newest':
      default: {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeB - timeA || (b.id ?? 0) - (a.id ?? 0);
      }
    }
  });
}

