import { describe, it, expect } from 'vitest';
import {
  calculateRecurrenceSeverity,
  detectTopicHotspots,
  analyzeSubjectPatterns,
  generatePatternInsights,
} from './recurringMistakes';
import type { Mistake, SyllabusTopic } from './types';

const MOCK_TOPICS: Record<string, SyllabusTopic> = {
  'math-calc-limits': {
    id: 'math-calc-limits',
    subjectId: 'math',
    section: 'Calculus',
    chapter: 'Differential Calculus',
    name: 'Limits and Continuity',
    order: 1,
  },
  'physics-mech-newton': {
    id: 'physics-mech-newton',
    subjectId: 'physics',
    section: 'Mechanics',
    chapter: 'Newtonian Mechanics',
    name: "Newton's Laws of Motion",
    order: 2,
  },
  'chem-org-hydrocarbons': {
    id: 'chem-org-hydrocarbons',
    subjectId: 'chemistry',
    section: 'Organic Chemistry',
    chapter: 'Hydrocarbons',
    name: 'Alkanes and Alkenes',
    order: 3,
  },
};

function createMistake(partial: Partial<Mistake>): Mistake {
  return {
    id: Math.floor(Math.random() * 10000),
    subjectId: partial.subjectId || 'math',
    topicId: partial.topicId || 'math-calc-limits',
    questionRef: partial.questionRef || 'DUET 2023 Q12',
    whatWentWrong: partial.whatWentWrong || 'Confused formula',
    correctSolution: partial.correctSolution || 'Use LHopital rule',
    type: partial.type || 'conceptual',
    status: partial.status || 'unresolved',
    createdAt: partial.createdAt || '2026-10-01T10:00:00Z',
    ...partial,
  };
}

