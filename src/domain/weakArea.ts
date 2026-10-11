import type {
  SubjectId,
  TopicStatus,
  SyllabusTopic,
  TopicProgress,
  StudySession,
  Mistake,
} from './types';

export type WeakAreaUrgency = 'critical' | 'moderate' | 'minor' | 'healthy';

export type WeakSignalType =
  | 'low_accuracy'
  | 'repeated_mistakes'
  | 'unresolved_mistakes'
  | 'revision_overdue'
  | 'needs_revision_status';

export interface WeakAreaTopic {
  topicId: string;
  topicName: string;
  subjectId: SubjectId;
  section: string;
  chapter: string;
  score: number; // 0 to 100
  urgency: WeakAreaUrgency;
  primaryReason: string;
  signals: WeakSignalType[];
  accuracy: number | null;
  questionsAttempted: number;
  unresolvedMistakes: number;
  totalMistakes: number;
  daysSinceLastStudied: number | null;
  status: TopicStatus;
}

export interface WeakAreaSummary {
  totalWeakTopics: number;
  criticalCount: number;
  moderateCount: number;
  minorCount: number;
  bySubject: Record<SubjectId, number>;
  topWeakTopics: WeakAreaTopic[];
}

export interface WeakAreaFilterOptions {
  subjectId?: SubjectId | 'all';
  urgency?: WeakAreaUrgency | 'all';
  searchQuery?: string;
}

export const ALL_SUBJECTS: SubjectId[] = ['math', 'physics', 'chemistry', 'english', 'cse'];

const URGENCY_PRIORITY: Record<WeakAreaUrgency, number> = {
  critical: 4,
  moderate: 3,
  minor: 2,
  healthy: 1,
};

/**
 * Calculates a multi-signal weakness score (0 to 100) and diagnostic metadata for a single topic.
 */
