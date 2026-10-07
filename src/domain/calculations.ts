import type { TopicProgress } from '@/domain/types';

export function calculateTopicProgressPercentage(
  totalTopics: number,
  progressList: TopicProgress[],
): number {
  if (totalTopics <= 0) return 0;

  // Weightings: 'strong' = 100%, 'practicing' = 75%, 'learning' = 40%, 'needs_revision' = 50%, 'not_started' = 0%
  const weightMap: Record<string, number> = {
    strong: 1.0,
    practicing: 0.75,
    needs_revision: 0.5,
    learning: 0.4,
    not_started: 0,
  };

  const completedWeight = progressList.reduce((acc, p) => {
    return acc + (weightMap[p.status] ?? 0);
  }, 0);

  const percentage = Math.round((completedWeight / totalTopics) * 100);
  return Math.min(100, Math.max(0, percentage));
}

export function calculateStudyStreak(dates: string[]): {
  currentStreak: number;
  bestStreak: number;
} {
  if (!dates.length) return { currentStreak: 0, bestStreak: 0 };

  const uniqueSortedDates = Array.from(new Set(dates)).sort();
  if (uniqueSortedDates.length === 0)
    return { currentStreak: 0, bestStreak: 0 };

  let bestStreak = 0;
  let currentRun = 0;
  let prevDate: Date | null = null;

  for (const dateStr of uniqueSortedDates) {
    const currentDate = new Date(dateStr);
    currentDate.setHours(0, 0, 0, 0);

    if (prevDate) {
      const diffDays = Math.round(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays === 1) {
        currentRun++;
      } else if (diffDays > 1) {
        currentRun = 1;
      }
    } else {
      currentRun = 1;
    }

    if (currentRun > bestStreak) {
      bestStreak = currentRun;
    }
    prevDate = currentDate;
  }

  // Calculate current streak relative to today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActiveDate = new Date(
    uniqueSortedDates[uniqueSortedDates.length - 1],
  );
  lastActiveDate.setHours(0, 0, 0, 0);

  const diffFromToday = Math.round(
    (today.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  let currentStreak = 0;
  if (diffFromToday <= 1) {
    currentStreak = currentRun;
  }

  return { currentStreak, bestStreak };
}
