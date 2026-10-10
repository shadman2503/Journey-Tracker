import {
  parseISO,
  format,
  subWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isAfter,
  startOfDay,
} from 'date-fns';
import type { StudySession, SubjectId } from './types';
import { normalizeDateString } from './streak';

export type HeatmapMetric = 'duration' | 'questions';
export type IntensityLevel = 0 | 1 | 2 | 3 | 4;

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  sessionCount: number;
  totalMinutes: number;
  totalQuestions: number;
  totalCorrect: number;
  subjects: SubjectId[];
}

export interface HeatmapCell {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  weekIndex: number;
  monthLabel: string;
  isToday: boolean;
  isFuture: boolean;
  activity: DailyActivity | null;
  intensity: IntensityLevel;
}

export interface HeatmapMonthLabel {
  label: string;
  weekIndex: number;
}

export interface HeatmapSummary {
  totalActiveDays: number;
  totalMinutes: number;
  totalHoursFormatted: string;
  totalQuestions: number;
  averageMinutesPerActiveDay: number;
  maxMinutesInDay: number;
  maxQuestionsInDay: number;
}

export interface HeatmapGridResult {
  weeks: HeatmapCell[][];
  monthLabels: HeatmapMonthLabel[];
  summary: HeatmapSummary;
}

/**
 * Aggregates study sessions by calendar date.
 */
export function aggregateDailyActivity(
  sessions: StudySession[],
): Record<string, DailyActivity> {
  const result: Record<string, DailyActivity> = {};

  for (const session of sessions) {
    if (!session.date) continue;
    const dateStr = normalizeDateString(session.date);

    if (!result[dateStr]) {
      result[dateStr] = {
        date: dateStr,
        sessionCount: 0,
        totalMinutes: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        subjects: [],
      };
    }

    const day = result[dateStr];
    day.sessionCount += 1;
    day.totalMinutes += session.durationMinutes || 0;
    day.totalQuestions += session.questionsSolved || 0;
    day.totalCorrect += session.correctAnswers || 0;

    if (!day.subjects.includes(session.subjectId)) {
      day.subjects.push(session.subjectId);
    }
  }

  return result;
}

/**
 * Calculates intensity level (0-4) based on chosen metric.
 */
export function calculateIntensity(
  activity: DailyActivity | null,
  metric: HeatmapMetric = 'duration',
): IntensityLevel {
  if (!activity || activity.sessionCount === 0) return 0;

  if (metric === 'duration') {
    const mins = activity.totalMinutes;
    if (mins <= 0) return 0;
    if (mins <= 30) return 1;
    if (mins <= 60) return 2;
    if (mins <= 120) return 3;
    return 4;
  }

  if (metric === 'questions') {
    const q = activity.totalQuestions;
    if (q <= 0) return 0;
    if (q <= 15) return 1;
    if (q <= 30) return 2;
    if (q <= 60) return 3;
    return 4;
  }

  return 0;
}

/**
 * Formats minutes into human-readable hours string (e.g. '12.5 hrs').
 */
export function formatHeatmapHours(minutes: number): string {
  if (minutes === 0) return '0 hrs';
  const hours = minutes / 60;
  return hours % 1 === 0 ? `${hours} hrs` : `${hours.toFixed(1)} hrs`;
}

export interface GenerateHeatmapOptions {
  weeksCount?: number;
  referenceDate?: Date | string;
  metric?: HeatmapMetric;
  weekStartsOn?: 0 | 1; // 0 = Sunday, 1 = Monday
}

/**
 * Generates grid columns of weeks containing day cells, month markers, and summary stats.
 */
export function generateHeatmapGrid(
  sessions: StudySession[],
  options: GenerateHeatmapOptions = {},
): HeatmapGridResult {
  const {
    weeksCount = 26,
    referenceDate = new Date(),
    metric = 'duration',
    weekStartsOn = 0,
  } = options;

  const refDate =
    typeof referenceDate === 'string'
      ? parseISO(referenceDate)
      : referenceDate;
  const normalizedRef = startOfDay(refDate);

  const dailyActivities = aggregateDailyActivity(sessions);

  // Interval bounds
  const gridEndDate = endOfWeek(normalizedRef, { weekStartsOn });
  const startOfCurrentWeek = startOfWeek(normalizedRef, { weekStartsOn });
  const gridStartDate = subWeeks(startOfCurrentWeek, weeksCount - 1);

  const allDays = eachDayOfInterval({
    start: gridStartDate,
    end: gridEndDate,
  });

  const weeks: HeatmapCell[][] = [];
  const monthLabels: HeatmapMonthLabel[] = [];

  let currentWeek: HeatmapCell[] = [];
  let weekIndex = 0;
  let lastLabeledMonth = '';

  for (const day of allDays) {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayOfWeek = day.getDay();
    const isToday = isSameDay(day, normalizedRef);
    const isFuture = isAfter(day, normalizedRef);
    const activity = dailyActivities[dateStr] || null;
    const intensity = isFuture ? 0 : calculateIntensity(activity, metric);
    const monthLabel = format(day, 'MMM');

    currentWeek.push({
      date: dateStr,
      dayOfWeek,
      weekIndex,
      monthLabel,
      isToday,
      isFuture,
      activity,
      intensity,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);

      // Check if this week starts a new month or has the 1st of a month
      const firstDayOfMonthInWeek = currentWeek.find((c) => {
        const d = parseISO(c.date);
        return d.getDate() <= 7;
      });

      if (firstDayOfMonthInWeek && firstDayOfMonthInWeek.monthLabel !== lastLabeledMonth) {
        monthLabels.push({
          label: firstDayOfMonthInWeek.monthLabel,
          weekIndex,
        });
        lastLabeledMonth = firstDayOfMonthInWeek.monthLabel;
      }

      currentWeek = [];
      weekIndex++;
    }
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Calculate summary metrics for the rendered time window
  let totalActiveDays = 0;
  let totalMinutes = 0;
  let totalQuestions = 0;
  let maxMinutesInDay = 0;
  let maxQuestionsInDay = 0;

  for (const week of weeks) {
    for (const cell of week) {
      if (cell.isFuture || !cell.activity) continue;

      if (cell.activity.totalMinutes > 0 || cell.activity.totalQuestions > 0) {
        totalActiveDays++;
      }

      totalMinutes += cell.activity.totalMinutes;
      totalQuestions += cell.activity.totalQuestions;

      if (cell.activity.totalMinutes > maxMinutesInDay) {
        maxMinutesInDay = cell.activity.totalMinutes;
      }
      if (cell.activity.totalQuestions > maxQuestionsInDay) {
        maxQuestionsInDay = cell.activity.totalQuestions;
      }
    }
  }

  const averageMinutesPerActiveDay =
    totalActiveDays > 0 ? Math.round(totalMinutes / totalActiveDays) : 0;

  const summary: HeatmapSummary = {
    totalActiveDays,
    totalMinutes,
    totalHoursFormatted: formatHeatmapHours(totalMinutes),
    totalQuestions,
    averageMinutesPerActiveDay,
    maxMinutesInDay,
    maxQuestionsInDay,
  };

  return {
    weeks,
    monthLabels,
    summary,
  };
}

