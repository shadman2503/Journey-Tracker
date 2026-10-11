import type { MockTest, StudySession, SubjectId } from './types';

export type PerformanceTimeRange = '30d' | '60d' | '90d' | 'all';

export interface MockTrendPoint {
  id: number;
  testName: string;
  date: string;
  formattedDate: string;
  score: number;
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  subjectId?: SubjectId;
  subjectName: string;
}

export interface PracticeTrendPoint {
  date: string;
  formattedDate: string;
  questionsSolved: number;
  correctAnswers: number;
  accuracy: number;
  durationMinutes: number;
}

export interface SubjectPerformanceBreakdown {
  subjectId: SubjectId;
  subjectName: string;
  studySessionsCount: number;
  practiceQuestions: number;
  practiceAccuracy: number;
  mockTestsCount: number;
  mockAverageScore: number;
  mockAverageAccuracy: number;
}

export interface PerformanceTrajectory {
  direction: 'improving' | 'declining' | 'stable' | 'insufficient_data';
  deltaScore: number;
  percentageChange: number;
  recentAverageScore: number;
  earlierAverageScore: number;
}

export interface PerformanceAnalyticsSummary {
  mockTrend: MockTrendPoint[];
  practiceTrend: PracticeTrendPoint[];
  subjectBreakdown: SubjectPerformanceBreakdown[];
  trajectory: PerformanceTrajectory;
  overallPracticeAccuracy: number;
  overallMockAccuracy: number;
  averageMockScore: number;
  highestMockScore: number;
  totalPracticeQuestions: number;
  totalMockQuestions: number;
  totalHoursSpent: number;
  totalHoursFormatted: string;
}

const SUBJECT_NAMES: Record<SubjectId, string> = {
  math: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  english: 'English',
  cse: 'Computer Science',
};

const ALL_SUBJECT_IDS: SubjectId[] = ['math', 'physics', 'chemistry', 'english', 'cse'];

/**
 * Checks if a given date string is within the requested time range.
 */
export function isDateInTimeRange(
  dateStr: string,
  timeRange: PerformanceTimeRange,
  referenceDate: Date = new Date(),
): boolean {
  if (timeRange === 'all') return true;

  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const diffMs = referenceDate.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return true; // future dates or today

  switch (timeRange) {
    case '30d':
      return diffDays <= 30;
    case '60d':
      return diffDays <= 60;
    case '90d':
      return diffDays <= 90;
    default:
      return true;
  }
}

/**
 * Formats a YYYY-MM-DD date into short display format e.g. "Oct 5".
 */
export function formatShortDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Calculates chronological mock test trend points for plotting.
 */
export function calculateMockPerformanceTrend(
  tests: MockTest[],
  timeRange: PerformanceTimeRange = 'all',
  subjectId: SubjectId | 'all' = 'all',
  referenceDate?: Date,
): MockTrendPoint[] {
  if (!tests || tests.length === 0) return [];

  const filtered = tests.filter((t) => {
    // Subject filter
    if (subjectId !== 'all') {
      if (t.subjectId !== subjectId) return false;
    }
    // Time range filter
    return isDateInTimeRange(t.date, timeRange, referenceDate);
  });

  // Sort chronologically oldest to newest for left-to-right chart progression
  const sorted = [...filtered].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || (a.id ?? 0) - (b.id ?? 0),
  );

  return sorted.map((t) => ({
    id: t.id ?? 0,
    testName: t.testName,
    date: t.date,
    formattedDate: formatShortDate(t.date),
    score: t.score,
    accuracy: t.accuracy,
    totalQuestions: t.totalQuestions,
    correctAnswers: t.correctAnswers,
    wrongAnswers: t.wrongAnswers,
    subjectId: t.subjectId,
    subjectName: t.subjectId ? SUBJECT_NAMES[t.subjectId] : 'Full Syllabus',
  }));
}

