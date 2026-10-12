import type { SubjectId, StudySession, Mistake, MockTest } from './types';

export interface CumulativeVolumePoint {
  date: string;
  formattedDate: string;
  cumulativeHours: number;
  cumulativeQuestions: number;
  dailyHours: number;
  dailyQuestions: number;
}

export interface StudyVelocityPoint {
  periodKey: string;
  label: string;
  startDate: string;
  endDate: string;
  questionsSolved: number;
  hoursSpent: number;
  sessionsCount: number;
  accuracy: number;
}

export interface SubjectTimeAllocation {
  subjectId: SubjectId;
  subjectName: string;
  minutes: number;
  hours: number;
  formattedHours: string;
  percentage: number;
  targetBenchmarkPercentage: number;
}

export interface PreparationConsistencyMetrics {
  totalActiveDays: number;
  totalSessions: number;
  totalHours: number;
  formattedTotalHours: string;
  averageSessionDurationMinutes: number;
  questionsPerHour: number;
  averageQuestionsPerDay: number;
}

export interface MistakeResolutionAnalytics {
  totalMistakes: number;
  resolvedCount: number;
  reviewingCount: number;
  unresolvedCount: number;
  resolutionRate: number;
  byType: Record<string, number>;
  bySubject: Record<SubjectId, { total: number; resolved: number; unresolved: number }>;
}

export interface LongTermAnalyticsSummary {
  cumulativeVolume: CumulativeVolumePoint[];
  studyVelocity: StudyVelocityPoint[];
  subjectTimeDistribution: SubjectTimeAllocation[];
  consistencyMetrics: PreparationConsistencyMetrics;
  mistakeResolution: MistakeResolutionAnalytics;
  totalQuestionsSolved: number;
  totalHoursInvested: number;
  formattedTotalHours: string;
}

const SUBJECT_NAMES: Record<SubjectId, string> = {
  math: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  english: 'English',
  cse: 'Computer Science',
};

const ALL_SUBJECT_IDS: SubjectId[] = ['math', 'physics', 'chemistry', 'english', 'cse'];

// Standard DUET syllabus weightings as reference distribution targets
export const DUET_SUBJECT_BENCHMARK_PERCENTAGES: Record<SubjectId, number> = {
  math: 30,
  cse: 25,
  physics: 20,
  chemistry: 15,
  english: 10,
};

export function formatShortDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatHours(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  if (rounded < 1) {
    const mins = Math.round(hours * 60);
    return `${mins}m`;
  }
  return `${rounded} hrs`;
}

/**
 * Calculates cumulative study hours and questions solved over time.
 */
export function calculateCumulativeVolumeTrend(
  sessions: StudySession[] = [],
  mockTests: MockTest[] = [],
): CumulativeVolumePoint[] {
  // Aggregate daily volume from sessions and mock tests
  const dailyMap: Record<string, { minutes: number; questions: number }> = {};

  for (const s of sessions) {
    if (!s.date) continue;
    if (!dailyMap[s.date]) {
      dailyMap[s.date] = { minutes: 0, questions: 0 };
    }
    dailyMap[s.date].minutes += s.durationMinutes || 0;
    dailyMap[s.date].questions += s.questionsSolved || 0;
  }

  for (const t of mockTests) {
    if (!t.date) continue;
    if (!dailyMap[t.date]) {
      dailyMap[t.date] = { minutes: 0, questions: 0 };
    }
    dailyMap[t.date].minutes += t.timeTakenMinutes || 0;
    dailyMap[t.date].questions += t.totalQuestions || 0;
  }

  const sortedDates = Object.keys(dailyMap).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  let cumulativeMinutes = 0;
  let cumulativeQuestions = 0;

  return sortedDates.map((date) => {
    const item = dailyMap[date];
    cumulativeMinutes += item.minutes;
    cumulativeQuestions += item.questions;

    const dailyHours = Math.round((item.minutes / 60) * 100) / 100;
    const cumulativeHours = Math.round((cumulativeMinutes / 60) * 100) / 100;

    return {
      date,
      formattedDate: formatShortDate(date),
      cumulativeHours,
      cumulativeQuestions,
      dailyHours,
      dailyQuestions: item.questions,
    };
  });
}

/**
 * Aggregates study activity into weekly velocity buckets to reveal study momentum.
 */
