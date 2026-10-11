import type {
  SubjectId,
  SyllabusTopic,
  TopicProgress,
  StudySession,
  Mistake,
} from './types';
import { detectWeakAreas, type WeakAreaTopic } from './weakArea';

export type RecommendationType =
  | 'critical_drill'
  | 'spaced_repetition'
  | 'mistake_drill'
  | 'stagnant_topic';

export type RecommendationPriority = 'urgent' | 'high' | 'normal';

export interface RevisionRecommendation {
  id: string;
  topicId: string;
  topicName: string;
  subjectId: SubjectId;
  section: string;
  chapter: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  rationale: string;
  suggestedDurationMinutes: number;
  suggestedAction: 'practice' | 'mistakes' | 'review';
  score: number; // 0 to 100, higher = higher urgency
  daysSinceLastStudied: number | null;
  unresolvedMistakes: number;
  accuracy: number | null;
}

export interface RecommendationSummary {
  totalRecommendations: number;
  urgentCount: number;
  highCount: number;
  normalCount: number;
  estimatedTotalMinutes: number;
  byType: Record<RecommendationType, number>;
  bySubject: Record<SubjectId, number>;
  topRecommendations: RevisionRecommendation[];
}

export interface RecommendationFilterOptions {
  subjectId?: SubjectId | 'all';
  type?: RecommendationType | 'all';
  priority?: RecommendationPriority | 'all';
  searchQuery?: string;
}

export const ALL_REVISION_SUBJECTS: SubjectId[] = [
  'math',
  'physics',
  'chemistry',
  'english',
  'cse',
];

const PRIORITY_ORDER: Record<RecommendationPriority, number> = {
  urgent: 3,
  high: 2,
  normal: 1,
};

/**
 * Generates personalized revision recommendations from syllabus progress,
 * practice sessions, mistakes, and weak area analysis.
 */
