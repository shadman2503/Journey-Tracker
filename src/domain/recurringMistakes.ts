import type { SubjectId, MistakeType, Mistake, SyllabusTopic } from './types';
import { ALL_MISTAKE_TYPES, MISTAKE_TYPE_CONFIG } from './mistake';

export type RecurrenceSeverity = 'high' | 'medium' | 'low';

export interface TopicMistakeHotspot {
  topicId: string;
  topicName: string;
  subjectId: SubjectId;
  totalMistakes: number;
  unresolvedCount: number;
  reviewingCount: number;
  fixedCount: number;
  dominantType: MistakeType;
  typeBreakdown: Record<MistakeType, number>;
  severity: RecurrenceSeverity;
  unresolvedRatio: number;
}

export type PatternInsightType =
  | 'dominant_type'
  | 'chronic_topic'
  | 'cross_subject_pattern'
  | 'mastery_progress';

export interface PatternInsight {
  id: string;
  type: PatternInsightType;
  title: string;
  description: string;
  severity: 'warning' | 'info' | 'positive';
  subjectId?: SubjectId;
  topicId?: string;
  mistakeType?: MistakeType;
  count: number;
}

export interface SubjectPatternSummary {
  subjectId: SubjectId;
  totalMistakes: number;
  topMistakeType: MistakeType | null;
  typeCounts: Record<MistakeType, number>;
  hotspotCount: number;
}

const ALL_SUBJECTS: SubjectId[] = ['math', 'physics', 'chemistry', 'english', 'cse'];

/**
 * Calculates recurrence severity based on total mistakes and unresolved count.
 */
export function calculateRecurrenceSeverity(
  total: number,
  unresolved: number,
): RecurrenceSeverity {
  if (total >= 3 || unresolved >= 2) {
    return 'high';
  }
  if (total >= 2) {
    return 'medium';
  }
  return 'low';
}

const SEVERITY_WEIGHT: Record<RecurrenceSeverity, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Detects recurring mistake hotspots grouped by syllabus topic.
 * Filters topics that meet or exceed minThreshold (default 2 mistakes).
 */
export function detectTopicHotspots(
  mistakes: Mistake[] = [],
  topicMap: Record<string, SyllabusTopic | string> = {},
  minThreshold = 2,
): TopicMistakeHotspot[] {
  if (!mistakes || mistakes.length === 0) {
    return [];
  }

  // Group mistakes by topicId
  const groups: Record<string, Mistake[]> = {};
  for (const m of mistakes) {
    if (!m.topicId) continue;
    if (!groups[m.topicId]) {
      groups[m.topicId] = [];
    }
    groups[m.topicId].push(m);
  }

  const hotspots: TopicMistakeHotspot[] = [];

  for (const [topicId, topicMistakes] of Object.entries(groups)) {
    if (topicMistakes.length < minThreshold) {
      continue;
    }

    const totalMistakes = topicMistakes.length;
    let unresolvedCount = 0;
    let reviewingCount = 0;
    let fixedCount = 0;

    const typeBreakdown: Record<MistakeType, number> = {
      conceptual: 0,
      calculation: 0,
      formula: 0,
      careless: 0,
      misreading: 0,
      time_management: 0,
    };

    for (const m of topicMistakes) {
      if (m.status === 'fixed') {
        fixedCount += 1;
      } else if (m.status === 'reviewing') {
        reviewingCount += 1;
      } else {
        unresolvedCount += 1;
      }

      if (m.type && typeBreakdown[m.type] !== undefined) {
        typeBreakdown[m.type] += 1;
      }
    }

    // Determine dominant mistake type
    let dominantType: MistakeType = 'conceptual';
    let maxTypeCount = -1;

    for (const type of ALL_MISTAKE_TYPES) {
      const count = typeBreakdown[type];
      if (count > maxTypeCount) {
        maxTypeCount = count;
        dominantType = type;
      }
    }

    // Resolve topic name and subject
    const topicEntry = topicMap[topicId];
    let topicName = topicId;
    let subjectId: SubjectId = topicMistakes[0]?.subjectId || 'math';

    if (topicEntry) {
      if (typeof topicEntry === 'string') {
        topicName = topicEntry;
      } else {
        topicName = topicEntry.name;
        subjectId = topicEntry.subjectId;
      }
    }

    const severity = calculateRecurrenceSeverity(totalMistakes, unresolvedCount);
    const unresolvedRatio =
      totalMistakes > 0
        ? Math.round((unresolvedCount / totalMistakes) * 100) / 100
        : 0;

    hotspots.push({
      topicId,
      topicName,
      subjectId,
      totalMistakes,
      unresolvedCount,
      reviewingCount,
      fixedCount,
      dominantType,
      typeBreakdown,
      severity,
      unresolvedRatio,
    });
  }

  // Sort hotspots by severity desc, then totalMistakes desc, then unresolvedCount desc, then topicName
  return hotspots.sort((a, b) => {
    const sevDiff = SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity];
    if (sevDiff !== 0) return sevDiff;

    const totalDiff = b.totalMistakes - a.totalMistakes;
    if (totalDiff !== 0) return totalDiff;

    const unresDiff = b.unresolvedCount - a.unresolvedCount;
    if (unresDiff !== 0) return unresDiff;

    return a.topicName.localeCompare(b.topicName);
  });
}

/**
 * Analyzes mistake distributions and hotspot frequencies across all DUET subjects.
 */