export function calculateStudyVelocityTrend(
  sessions: StudySession[] = [],
  mockTests: MockTest[] = [],
): StudyVelocityPoint[] {
  interface DayEntry {
    date: string;
    questions: number;
    correct: number;
    minutes: number;
    isSession: boolean;
  }

  const allEntries: DayEntry[] = [];
  for (const s of sessions) {
    if (!s.date) continue;
    allEntries.push({
      date: s.date,
      questions: s.questionsSolved || 0,
      correct: s.correctAnswers || 0,
      minutes: s.durationMinutes || 0,
      isSession: true,
    });
  }
  for (const t of mockTests) {
    if (!t.date) continue;
    allEntries.push({
      date: t.date,
      questions: t.totalQuestions || 0,
      correct: t.correctAnswers || 0,
      minutes: t.timeTakenMinutes || 0,
      isSession: true,
    });
  }

  if (allEntries.length === 0) return [];

  // Sort by date ascending
  allEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Group into 7-day intervals starting from first recorded entry
  const minDate = new Date(allEntries[0].date);
  // Reset time to start of day
  minDate.setHours(0, 0, 0, 0);

  const buckets: Record<
    string,
    {
      periodKey: string;
      startDate: Date;
      endDate: Date;
      questionsSolved: number;
      correctAnswers: number;
      minutesSpent: number;
      sessionsCount: number;
    }
  > = {};

  for (const entry of allEntries) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(
      (entryDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const weekIndex = Math.floor(diffDays / 7);
    const periodKey = `W${weekIndex + 1}`;

    if (!buckets[periodKey]) {
      const startDate = new Date(minDate);
      startDate.setDate(minDate.getDate() + weekIndex * 7);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      buckets[periodKey] = {
        periodKey,
        startDate,
        endDate,
        questionsSolved: 0,
        correctAnswers: 0,
        minutesSpent: 0,
        sessionsCount: 0,
      };
    }

    buckets[periodKey].questionsSolved += entry.questions;
    buckets[periodKey].correctAnswers += entry.correct;
    buckets[periodKey].minutesSpent += entry.minutes;
    buckets[periodKey].sessionsCount += 1;
  }

  return Object.values(buckets).map((b) => {
    const accuracy =
      b.questionsSolved > 0
        ? Math.round((b.correctAnswers / b.questionsSolved) * 1000) / 10
        : 0;
    const hoursSpent = Math.round((b.minutesSpent / 60) * 10) / 10;
    const startStr = b.startDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    const endStr = b.endDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });

    return {
      periodKey: b.periodKey,
      label: `${startStr} - ${endStr}`,
      startDate: b.startDate.toISOString().split('T')[0],
      endDate: b.endDate.toISOString().split('T')[0],
      questionsSolved: b.questionsSolved,
      hoursSpent,
      sessionsCount: b.sessionsCount,
      accuracy,
    };
  });
}

/**
 * Calculates preparation time invested per subject and compares against DUET benchmark distribution.
 */
export function calculateSubjectTimeDistribution(
  sessions: StudySession[] = [],
  mockTests: MockTest[] = [],
): SubjectTimeAllocation[] {
  const subjectMinutes: Record<SubjectId, number> = {
    math: 0,
    physics: 0,
    chemistry: 0,
    english: 0,
    cse: 0,
  };

  for (const s of sessions) {
    if (s.subjectId && subjectMinutes[s.subjectId] !== undefined) {
      subjectMinutes[s.subjectId] += s.durationMinutes || 0;
    }
  }

  for (const t of mockTests) {
    if (t.subjectId && subjectMinutes[t.subjectId] !== undefined) {
      subjectMinutes[t.subjectId] += t.timeTakenMinutes || 0;
    }
  }

  const totalMinutes = Object.values(subjectMinutes).reduce((acc, curr) => acc + curr, 0);

  return ALL_SUBJECT_IDS.map((subId) => {
    const minutes = subjectMinutes[subId];
    const hours = Math.round((minutes / 60) * 10) / 10;
    const percentage =
      totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 1000) / 10 : 0;

    return {
      subjectId: subId,
      subjectName: SUBJECT_NAMES[subId],
      minutes,
      hours,
      formattedHours: formatHours(hours),
      percentage,
      targetBenchmarkPercentage: DUET_SUBJECT_BENCHMARK_PERCENTAGES[subId],
    };
  });
}

/**
 * Calculates consistency and speed metrics across preparation activity.
 */