/**
 * Aggregates practice sessions into chronological daily trend points.
 */
export function calculatePracticeTrend(
  sessions: StudySession[],
  timeRange: PerformanceTimeRange = 'all',
  subjectId: SubjectId | 'all' = 'all',
  referenceDate?: Date,
): PracticeTrendPoint[] {
  if (!sessions || sessions.length === 0) return [];

  const filtered = sessions.filter((s) => {
    if (subjectId !== 'all') {
      if (s.subjectId !== subjectId) return false;
    }
    return isDateInTimeRange(s.date, timeRange, referenceDate);
  });

  // Group by date
  const byDate: Record<string, { questionsSolved: number; correctAnswers: number; durationMinutes: number }> = {};
  for (const s of filtered) {
    if (!byDate[s.date]) {
      byDate[s.date] = { questionsSolved: 0, correctAnswers: 0, durationMinutes: 0 };
    }
    byDate[s.date].questionsSolved += s.questionsSolved || 0;
    byDate[s.date].correctAnswers += s.correctAnswers || 0;
    byDate[s.date].durationMinutes += s.durationMinutes || 0;
  }

  // Sort dates chronologically oldest to newest
  const sortedDates = Object.keys(byDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  return sortedDates.map((date) => {
    const item = byDate[date];
    const accuracy =
      item.questionsSolved > 0
        ? Math.round((item.correctAnswers / item.questionsSolved) * 1000) / 10
        : 0;

    return {
      date,
      formattedDate: formatShortDate(date),
      questionsSolved: item.questionsSolved,
      correctAnswers: item.correctAnswers,
      accuracy,
      durationMinutes: item.durationMinutes,
    };
  });
}

/**
 * Computes comparative performance metrics across all 5 DUET subjects.
 */
export function calculateSubjectPerformance(
  sessions: StudySession[],
  tests: MockTest[],
): SubjectPerformanceBreakdown[] {
  return ALL_SUBJECT_IDS.map((subId) => {
    // Practice sessions for subject
    const subSessions = sessions.filter((s) => s.subjectId === subId);
    let practiceQuestions = 0;
    let practiceCorrect = 0;
    for (const s of subSessions) {
      practiceQuestions += s.questionsSolved || 0;
      practiceCorrect += s.correctAnswers || 0;
    }
    const practiceAccuracy =
      practiceQuestions > 0
        ? Math.round((practiceCorrect / practiceQuestions) * 1000) / 10
        : 0;

    // Mock tests for subject
    const subTests = tests.filter((t) => t.subjectId === subId);
    let totalMockScore = 0;
    let totalMockAccuracy = 0;
    for (const t of subTests) {
      totalMockScore += t.score;
      totalMockAccuracy += t.accuracy;
    }
    const mockTestsCount = subTests.length;
    const mockAverageScore =
      mockTestsCount > 0
        ? Math.round((totalMockScore / mockTestsCount) * 100) / 100
        : 0;
    const mockAverageAccuracy =
      mockTestsCount > 0
        ? Math.round((totalMockAccuracy / mockTestsCount) * 10) / 10
        : 0;

    return {
      subjectId: subId,
      subjectName: SUBJECT_NAMES[subId],
      studySessionsCount: subSessions.length,
      practiceQuestions,
      practiceAccuracy,
      mockTestsCount,
      mockAverageScore,
      mockAverageAccuracy,
    };
  });
}

/**
 * Detects whether score trend is improving, declining, or stable.
 */
export function calculatePerformanceTrajectory(tests: MockTest[]): PerformanceTrajectory {
  if (!tests || tests.length < 2) {
    return {
      direction: 'insufficient_data',
      deltaScore: 0,
      percentageChange: 0,
      recentAverageScore: tests?.[0]?.score ?? 0,
      earlierAverageScore: tests?.[0]?.score ?? 0,
    };
  }

  // Sort tests chronologically oldest to newest
  const sorted = [...tests].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || (a.id ?? 0) - (b.id ?? 0),
  );

  const midpoint = Math.floor(sorted.length / 2);
  const earlierTests = sorted.slice(0, midpoint);
  const recentTests = sorted.slice(midpoint);

  const earlierSum = earlierTests.reduce((acc, t) => acc + t.score, 0);
  const recentSum = recentTests.reduce((acc, t) => acc + t.score, 0);

  const earlierAvg = Math.round((earlierSum / earlierTests.length) * 100) / 100;
  const recentAvg = Math.round((recentSum / recentTests.length) * 100) / 100;

  const deltaScore = Math.round((recentAvg - earlierAvg) * 100) / 100;
  const percentageChange =
    earlierAvg !== 0
      ? Math.round(((recentAvg - earlierAvg) / Math.abs(earlierAvg)) * 1000) / 10
      : 0;

  let direction: PerformanceTrajectory['direction'] = 'stable';
  if (deltaScore >= 1.5) {
    direction = 'improving';
  } else if (deltaScore <= -1.5) {
    direction = 'declining';
  }

  return {
    direction,
    deltaScore,
    percentageChange,
    recentAverageScore: recentAvg,
    earlierAverageScore: earlierAvg,
  };
}

