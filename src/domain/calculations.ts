import type {
  SubjectId,
  SyllabusTopic,
  TopicProgress,
  SubjectProgressSummary,
  OverallProgressSummary,
  TopicStatus,
} from '@/domain/types';
import { SUBJECTS_META } from '@/domain/syllabusData';
import { calculateStreak } from './streak';
export { calculateStreak };

export const STATUS_WEIGHTS: Record<TopicStatus, number> = {
  strong: 1.0,
  practicing: 0.75,
  needs_revision: 0.5,
  learning: 0.4,
  not_started: 0,
};

/**
 * Calculates a weighted completion percentage for a given count of topics and their progress records.
 * Weightings: strong = 100%, practicing = 75%, needs_revision = 50%, learning = 40%, not_started = 0%.
 */
export function calculateTopicProgressPercentage(
  totalTopics: number,
  progressList: TopicProgress[],
): number {
  if (totalTopics <= 0) return 0;

  const completedWeight = progressList.reduce((acc, p) => {
    return acc + (STATUS_WEIGHTS[p.status] ?? 0);
  }, 0);

  const percentage = Math.round((completedWeight / totalTopics) * 100);
  return Math.min(100, Math.max(0, percentage));
}

/**
 * Calculates comprehensive progress metrics for a single subject.
 */
export function calculateSubjectProgress(
  subjectId: SubjectId,
  subjectName: string,
  topics: SyllabusTopic[],
  progressMap: Record<string, TopicProgress>,
): SubjectProgressSummary {
  const subjectTopics = topics.filter((t) => t.subjectId === subjectId);
  const total = subjectTopics.length;

  let completed = 0;
  let inProgress = 0;
  let needsRevision = 0;
  let notStarted = 0;
  let totalWeight = 0;

  for (const topic of subjectTopics) {
    const status: TopicStatus = progressMap[topic.id]?.status ?? 'not_started';
    totalWeight += STATUS_WEIGHTS[status] ?? 0;

    switch (status) {
      case 'strong':
        completed++;
        break;
      case 'learning':
      case 'practicing':
        inProgress++;
        break;
      case 'needs_revision':
        needsRevision++;
        break;
      case 'not_started':
      default:
        notStarted++;
        break;
    }
  }

  const percentage =
    total > 0
      ? Math.min(100, Math.max(0, Math.round((totalWeight / total) * 100)))
      : 0;

  return {
    subjectId,
    subjectName,
    totalTopics: total,
    completedTopics: completed,
    inProgressTopics: inProgress,
    needsRevisionTopics: needsRevision,
    notStartedTopics: notStarted,
    percentage,
  };
}

/**
 * Calculates overall syllabus progress across all subjects.
 */
export function calculateOverallProgress(
  allTopics: SyllabusTopic[],
  progressMap: Record<string, TopicProgress>,
  subjectsList: { id: SubjectId; name: string }[] = SUBJECTS_META,
): OverallProgressSummary {
  const subjectSummaries: Partial<Record<SubjectId, SubjectProgressSummary>> = {};

  let totalTopics = 0;
  let completedTopics = 0;
  let inProgressTopics = 0;
  let needsRevisionTopics = 0;
  let notStartedTopics = 0;
  let totalWeightedScore = 0;

  for (const sub of subjectsList) {
    const summary = calculateSubjectProgress(
      sub.id,
      sub.name,
      allTopics,
      progressMap,
    );
    subjectSummaries[sub.id] = summary;

    totalTopics += summary.totalTopics;
    completedTopics += summary.completedTopics;
    inProgressTopics += summary.inProgressTopics;
    needsRevisionTopics += summary.needsRevisionTopics;
    notStartedTopics += summary.notStartedTopics;

    // Sum individual topic weights from the subject topics
    const subTopics = allTopics.filter((t) => t.subjectId === sub.id);
    for (const t of subTopics) {
      const status: TopicStatus = progressMap[t.id]?.status ?? 'not_started';
      totalWeightedScore += STATUS_WEIGHTS[status] ?? 0;
    }
  }

  const percentage =
    totalTopics > 0
      ? Math.min(
          100,
          Math.max(0, Math.round((totalWeightedScore / totalTopics) * 100)),
        )
      : 0;

  return {
    totalTopics,
    completedTopics,
    inProgressTopics,
    needsRevisionTopics,
    notStartedTopics,
    percentage,
    subjects: subjectSummaries as Record<SubjectId, SubjectProgressSummary>,
  };
}

export function calculateStudyStreak(dates: string[]): {
  currentStreak: number;
  bestStreak: number;
} {
  const summary = calculateStreak(dates);
  return {
    currentStreak: summary.currentStreak,
    bestStreak: summary.bestStreak,
  };
}