export function calculatePreparationConsistencyMetrics(
  sessions: StudySession[] = [],
): PreparationConsistencyMetrics {
  const activeDates = new Set<string>();
  let totalMinutes = 0;
  let totalQuestions = 0;

  for (const s of sessions) {
    if (s.date) activeDates.add(s.date);
    totalMinutes += s.durationMinutes || 0;
    totalQuestions += s.questionsSolved || 0;
  }

  const totalActiveDays = activeDates.size;
  const totalSessions = sessions.length;
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const averageSessionDurationMinutes =
    totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
  const questionsPerHour =
    totalHours > 0 ? Math.round((totalQuestions / totalHours) * 10) / 10 : 0;
  const averageQuestionsPerDay =
    totalActiveDays > 0 ? Math.round(totalQuestions / totalActiveDays) : 0;

  return {
    totalActiveDays,
    totalSessions,
    totalHours,
    formattedTotalHours: formatHours(totalHours),
    averageSessionDurationMinutes,
    questionsPerHour,
    averageQuestionsPerDay,
  };
}

/**
 * Computes long-term mistake resolution efficiency and error category breakdown.
 */
export function calculateMistakeResolutionAnalytics(
  mistakes: Mistake[] = [],
): MistakeResolutionAnalytics {
  let resolvedCount = 0;
  let reviewingCount = 0;
  let unresolvedCount = 0;

  const byType: Record<string, number> = {};
  const bySubject: Record<
    SubjectId,
    { total: number; resolved: number; unresolved: number }
  > = {
    math: { total: 0, resolved: 0, unresolved: 0 },
    physics: { total: 0, resolved: 0, unresolved: 0 },
    chemistry: { total: 0, resolved: 0, unresolved: 0 },
    english: { total: 0, resolved: 0, unresolved: 0 },
    cse: { total: 0, resolved: 0, unresolved: 0 },
  };

  for (const m of mistakes) {
    if (m.status === 'fixed') {
      resolvedCount++;
    } else if (m.status === 'reviewing') {
      reviewingCount++;
    } else {
      unresolvedCount++;
    }

    if (m.type) {
      byType[m.type] = (byType[m.type] || 0) + 1;
    }

    if (m.subjectId && bySubject[m.subjectId]) {
      bySubject[m.subjectId].total++;
      if (m.status === 'fixed') {
        bySubject[m.subjectId].resolved++;
      } else {
        bySubject[m.subjectId].unresolved++;
      }
    }
  }

  const totalMistakes = mistakes.length;
  const resolutionRate =
    totalMistakes > 0 ? Math.round((resolvedCount / totalMistakes) * 1000) / 10 : 0;

  return {
    totalMistakes,
    resolvedCount,
    reviewingCount,
    unresolvedCount,
    resolutionRate,
    byType,
    bySubject,
  };
}

/**
 * Consolidated high-level summary generator for long-term analytics overview.
 */
export function calculateLongTermAnalyticsSummary(
  sessions: StudySession[] = [],
  mockTests: MockTest[] = [],
  mistakes: Mistake[] = [],
): LongTermAnalyticsSummary {
  const cumulativeVolume = calculateCumulativeVolumeTrend(sessions, mockTests);
  const studyVelocity = calculateStudyVelocityTrend(sessions, mockTests);
  const subjectTimeDistribution = calculateSubjectTimeDistribution(sessions, mockTests);
  const consistencyMetrics = calculatePreparationConsistencyMetrics(sessions);
  const mistakeResolution = calculateMistakeResolutionAnalytics(mistakes);

  let totalPracticeQuestions = 0;
  let totalMockQuestions = 0;
  let totalMinutes = 0;

  for (const s of sessions) {
    totalPracticeQuestions += s.questionsSolved || 0;
    totalMinutes += s.durationMinutes || 0;
  }
  for (const t of mockTests) {
    totalMockQuestions += t.totalQuestions || 0;
    totalMinutes += t.timeTakenMinutes || 0;
  }

  const totalQuestionsSolved = totalPracticeQuestions + totalMockQuestions;
  const totalHoursInvested = Math.round((totalMinutes / 60) * 10) / 10;

  return {
    cumulativeVolume,
    studyVelocity,
    subjectTimeDistribution,
    consistencyMetrics,
    mistakeResolution,
    totalQuestionsSolved,
    totalHoursInvested,
    formattedTotalHours: formatHours(totalHoursInvested),
  };
}

