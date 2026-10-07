import type { SyllabusTopic, TopicProgress, TopicStatus } from './types';

export interface StatusConfig {
  label: string;
  labelBn: string;
  description: string;
  colorClass: string;
  badgeClass: string;
  dotColorClass: string;
  borderClass: string;
}

export const STATUS_ORDER: TopicStatus[] = [
  'not_started',
  'learning',
  'practicing',
  'strong',
  'needs_revision',
];

export const STATUS_CONFIG: Record<TopicStatus, StatusConfig> = {
  not_started: {
    label: 'Not Started',
    labelBn: 'শুরু হয়নি',
    description: 'Yet to begin studying this topic',
    colorClass: 'text-slate-600 dark:text-slate-400',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    dotColorClass: 'bg-slate-400',
    borderClass: 'border-slate-200 dark:border-slate-800',
  },
  learning: {
    label: 'Learning',
    labelBn: 'শিখছি',
    description: 'Currently studying the fundamentals and theory',
    colorClass: 'text-blue-600 dark:text-blue-400',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    dotColorClass: 'bg-blue-500',
    borderClass: 'border-blue-200 dark:border-blue-800',
  },
  practicing: {
    label: 'Practicing',
    labelBn: 'অনুশীলন করছি',
    description: 'Solving practice problems and past exam questions',
    colorClass: 'text-amber-600 dark:text-amber-400',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dotColorClass: 'bg-amber-500',
    borderClass: 'border-amber-200 dark:border-amber-800',
  },
  strong: {
    label: 'Strong',
    labelBn: 'দক্ষ',
    description: 'High confidence, concepts thoroughly mastered',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dotColorClass: 'bg-emerald-500',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
  },
  needs_revision: {
    label: 'Needs Revision',
    labelBn: 'রিভিশন প্রয়োজন',
    description: 'Weak area or forgotten concepts requiring review',
    colorClass: 'text-rose-600 dark:text-rose-400',
    badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    dotColorClass: 'bg-rose-500',
    borderClass: 'border-rose-200 dark:border-rose-800',
  },
};

export interface StatusBreakdown {
  not_started: number;
  learning: number;
  practicing: number;
  strong: number;
  needs_revision: number;
  total: number;
}

/**
 * Calculates counts for each status across the provided list of topics.
 */
export function calculateStatusBreakdown(
  topics: SyllabusTopic[],
  progressMap: Record<string, TopicProgress>,
): StatusBreakdown {
  const counts: StatusBreakdown = {
    not_started: 0,
    learning: 0,
    practicing: 0,
    strong: 0,
    needs_revision: 0,
    total: topics.length,
  };

  for (const topic of topics) {
    const status = progressMap[topic.id]?.status ?? 'not_started';
    if (status in counts) {
      counts[status] += 1;
    } else {
      counts.not_started += 1;
    }
  }

  return counts;
}

/**
 * Returns the next status in the cycle:
 * not_started -> learning -> practicing -> strong -> needs_revision -> not_started
 */
export function getNextStatus(current: TopicStatus): TopicStatus {
  const currentIndex = STATUS_ORDER.indexOf(current);
  if (currentIndex === -1 || currentIndex === STATUS_ORDER.length - 1) {
    return STATUS_ORDER[0];
  }
  return STATUS_ORDER[currentIndex + 1];
}
