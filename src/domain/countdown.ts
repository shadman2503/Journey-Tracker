export type UrgencyLevel =
  | 'relaxed'
  | 'moderate'
  | 'high'
  | 'critical'
  | 'completed';

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  isPast: boolean;
  urgencyLevel: UrgencyLevel;
  timelineProgress: number; // 0 - 100
  targetDate: Date;
}

export const DEFAULT_EXAM_DATE = '2027-06-20T09:00:00+06:00';
export const DEFAULT_EXAM_TITLE = 'DUET Admission Test 2027';
export const TIMELINE_START_DATE = '2026-10-01T00:00:00+06:00';

export const URGENCY_MESSAGES: Record<UrgencyLevel, string> = {
  relaxed:
    'Building foundation: focus on deep understanding and conceptual mastery.',
  moderate:
    'Consistent momentum: turn completed chapters into problem-solving speed.',
  high: 'Intensive phase: drill weak topics, practice previous years, and take full mocks.',
  critical:
    'Final sprint: revise key formulas, mistake patterns, and exam strategies.',
  completed:
    'The admission test date has arrived! Give your best effort with full confidence.',
};

/**
 * Calculates remaining days, hours, minutes, seconds and urgency for a target exam date.
 */
export function calculateCountdown(
  targetDateInput: Date | string = DEFAULT_EXAM_DATE,
  nowInput?: Date | string,
  timelineStartInput: Date | string = TIMELINE_START_DATE,
): CountdownResult {
  const targetDate =
    typeof targetDateInput === 'string'
      ? new Date(targetDateInput)
      : targetDateInput;

  const now = nowInput
    ? typeof nowInput === 'string'
      ? new Date(nowInput)
      : nowInput
    : new Date();

  const timelineStart =
    typeof timelineStartInput === 'string'
      ? new Date(timelineStartInput)
      : timelineStartInput;

  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0,
      totalHours: 0,
      isPast: true,
      urgencyLevel: 'completed',
      timelineProgress: 100,
      targetDate,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);

  let urgencyLevel: UrgencyLevel = 'relaxed';
  if (days <= 30) {
    urgencyLevel = 'critical';
  } else if (days <= 90) {
    urgencyLevel = 'high';
  } else if (days <= 180) {
    urgencyLevel = 'moderate';
  }

  // Calculate timeline progress
  const totalTimelineDuration = targetDate.getTime() - timelineStart.getTime();
  const elapsedDuration = now.getTime() - timelineStart.getTime();

  let timelineProgress = 0;
  if (totalTimelineDuration > 0 && elapsedDuration > 0) {
    timelineProgress = Math.min(
      100,
      Math.max(0, Math.round((elapsedDuration / totalTimelineDuration) * 100)),
    );
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    totalDays: days,
    totalHours,
    isPast: false,
    urgencyLevel,
    timelineProgress,
    targetDate,
  };
}

/**
 * Formats a single number with leading zero padding (e.g. 7 -> "07").
 */
export function formatDigit(value: number): string {
  return String(Math.max(0, Math.floor(value))).padStart(2, '0');
}