/**
 * Aggregates complete performance analytics overview.
 */
export function generatePerformanceAnalytics(
  sessions: StudySession[] = [],
  tests: MockTest[] = [],
  options: {
    timeRange?: PerformanceTimeRange;
    subjectId?: SubjectId | 'all';
    referenceDate?: Date;
  } = {},
): PerformanceAnalyticsSummary {
  const { timeRange = 'all', subjectId = 'all', referenceDate } = options;

  const mockTrend = calculateMockPerformanceTrend(tests, timeRange, subjectId, referenceDate);
  const practiceTrend = calculatePracticeTrend(sessions, timeRange, subjectId, referenceDate);
  const subjectBreakdown = calculateSubjectPerformance(sessions, tests);
  const trajectory = calculatePerformanceTrajectory(tests);

  // Totals & KPIs
  let totalPracticeQuestions = 0;
  let totalPracticeCorrect = 0;
  let totalMinutes = 0;
  for (const s of sessions) {
    totalPracticeQuestions += s.questionsSolved || 0;
    totalPracticeCorrect += s.correctAnswers || 0;
    totalMinutes += s.durationMinutes || 0;
  }
  const overallPracticeAccuracy =
    totalPracticeQuestions > 0
      ? Math.round((totalPracticeCorrect / totalPracticeQuestions) * 1000) / 10
      : 0;

  let totalMockQuestions = 0;
  let totalMockScore = 0;
  let totalMockAccuracy = 0;
  let highestMockScore = 0;
  for (const t of tests) {
    totalMockQuestions += t.correctAnswers + t.wrongAnswers;
    totalMockScore += t.score;
    totalMockAccuracy += t.accuracy;
    if (t.score > highestMockScore) {
      highestMockScore = t.score;
    }
  }
  const overallMockAccuracy =
    tests.length > 0 ? Math.round((totalMockAccuracy / tests.length) * 10) / 10 : 0;
  const averageMockScore =
    tests.length > 0 ? Math.round((totalMockScore / tests.length) * 100) / 100 : 0;

  const hours = Math.round((totalMinutes / 60) * 10) / 10;
  const totalHoursFormatted =
    hours % 1 === 0 ? `${Math.floor(hours)} hrs` : `${hours.toFixed(1)} hrs`;

  return {
    mockTrend,
    practiceTrend,
    subjectBreakdown,
    trajectory,
    overallPracticeAccuracy,
    overallMockAccuracy,
    averageMockScore,
    highestMockScore,
    totalPracticeQuestions,
    totalMockQuestions,
    totalHoursSpent: hours,
    totalHoursFormatted,
  };
}