describe('recurringMistakes domain', () => {
  describe('calculateRecurrenceSeverity', () => {
    it('returns high when total >= 3', () => {
      expect(calculateRecurrenceSeverity(3, 1)).toBe('high');
      expect(calculateRecurrenceSeverity(5, 0)).toBe('high');
    });

    it('returns high when unresolved >= 2 even if total is 2', () => {
      expect(calculateRecurrenceSeverity(2, 2)).toBe('high');
    });

    it('returns medium when total >= 2 with less than 2 unresolved', () => {
      expect(calculateRecurrenceSeverity(2, 1)).toBe('medium');
      expect(calculateRecurrenceSeverity(2, 0)).toBe('medium');
    });

    it('returns low when total is below 2', () => {
      expect(calculateRecurrenceSeverity(1, 1)).toBe('low');
      expect(calculateRecurrenceSeverity(1, 0)).toBe('low');
      expect(calculateRecurrenceSeverity(0, 0)).toBe('low');
    });
  });

  describe('detectTopicHotspots', () => {
    it('returns empty array when mistakes array is empty or undefined', () => {
      expect(detectTopicHotspots([], MOCK_TOPICS)).toEqual([]);
      expect(detectTopicHotspots(undefined, MOCK_TOPICS)).toEqual([]);
    });

    it('filters out topics with fewer mistakes than minThreshold', () => {
      const mistakes: Mistake[] = [
        createMistake({ topicId: 'math-calc-limits' }),
        createMistake({ topicId: 'physics-mech-newton' }),
      ];

      const hotspots = detectTopicHotspots(mistakes, MOCK_TOPICS, 2);
      expect(hotspots).toHaveLength(0);
    });

    it('clusters mistakes by topic and computes counts and dominant mistake type', () => {
      const mistakes: Mistake[] = [
        createMistake({
          topicId: 'math-calc-limits',
          type: 'calculation',
          status: 'unresolved',
        }),
        createMistake({
          topicId: 'math-calc-limits',
          type: 'calculation',
          status: 'reviewing',
        }),
        createMistake({
          topicId: 'math-calc-limits',
          type: 'conceptual',
          status: 'fixed',
        }),
      ];

      const hotspots = detectTopicHotspots(mistakes, MOCK_TOPICS, 2);
      expect(hotspots).toHaveLength(1);

      const h = hotspots[0];
      expect(h.topicId).toBe('math-calc-limits');
      expect(h.topicName).toBe('Limits and Continuity');
      expect(h.subjectId).toBe('math');
      expect(h.totalMistakes).toBe(3);
      expect(h.unresolvedCount).toBe(1);
      expect(h.reviewingCount).toBe(1);
      expect(h.fixedCount).toBe(1);
      expect(h.dominantType).toBe('calculation');
      expect(h.typeBreakdown.calculation).toBe(2);
      expect(h.typeBreakdown.conceptual).toBe(1);
      expect(h.severity).toBe('high');
      expect(h.unresolvedRatio).toBe(0.33);
    });

    it('resolves topic names when topicMap provides simple string names', () => {
      const stringMap = {
        'custom-topic-1': 'Matrix Inversion',
      };
      const mistakes: Mistake[] = [
        createMistake({ topicId: 'custom-topic-1' }),
        createMistake({ topicId: 'custom-topic-1' }),
      ];

      const hotspots = detectTopicHotspots(mistakes, stringMap, 2);
      expect(hotspots[0].topicName).toBe('Matrix Inversion');
    });

    it('falls back to topicId if topic is not found in topicMap', () => {
      const mistakes: Mistake[] = [
        createMistake({ topicId: 'unmapped-topic' }),
        createMistake({ topicId: 'unmapped-topic' }),
      ];

      const hotspots = detectTopicHotspots(mistakes, {}, 2);
      expect(hotspots[0].topicName).toBe('unmapped-topic');
    });

    it('orders hotspots by severity descending, then totalMistakes, then unresolvedCount', () => {
      const mistakes: Mistake[] = [
        // Topic A: 2 mistakes, 1 unresolved => medium severity
        createMistake({ topicId: 'topic-a', status: 'unresolved' }),
        createMistake({ topicId: 'topic-a', status: 'fixed' }),

        // Topic B: 4 mistakes, 3 unresolved => high severity, 4 total
        createMistake({ topicId: 'topic-b', status: 'unresolved' }),
        createMistake({ topicId: 'topic-b', status: 'unresolved' }),
        createMistake({ topicId: 'topic-b', status: 'unresolved' }),
        createMistake({ topicId: 'topic-b', status: 'fixed' }),

        // Topic C: 3 mistakes, 2 unresolved => high severity, 3 total
        createMistake({ topicId: 'topic-c', status: 'unresolved' }),
        createMistake({ topicId: 'topic-c', status: 'unresolved' }),
        createMistake({ topicId: 'topic-c', status: 'fixed' }),
      ];

      const hotspots = detectTopicHotspots(mistakes, {}, 2);
      expect(hotspots).toHaveLength(3);
      expect(hotspots[0].topicId).toBe('topic-b'); // high, 4 mistakes
      expect(hotspots[1].topicId).toBe('topic-c'); // high, 3 mistakes
      expect(hotspots[2].topicId).toBe('topic-a'); // medium, 2 mistakes
    });
  });

  describe('analyzeSubjectPatterns', () => {
    it('returns all 5 subjects with zeroes when mistakes is empty', () => {
      const result = analyzeSubjectPatterns([]);
      expect(result).toHaveLength(5);
      expect(result.map((s) => s.subjectId)).toEqual([
        'math',
        'physics',
        'chemistry',
        'english',
        'cse',
      ]);
      expect(result.every((s) => s.totalMistakes === 0)).toBe(true);
      expect(result.every((s) => s.topMistakeType === null)).toBe(true);
    });

    it('aggregates mistake types and hotspot counts per subject', () => {
      const mistakes: Mistake[] = [
        createMistake({ subjectId: 'math', type: 'calculation' }),
        createMistake({ subjectId: 'math', type: 'calculation' }),
        createMistake({ subjectId: 'math', type: 'formula' }),
        createMistake({ subjectId: 'physics', type: 'conceptual' }),
      ];

      const mockHotspots = [
        {
          topicId: 'math-1',
          topicName: 'Algebra',
          subjectId: 'math' as const,
          totalMistakes: 3,
          unresolvedCount: 2,
          reviewingCount: 0,
          fixedCount: 1,
          dominantType: 'calculation' as const,
          typeBreakdown: {
            calculation: 2,
            formula: 1,
            conceptual: 0,
            careless: 0,
            misreading: 0,
            time_management: 0,
          },
          severity: 'high' as const,
          unresolvedRatio: 0.67,
        },
      ];

      const patterns = analyzeSubjectPatterns(mistakes, mockHotspots);
      const mathPattern = patterns.find((p) => p.subjectId === 'math')!;
      expect(mathPattern.totalMistakes).toBe(3);
      expect(mathPattern.topMistakeType).toBe('calculation');
      expect(mathPattern.typeCounts.calculation).toBe(2);
      expect(mathPattern.typeCounts.formula).toBe(1);
      expect(mathPattern.hotspotCount).toBe(1);

      const physPattern = patterns.find((p) => p.subjectId === 'physics')!;
      expect(physPattern.totalMistakes).toBe(1);
      expect(physPattern.topMistakeType).toBe('conceptual');
      expect(physPattern.hotspotCount).toBe(0);
    });
  });

  describe('generatePatternInsights', () => {
    it('returns empty array when mistakes is empty', () => {
      expect(generatePatternInsights([], MOCK_TOPICS)).toEqual([]);
    });

    it('emits chronic bottleneck warning when high severity hotspot has >= 2 unresolved mistakes', () => {
      const mistakes: Mistake[] = [
        createMistake({
          topicId: 'physics-mech-newton',
          subjectId: 'physics',
          type: 'conceptual',
          status: 'unresolved',
        }),
        createMistake({
          topicId: 'physics-mech-newton',
          subjectId: 'physics',
          type: 'conceptual',
          status: 'unresolved',
        }),
        createMistake({
          topicId: 'physics-mech-newton',
          subjectId: 'physics',
          type: 'conceptual',
          status: 'unresolved',
        }),
      ];

      const insights = generatePatternInsights(mistakes, MOCK_TOPICS);
      const chronic = insights.find((i) => i.type === 'chronic_topic');
      expect(chronic).toBeDefined();
      expect(chronic?.title).toContain("Newton's Laws of Motion");
      expect(chronic?.severity).toBe('warning');
    });

    it('emits dominant error category insight when a type is >= 35% and >= 3 mistakes', () => {
      const mistakes: Mistake[] = [
        createMistake({ type: 'calculation' }),
        createMistake({ type: 'calculation' }),
        createMistake({ type: 'calculation' }),
        createMistake({ type: 'conceptual' }),
      ];

      const insights = generatePatternInsights(mistakes, MOCK_TOPICS);
      const dominant = insights.find((i) => i.type === 'dominant_type');
      expect(dominant).toBeDefined();
      expect(dominant?.title).toContain('Calculation');
      expect(dominant?.count).toBe(3);
    });

    it('emits cross-subject calculation slips insight when >= 2 subjects have >= 2 calculation errors', () => {
      const mistakes: Mistake[] = [
        createMistake({ subjectId: 'math', type: 'calculation' }),
        createMistake({ subjectId: 'math', type: 'calculation' }),
        createMistake({ subjectId: 'physics', type: 'calculation' }),
        createMistake({ subjectId: 'physics', type: 'calculation' }),
      ];

      const insights = generatePatternInsights(mistakes, MOCK_TOPICS);
      const crossSubject = insights.find((i) => i.type === 'cross_subject_pattern');
      expect(crossSubject).toBeDefined();
      expect(crossSubject?.title).toContain('MATH & PHYSICS');
      expect(crossSubject?.count).toBe(4);
    });

    it('emits mastery progress signal when a hotspot has >= 2 fixed mistakes and 0 unresolved', () => {
      const mistakes: Mistake[] = [
        createMistake({
          topicId: 'chem-org-hydrocarbons',
          subjectId: 'chemistry',
          status: 'fixed',
        }),
        createMistake({
          topicId: 'chem-org-hydrocarbons',
          subjectId: 'chemistry',
          status: 'fixed',
        }),
      ];

      const insights = generatePatternInsights(mistakes, MOCK_TOPICS);
      const mastery = insights.find((i) => i.type === 'mastery_progress');
      expect(mastery).toBeDefined();
      expect(mastery?.severity).toBe('positive');
      expect(mastery?.title).toContain('Alkanes and Alkenes');
    });
  });
});

