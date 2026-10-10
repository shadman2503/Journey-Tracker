import {
  parseISO,
  format,
  differenceInCalendarDays,
  subDays,
  startOfDay,
} from 'date-fns';

export type StreakStatus = 'active' | 'at_risk' | 'inactive';

export interface RecentDayStatus {
  date: string; // YYYY-MM-DD
  dayLabel: string; // 'Mon', 'Tue', etc.
  isToday: boolean;
  hasStudied: boolean;
}

export interface StudyStreakSummary {
  currentStreak: number;
  bestStreak: number;
  status: StreakStatus;
  lastStudiedDate: string | null;
  totalActiveDays: number;
  recentDays: RecentDayStatus[];
  message: string;
}

/**
 * Normalizes any string representation of a date (e.g. ISO timestamp or YYYY-MM-DD)
 * to a standardized 'yyyy-MM-dd' string.
 */
export function normalizeDateString(dateInput: string | Date): string {
  if (dateInput instanceof Date) {
    return format(dateInput, 'yyyy-MM-dd');
  }
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  try {
    const parsed = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    return format(parsed, 'yyyy-MM-dd');
  } catch {
    return String(dateInput).slice(0, 10);
  }
}

/**
 * Generates status for the last `dayCount` calendar days up to the reference date.
 */
export function getRecentDaysStatus(
  sessionDates: string[],
  referenceDate: Date | string = new Date(),
  dayCount: number = 7,
): RecentDayStatus[] {
  const refDate =
    typeof referenceDate === 'string'
      ? parseISO(referenceDate)
      : referenceDate;
  const normalizedRef = startOfDay(refDate);

  const activeDatesSet = new Set(
    sessionDates
      .filter(Boolean)
      .map((d) => normalizeDateString(d)),
  );

  const result: RecentDayStatus[] = [];

  for (let i = dayCount - 1; i >= 0; i--) {
    const targetDate = subDays(normalizedRef, i);
    const dateStr = format(targetDate, 'yyyy-MM-dd');
    const dayLabel = format(targetDate, 'EEE');
    const isToday = i === 0;
    const hasStudied = activeDatesSet.has(dateStr);

    result.push({
      date: dateStr,
      dayLabel,
      isToday,
      hasStudied,
    });
  }

  return result;
}

/**
 * Calculates current and historical best study streaks based on recorded session dates.
 *
 * - Active: The user studied today (reference date). Current streak includes today.
 * - At Risk: The user studied yesterday, but hasn't studied today yet. Current streak is active
 *   through yesterday and requires a study session today to stay alive.
 * - Inactive: The last study session was 2 or more days ago, or no sessions exist. Current streak is 0.
 */
export function calculateStreak(
  sessionDates: string[],
  referenceDate: Date | string = new Date(),
): StudyStreakSummary {
  const recentDays = getRecentDaysStatus(sessionDates, referenceDate, 7);

  if (!sessionDates || sessionDates.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      status: 'inactive',
      lastStudiedDate: null,
      totalActiveDays: 0,
      recentDays,
      message: 'Start your study streak today. Consistency is key!',
    };
  }

  const refDate =
    typeof referenceDate === 'string'
      ? parseISO(referenceDate)
      : referenceDate;
  const normalizedRef = startOfDay(refDate);

  // Deduplicate and filter valid dates
  const uniqueDateStrings = Array.from(
    new Set(
      sessionDates
        .filter(Boolean)
        .map((d) => normalizeDateString(d)),
    ),
  ).sort();

  if (uniqueDateStrings.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      status: 'inactive',
      lastStudiedDate: null,
      totalActiveDays: 0,
      recentDays,
      message: 'Start your study streak today. Consistency is key!',
    };
  }

  // Calculate historical best streak and historical consecutive runs
  let bestStreak = 0;
  let runningCount = 0;
  let prevDate: Date | null = null;

  for (const dateStr of uniqueDateStrings) {
    const curDate = startOfDay(parseISO(dateStr));

    if (prevDate) {
      const diffDays = differenceInCalendarDays(curDate, prevDate);
      if (diffDays === 1) {
        runningCount++;
      } else if (diffDays > 1) {
        runningCount = 1;
      }
    } else {
      runningCount = 1;
    }

    if (runningCount > bestStreak) {
      bestStreak = runningCount;
    }
    prevDate = curDate;
  }

  // Calculate current streak relative to reference date
  const lastActiveDateStr = uniqueDateStrings[uniqueDateStrings.length - 1];
  const lastActiveDate = startOfDay(parseISO(lastActiveDateStr));
  const daysSinceLastStudy = differenceInCalendarDays(normalizedRef, lastActiveDate);

  let currentStreak = 0;
  let status: StreakStatus = 'inactive';

  // Walk backwards from the most recent study date to calculate its consecutive run
  let latestRunLength = 1;
  for (let i = uniqueDateStrings.length - 1; i > 0; i--) {
    const dCur = startOfDay(parseISO(uniqueDateStrings[i]));
    const dPrev = startOfDay(parseISO(uniqueDateStrings[i - 1]));
    if (differenceInCalendarDays(dCur, dPrev) === 1) {
      latestRunLength++;
    } else {
      break;
    }
  }

  if (daysSinceLastStudy <= 0) {
    // Studied today (or later on reference date)
    currentStreak = latestRunLength;
    status = 'active';
  } else if (daysSinceLastStudy === 1) {
    // Studied yesterday, hasn't studied today yet
    currentStreak = latestRunLength;
    status = 'at_risk';
  } else {
    // 2 or more days ago: streak broken
    currentStreak = 0;
    status = 'inactive';
  }

  // Context messages
  let message: string;
  if (status === 'active') {
    if (currentStreak === 1) {
      message = '1-day streak started! Great job studying today.';
    } else if (currentStreak >= bestStreak && currentStreak > 1) {
      message = `${currentStreak}-day personal best streak! Keep the flame burning 🔥`;
    } else {
      message = `${currentStreak}-day streak! Keep the flame burning 🔥`;
    }
  } else if (status === 'at_risk') {
    if (currentStreak === 1) {
      message = 'Study today to turn your 1-day momentum into a streak!';
    } else {
      message = `${currentStreak}-day streak at risk! Study today to keep the flame alive ⏳`;
    }
  } else {
    message = 'Start your study streak today. Consistency is key!';
  }

  return {
    currentStreak,
    bestStreak,
    status,
    lastStudiedDate: lastActiveDateStr,
    totalActiveDays: uniqueDateStrings.length,
    recentDays,
    message,
  };
}