export function generateRevisionRecommendations(
  topics: SyllabusTopic[],
  progressMap: Record<string, TopicProgress>,
  sessions: StudySession[],
  mistakes: Mistake[],
  referenceDate: Date = new Date(),
  options: {
    maxRecommendations?: number;
    weakAreas?: WeakAreaTopic[];
  } = {}
): RevisionRecommendation[] {
  const refTime = referenceDate.getTime();
  const weakAreasList =
    options.weakAreas ??
    detectWeakAreas(topics, progressMap, sessions, mistakes, referenceDate, 0);

  const weakAreaByTopic = new Map<string, WeakAreaTopic>();
  for (const item of weakAreasList) {
    weakAreaByTopic.set(item.topicId, item);
  }

  const recommendations: RevisionRecommendation[] = [];

  for (const topic of topics) {
    const progress = progressMap[topic.id];
    const topicSessions = sessions.filter((s) => s.topicId === topic.id);
    const topicMistakes = mistakes.filter((m) => m.topicId === topic.id);

    const hasActivity =
      Boolean(progress) || topicSessions.length > 0 || topicMistakes.length > 0;

    if (!hasActivity) {
      continue;
    }

    const status = progress?.status ?? 'not_started';
    const unresolvedMistakes = topicMistakes.filter(
      (m) => m.status === 'unresolved'
    ).length;

    // Calculate overall practice accuracy
    let accuracy: number | null = null;
    let questionsSolved = 0;
    let correctAnswers = 0;
    for (const session of topicSessions) {
      questionsSolved += session.questionsSolved || 0;
      correctAnswers += session.correctAnswers || 0;
    }
    if (questionsSolved > 0) {
      accuracy = Math.round((correctAnswers / questionsSolved) * 100);
    }

    // Determine recency
    let latestActivityTimestamp: number | null = null;
    for (const s of topicSessions) {
      const ts = new Date(s.date).getTime();
      if (
        !isNaN(ts) &&
        (latestActivityTimestamp === null || ts > latestActivityTimestamp)
      ) {
        latestActivityTimestamp = ts;
      }
    }
    if (progress?.lastStudiedAt) {
      const ts = new Date(progress.lastStudiedAt).getTime();
      if (
        !isNaN(ts) &&
        (latestActivityTimestamp === null || ts > latestActivityTimestamp)
      ) {
        latestActivityTimestamp = ts;
      }
    } else if (progress?.updatedAt) {
      const ts = new Date(progress.updatedAt).getTime();
      if (
        !isNaN(ts) &&
        (latestActivityTimestamp === null || ts > latestActivityTimestamp)
      ) {
        latestActivityTimestamp = ts;
      }
    }

    let daysSinceLastStudied: number | null = null;
    if (latestActivityTimestamp !== null) {
      daysSinceLastStudied = Math.max(
        0,
        Math.floor((refTime - latestActivityTimestamp) / (1000 * 60 * 60 * 24))
      );
    }

    const weakArea = weakAreaByTopic.get(topic.id);
    const weakScore = weakArea ? weakArea.score : 0;

    // Evaluate potential recommendation candidates for this topic
    const candidates: RevisionRecommendation[] = [];

    // 1. Critical Drill: Weak area with severe weakness score (>= 70), low accuracy (< 50%), or marked needs_revision
    if (
      weakScore >= 70 ||
      (accuracy !== null && accuracy < 50 && questionsSolved >= 5) ||
      status === 'needs_revision'
    ) {
      let priority: RecommendationPriority = 'high';
      let score = Math.max(70, weakScore);
      let rationale = '';

      if (accuracy !== null && accuracy < 50) {
        priority = 'urgent';
        score = Math.max(85, score);
        rationale = `Low practice accuracy (${accuracy}%) indicates conceptual gaps. Intensive drill recommended.`;
      } else if (status === 'needs_revision') {
        priority = 'urgent';
        score = Math.max(80, score);
        rationale = 'Manually flagged as Needs Revision. Core theory and problem sets require revisiting.';
      } else {
        rationale = `Diagnostic weakness score is ${weakScore}/100. Topic needs focused revision.`;
      }

      candidates.push({
        id: `rec-crit-${topic.id}`,
        topicId: topic.id,
        topicName: topic.name,
        subjectId: topic.subjectId,
        section: topic.section,
        chapter: topic.chapter,
        type: 'critical_drill',
        priority,
        title: `Urgent Drill: ${topic.name}`,
        rationale,
        suggestedDurationMinutes: 45,
        suggestedAction: 'practice',
        score,
        daysSinceLastStudied,
        unresolvedMistakes,
        accuracy,
      });
    }

    // 2. Mistake Drill: Topic with unresolved errors
    if (unresolvedMistakes > 0) {
      const priority: RecommendationPriority =
        unresolvedMistakes >= 3 ? 'urgent' : 'high';
      const score = Math.min(95, 55 + unresolvedMistakes * 10);
      const rationale = `${unresolvedMistakes} unresolved ${
        unresolvedMistakes === 1 ? 'error remains' : 'errors remain'
      } in this topic. Review solutions to prevent recurring slips.`;

      candidates.push({
        id: `rec-mistake-${topic.id}`,
        topicId: topic.id,
        topicName: topic.name,
        subjectId: topic.subjectId,
        section: topic.section,
        chapter: topic.chapter,
        type: 'mistake_drill',
        priority,
        title: `Mistake Reflection: ${topic.name}`,
        rationale,
        suggestedDurationMinutes: Math.min(30, 15 + unresolvedMistakes * 5),
        suggestedAction: 'mistakes',
        score,
        daysSinceLastStudied,
        unresolvedMistakes,
        accuracy,
      });
    }

    // 3. Spaced Repetition: Previously learned or strong topic due for memory reinforcement
    if (
      daysSinceLastStudied !== null &&
      daysSinceLastStudied >= 7 &&
      (status === 'strong' || status === 'practicing')
    ) {
      let priority: RecommendationPriority = 'normal';
      let score = 40;
      let rationale = '';
      let title = `Spaced Refresher: ${topic.name}`;
      let suggestedDuration = 30;

      if (daysSinceLastStudied >= 30) {
        priority = 'high';
        score = Math.min(85, 65 + Math.min(15, daysSinceLastStudied - 30));
        title = `Overdue Spaced Review: ${topic.name}`;
        rationale = `Inactive for ${daysSinceLastStudied} days. Memory retention decays quickly after 30 days without review.`;
        suggestedDuration = 40;
      } else if (daysSinceLastStudied >= 14) {
        priority = 'high';
        score = 55;
        title = `14-Day Reinforcement: ${topic.name}`;
        rationale = `Last practiced ${daysSinceLastStudied} days ago. 2-week memory consolidation cycle is due.`;
        suggestedDuration = 30;
      } else {
        priority = 'normal';
        score = 40;
        title = `Weekly Refresher: ${topic.name}`;
        rationale = `Last practiced ${daysSinceLastStudied} days ago. Quick checkup ensures high formula and method recall.`;
        suggestedDuration = 20;
      }

      candidates.push({
        id: `rec-spaced-${topic.id}`,
        topicId: topic.id,
        topicName: topic.name,
        subjectId: topic.subjectId,
        section: topic.section,
        chapter: topic.chapter,
        type: 'spaced_repetition',
        priority,
        title,
        rationale,
        suggestedDurationMinutes: suggestedDuration,
        suggestedAction: 'practice',
        score,
        daysSinceLastStudied,
        unresolvedMistakes,
        accuracy,
      });
    }

    // 4. Stagnant Topic: Learning started but stalled for > 14 days
    if (
      status === 'learning' &&
      daysSinceLastStudied !== null &&
      daysSinceLastStudied >= 14 &&
      candidates.length === 0
    ) {
      const priority: RecommendationPriority =
        daysSinceLastStudied >= 28 ? 'high' : 'normal';
      const score = Math.min(65, 40 + Math.floor(daysSinceLastStudied / 7) * 5);
      const rationale = `Started learning but inactive for ${daysSinceLastStudied} days. Reconnect with concepts and complete practice.`;

      candidates.push({
        id: `rec-stagnant-${topic.id}`,
        topicId: topic.id,
        topicName: topic.name,
        subjectId: topic.subjectId,
        section: topic.section,
        chapter: topic.chapter,
        type: 'stagnant_topic',
        priority,
        title: `Resume Topic: ${topic.name}`,
        rationale,
        suggestedDurationMinutes: 35,
        suggestedAction: 'practice',
        score,
        daysSinceLastStudied,
        unresolvedMistakes,
        accuracy,
      });
    }

    // Pick the most urgent recommendation for this topic
    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        const pDiff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
        if (pDiff !== 0) return pDiff;
        return b.score - a.score;
      });
      recommendations.push(candidates[0]);
    }
  }

  // Sort overall recommendations: priority first, then score descending, then days inactive
  recommendations.sort((a, b) => {
    const pDiff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
    if (pDiff !== 0) return pDiff;

    const sDiff = b.score - a.score;
    if (sDiff !== 0) return sDiff;

    const daysA = a.daysSinceLastStudied ?? 0;
    const daysB = b.daysSinceLastStudied ?? 0;
    if (daysB !== daysA) return daysB - daysA;

    return a.topicName.localeCompare(b.topicName);
  });

  if (options.maxRecommendations && options.maxRecommendations > 0) {
    return recommendations.slice(0, options.maxRecommendations);
  }

  return recommendations;
}