export function analyzeSubjectPatterns(
  mistakes: Mistake[] = [],
  hotspots: TopicMistakeHotspot[] = [],
): SubjectPatternSummary[] {
  const summaries: SubjectPatternSummary[] = [];

  for (const subjectId of ALL_SUBJECTS) {
    const subjectMistakes = mistakes.filter((m) => m.subjectId === subjectId);
    const typeCounts: Record<MistakeType, number> = {
      conceptual: 0,
      calculation: 0,
      formula: 0,
      careless: 0,
      misreading: 0,
      time_management: 0,
    };

    for (const m of subjectMistakes) {
      if (m.type && typeCounts[m.type] !== undefined) {
        typeCounts[m.type] += 1;
      }
    }

    let topMistakeType: MistakeType | null = null;
    let maxCount = 0;

    for (const type of ALL_MISTAKE_TYPES) {
      if (typeCounts[type] > maxCount) {
        maxCount = typeCounts[type];
        topMistakeType = type;
      }
    }

    const hotspotCount = hotspots.filter((h) => h.subjectId === subjectId).length;

    summaries.push({
      subjectId,
      totalMistakes: subjectMistakes.length,
      topMistakeType,
      typeCounts,
      hotspotCount,
    });
  }

  return summaries;
}

/**
 * Generates prioritized actionable diagnostic insights based on detected patterns.
 */
export function generatePatternInsights(
  mistakes: Mistake[] = [],
  topicMap: Record<string, SyllabusTopic | string> = {},
  providedHotspots?: TopicMistakeHotspot[],
): PatternInsight[] {
  if (!mistakes || mistakes.length === 0) {
    return [];
  }

  const hotspots = providedHotspots || detectTopicHotspots(mistakes, topicMap, 2);
  const insights: PatternInsight[] = [];

  // 1. High-severity chronic topic warnings
  const topChronic = hotspots.find((h) => h.severity === 'high' && h.unresolvedCount >= 2);
  if (topChronic) {
    const typeLabel = MISTAKE_TYPE_CONFIG[topChronic.dominantType]?.label || topChronic.dominantType;
    insights.push({
      id: `chronic-hotspot-${topChronic.topicId}`,
      type: 'chronic_topic',
      title: `Chronic Bottleneck: ${topChronic.topicName}`,
      description: `${topChronic.totalMistakes} mistakes recorded with ${topChronic.unresolvedCount} still unresolved. Primary pattern: ${typeLabel}. Focus revision on foundational concepts here.`,
      severity: 'warning',
      subjectId: topChronic.subjectId,
      topicId: topChronic.topicId,
      mistakeType: topChronic.dominantType,
      count: topChronic.totalMistakes,
    });
  }

  // 2. Global dominant mistake type pattern
  const totalMistakes = mistakes.length;
  const globalTypeCounts: Record<MistakeType, number> = {
    conceptual: 0,
    calculation: 0,
    formula: 0,
    careless: 0,
    misreading: 0,
    time_management: 0,
  };

  for (const m of mistakes) {
    if (m.type && globalTypeCounts[m.type] !== undefined) {
      globalTypeCounts[m.type] += 1;
    }
  }

  let highestType: MistakeType = 'conceptual';
  let highestTypeCount = 0;

  for (const type of ALL_MISTAKE_TYPES) {
    if (globalTypeCounts[type] > highestTypeCount) {
      highestTypeCount = globalTypeCounts[type];
      highestType = type;
    }
  }

  if (highestTypeCount >= 3 && highestTypeCount / totalMistakes >= 0.35) {
    const percentage = Math.round((highestTypeCount / totalMistakes) * 100);
    const typeMeta = MISTAKE_TYPE_CONFIG[highestType];
    insights.push({
      id: `dominant-type-${highestType}`,
      type: 'dominant_type',
      title: `Frequent ${typeMeta.label}s (${percentage}% of errors)`,
      description: `${highestTypeCount} of your ${totalMistakes} mistakes stem from ${typeMeta.label.toLowerCase()}s. Review problem-solving steps deliberately before writing final answers.`,
      severity: highestType === 'conceptual' || highestType === 'formula' ? 'warning' : 'info',
      mistakeType: highestType,
      count: highestTypeCount,
    });
  }

  // 3. Cross-subject error habit (e.g. calculation errors across multiple STEM subjects)
  const subjectBreakdown = analyzeSubjectPatterns(mistakes, hotspots);
  const subjectsWithCalculation = subjectBreakdown.filter(
    (s) => s.typeCounts.calculation >= 2,
  );
  if (subjectsWithCalculation.length >= 2) {
    const subjectNames = subjectsWithCalculation
      .map((s) => s.subjectId.toUpperCase())
      .join(' & ');
    const totalCalc = subjectsWithCalculation.reduce(
      (sum, s) => sum + s.typeCounts.calculation,
      0,
    );
    insights.push({
      id: 'cross-subject-calculation',
      type: 'cross_subject_pattern',
      title: `Cross-Subject Calculation Slips in ${subjectNames}`,
      description: `${totalCalc} calculation slips recorded across ${subjectNames}. Slowing down on multi-step algebra and arithmetic will immediately boost your test score.`,
      severity: 'info',
      mistakeType: 'calculation',
      count: totalCalc,
    });
  }

  // 4. Positive mastery progress signal
  const masteredHotspot = hotspots.find((h) => h.fixedCount >= 2 && h.unresolvedCount === 0);
  if (masteredHotspot) {
    insights.push({
      id: `mastered-hotspot-${masteredHotspot.topicId}`,
      type: 'mastery_progress',
      title: `Mastery Signal: ${masteredHotspot.topicName}`,
      description: `All ${masteredHotspot.fixedCount} recurring mistakes in this topic have been successfully fixed and resolved through active review!`,
      severity: 'positive',
      subjectId: masteredHotspot.subjectId,
      topicId: masteredHotspot.topicId,
      count: masteredHotspot.fixedCount,
    });
  }

  return insights;
}