export function calculateTopicWeaknessScore(
  topic: SyllabusTopic,
  progress: TopicProgress | undefined,
  topicSessions: StudySession[] = [],
  topicMistakes: Mistake[] = [],
  referenceDate: Date = new Date(),
): WeakAreaTopic {
  const status: TopicStatus = progress?.status ?? 'not_started';

  // 1. Performance from practice sessions
  const questionsAttempted = topicSessions.reduce(
    (sum, s) => sum + (s.questionsSolved || 0),
    0,
  );
  const correctCount = topicSessions.reduce(
    (sum, s) => sum + (s.correctAnswers || 0),
    0,
  );
  const accuracy =
    questionsAttempted > 0
      ? Math.round((correctCount / questionsAttempted) * 100)
      : null;

  // 2. Mistake counts
  const totalMistakes = topicMistakes.length;
  const unresolvedMistakes = topicMistakes.filter(
    (m) => m.status === 'unresolved',
  ).length;
  const reviewingMistakes = topicMistakes.filter(
    (m) => m.status === 'reviewing',
  ).length;

  // 3. Days since last studied / revised
  let latestDateStr: string | null = null;
  if (progress?.lastStudiedAt) {
    latestDateStr = progress.lastStudiedAt.split('T')[0];
  }
  for (const s of topicSessions) {
    if (s.date && (!latestDateStr || s.date > latestDateStr)) {
      latestDateStr = s.date;
    }
  }

  let daysSinceLastStudied: number | null = null;
  if (latestDateStr) {
    const lastDate = new Date(latestDateStr);
    const diffMs = referenceDate.getTime() - lastDate.getTime();
    daysSinceLastStudied = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  // 4. Scoring Algorithm & Signal Extraction
  let rawScore = 0;
  const signals: WeakSignalType[] = [];

  // Signal A: Practice Accuracy
  if (accuracy !== null) {
    if (accuracy < 50) {
      rawScore += 35;
      signals.push('low_accuracy');
    } else if (accuracy < 65) {
      rawScore += 20;
      signals.push('low_accuracy');
    } else if (accuracy < 75) {
      rawScore += 10;
    } else if (accuracy >= 85) {
      rawScore -= 15; // High accuracy reward
    }
  }

  // Signal B: Mistakes & Error Recurrence
  if (unresolvedMistakes > 0) {
    rawScore += unresolvedMistakes * 15;
    signals.push('unresolved_mistakes');
  }
  if (reviewingMistakes > 0) {
    rawScore += reviewingMistakes * 8;
  }
  if (totalMistakes >= 2) {
    rawScore += 20; // Chronic mistake recurrence bonus
    signals.push('repeated_mistakes');
  }

  // Signal C: Revision Recency Decay (only if topic has been started/practiced)
  const isStudied = status !== 'not_started' || topicSessions.length > 0;
  if (isStudied && daysSinceLastStudied !== null) {
    if (daysSinceLastStudied > 30) {
      rawScore += 20;
      signals.push('revision_overdue');
    } else if (daysSinceLastStudied > 14) {
      rawScore += 10;
      signals.push('revision_overdue');
    } else if (daysSinceLastStudied > 7) {
      rawScore += 5;
    }
  }

  // Signal D: Topic Mastery Status
  if (status === 'needs_revision') {
    rawScore += 30;
    signals.push('needs_revision_status');
  } else if (status === 'learning') {
    rawScore += 15;
  } else if (status === 'strong') {
    rawScore -= 20; // Strong mastery discount
  }

  // Normalize score between 0 and 100
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Categorize Urgency
  let urgency: WeakAreaUrgency = 'healthy';
  if (score >= 70) {
    urgency = 'critical';
  } else if (score >= 45) {
    urgency = 'moderate';
  } else if (score >= 20) {
    urgency = 'minor';
  }

  // Formulate primary diagnostic reason
  let primaryReason = 'Needs reinforcement and practice';
  if (unresolvedMistakes >= 2) {
    primaryReason = `${unresolvedMistakes} unresolved mistakes needing concept analysis`;
  } else if (signals.includes('low_accuracy') && accuracy !== null) {
    primaryReason = `Low practice accuracy (${accuracy}%)`;
  } else if (signals.includes('repeated_mistakes')) {
    primaryReason = `Repeated errors (${totalMistakes} mistakes logged)`;
  } else if (signals.includes('needs_revision_status')) {
    primaryReason = 'Flagged as Needs Revision';
  } else if (signals.includes('revision_overdue') && daysSinceLastStudied !== null) {
    primaryReason = `Revision overdue (${daysSinceLastStudied} days inactive)`;
  } else if (unresolvedMistakes === 1) {
    primaryReason = '1 unresolved mistake logged';
  }

  return {
    topicId: topic.id,
    topicName: topic.name,
    subjectId: topic.subjectId,
    section: topic.section,
    chapter: topic.chapter,
    score,
    urgency,
    primaryReason,
    signals,
    accuracy,
    questionsAttempted,
    unresolvedMistakes,
    totalMistakes,
    daysSinceLastStudied,
    status,
  };
}

/**
 * Detects and ranks weak areas across the syllabus topics.
 */
export function detectWeakAreas(
  topics: SyllabusTopic[] = [],
  progressMap: Record<string, TopicProgress> = {},
  sessions: StudySession[] = [],
  mistakes: Mistake[] = [],
  referenceDate: Date = new Date(),
  minScoreThreshold = 20,
): WeakAreaTopic[] {
  if (!topics || topics.length === 0) {
    return [];
  }

  // Pre-group study sessions by topicId
  const sessionsByTopic: Record<string, StudySession[]> = {};
  for (const s of sessions) {
    if (!s.topicId) continue;
    if (!sessionsByTopic[s.topicId]) {
      sessionsByTopic[s.topicId] = [];
    }
    sessionsByTopic[s.topicId].push(s);
  }

  // Pre-group mistakes by topicId
  const mistakesByTopic: Record<string, Mistake[]> = {};
  for (const m of mistakes) {
    if (!m.topicId) continue;
    if (!mistakesByTopic[m.topicId]) {
      mistakesByTopic[m.topicId] = [];
    }
    mistakesByTopic[m.topicId].push(m);
  }

  const detected: WeakAreaTopic[] = [];

  for (const topic of topics) {
    const progress = progressMap[topic.id];
    const topicSessions = sessionsByTopic[topic.id] || [];
    const topicMistakes = mistakesByTopic[topic.id] || [];

    const weakItem = calculateTopicWeaknessScore(
      topic,
      progress,
      topicSessions,
      topicMistakes,
      referenceDate,
    );

    if (weakItem.score >= minScoreThreshold) {
      detected.push(weakItem);
    }
  }

  // Sort by urgency priority descending, then score descending, then unresolved mistakes descending
  return detected.sort((a, b) => {
    const urgDiff = URGENCY_PRIORITY[b.urgency] - URGENCY_PRIORITY[a.urgency];
    if (urgDiff !== 0) return urgDiff;

    const scoreDiff = b.score - a.score;
    if (scoreDiff !== 0) return scoreDiff;

    const unresDiff = b.unresolvedMistakes - a.unresolvedMistakes;
    if (unresDiff !== 0) return unresDiff;

    return a.topicName.localeCompare(b.topicName);
  });
}

/**
 * Generates aggregated statistical summary of detected weak areas.
 */
export function getWeakAreaSummary(weakAreas: WeakAreaTopic[] = []): WeakAreaSummary {
  const bySubject: Record<SubjectId, number> = {
    math: 0,
    physics: 0,
    chemistry: 0,
    english: 0,
    cse: 0,
  };

  let criticalCount = 0;
  let moderateCount = 0;
  let minorCount = 0;

  for (const item of weakAreas) {
    if (item.subjectId && bySubject[item.subjectId] !== undefined) {
      bySubject[item.subjectId] += 1;
    }

    if (item.urgency === 'critical') {
      criticalCount += 1;
    } else if (item.urgency === 'moderate') {
      moderateCount += 1;
    } else if (item.urgency === 'minor') {
      minorCount += 1;
    }
  }

  return {
    totalWeakTopics: weakAreas.length,
    criticalCount,
    moderateCount,
    minorCount,
    bySubject,
    topWeakTopics: weakAreas.slice(0, 5),
  };
}

/**
 * Filters weak area topics by subject, urgency, and search keyword.
 */
export function filterWeakAreas(
  weakAreas: WeakAreaTopic[] = [],
  options: WeakAreaFilterOptions = {},
): WeakAreaTopic[] {
  const query = options.searchQuery?.trim().toLowerCase();
  const subject = options.subjectId && options.subjectId !== 'all' ? options.subjectId : undefined;
  const urgency = options.urgency && options.urgency !== 'all' ? options.urgency : undefined;

  return weakAreas.filter((item) => {
    if (subject && item.subjectId !== subject) {
      return false;
    }

    if (urgency && item.urgency !== urgency) {
      return false;
    }

    if (query) {
      const matchName = item.topicName.toLowerCase().includes(query);
      const matchChapter = item.chapter.toLowerCase().includes(query);
      const matchSection = item.section.toLowerCase().includes(query);
      const matchReason = item.primaryReason.toLowerCase().includes(query);
      if (!matchName && !matchChapter && !matchSection && !matchReason) {
        return false;
      }
    }

    return true;
  });
}