/**
 * Summarizes a list of recommendations into total counts, estimated time, and distributions.
 */
export function getRevisionRecommendationSummary(
  recommendations: RevisionRecommendation[] = []
): RecommendationSummary {
  const byType: Record<RecommendationType, number> = {
    critical_drill: 0,
    spaced_repetition: 0,
    mistake_drill: 0,
    stagnant_topic: 0,
  };

  const bySubject: Record<SubjectId, number> = {
    math: 0,
    physics: 0,
    chemistry: 0,
    english: 0,
    cse: 0,
  };

  let urgentCount = 0;
  let highCount = 0;
  let normalCount = 0;
  let estimatedTotalMinutes = 0;

  for (const rec of recommendations) {
    if (rec.type && byType[rec.type] !== undefined) {
      byType[rec.type]++;
    }
    if (rec.subjectId && bySubject[rec.subjectId] !== undefined) {
      bySubject[rec.subjectId]++;
    }

    if (rec.priority === 'urgent') urgentCount++;
    else if (rec.priority === 'high') highCount++;
    else normalCount++;

    estimatedTotalMinutes += rec.suggestedDurationMinutes || 0;
  }

  return {
    totalRecommendations: recommendations.length,
    urgentCount,
    highCount,
    normalCount,
    estimatedTotalMinutes,
    byType,
    bySubject,
    topRecommendations: recommendations.slice(0, 5),
  };
}

/**
 * Filters recommendations by subject, type, priority, and text search query.
 */
export function filterRevisionRecommendations(
  recommendations: RevisionRecommendation[] = [],
  options: RecommendationFilterOptions = {}
): RevisionRecommendation[] {
  const { subjectId, type, priority, searchQuery } = options;
  const query = searchQuery ? searchQuery.trim().toLowerCase() : '';

  return recommendations.filter((item) => {
    if (subjectId && subjectId !== 'all' && item.subjectId !== subjectId) {
      return false;
    }

    if (type && type !== 'all' && item.type !== type) {
      return false;
    }

    if (priority && priority !== 'all' && item.priority !== priority) {
      return false;
    }

    if (query) {
      const matchName = item.topicName.toLowerCase().includes(query);
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchChapter = item.chapter.toLowerCase().includes(query);
      const matchRationale = item.rationale.toLowerCase().includes(query);
      if (!matchName && !matchTitle && !matchChapter && !matchRationale) {
        return false;
      }
    }

    return true;
  });
}
