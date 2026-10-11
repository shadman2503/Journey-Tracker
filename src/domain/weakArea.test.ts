import { describe, it, expect } from 'vitest';
import {
  calculateTopicWeaknessScore,
  detectWeakAreas,
  getWeakAreaSummary,
  filterWeakAreas,
} from './weakArea';
import type {
  SyllabusTopic,
  TopicProgress,
  StudySession,
  Mistake,
} from './types';

const MOCK_TOPIC_1: SyllabusTopic = {
  id: 'physics-mech-newton',
  subjectId: 'physics',
  section: 'Mechanics',
  chapter: 'Newtonian Mechanics',
  name: "Newton's Laws of Motion",
  order: 1,
};

const MOCK_TOPIC_2: SyllabusTopic = {
  id: 'math-calc-integration',
  subjectId: 'math',
  section: 'Calculus',
  chapter: 'Integral Calculus',
  name: 'Definite Integrals',
  order: 2,
};

const MOCK_TOPIC_3: SyllabusTopic = {
  id: 'chem-org-benzene',
  subjectId: 'chemistry',
  section: 'Organic Chemistry',
  chapter: 'Aromatic Compounds',
  name: 'Benzene and Derivatives',
  order: 3,
};

describe('weakArea domain logic', () => {
  const refDate = new Date('2026-10-15T12:00:00Z');

  describe('calculateTopicWeaknessScore', () => {
    it('returns score 0 and healthy urgency for a clean unstudied topic', () => {
      const result = calculateTopicWeaknessScore(
        MOCK_TOPIC_1,
        undefined,
        [],
        [],
        refDate,
      );

      expect(result.score).toBe(0);
      expect(result.urgency).toBe('healthy');
      expect(result.signals).toHaveLength(0);
      expect(result.accuracy).toBeNull();
      expect(result.daysSinceLastStudied).toBeNull();
    });

    it('penalizes topic with needs_revision status (+30 pts)', () => {
      const progress: TopicProgress = {
        topicId: MOCK_TOPIC_1.id,
        status: 'needs_revision',
        updatedAt: '2026-10-01T10:00:00Z',
      };

      const result = calculateTopicWeaknessScore(
        MOCK_TOPIC_1,
        progress,
        [],
        [],
        refDate,
      );

      expect(result.score).toBe(30);
      expect(result.urgency).toBe('minor');
      expect(result.signals).toContain('needs_revision_status');
      expect(result.primaryReason).toBe('Flagged as Needs Revision');
    });

    it('penalizes low practice accuracy (< 50% adds 35 pts)', () => {
      const session: StudySession = {
        id: 1,
        date: '2026-10-14',
        subjectId: 'physics',
        topicId: MOCK_TOPIC_1.id,
        durationMinutes: 45,
        questionsSolved: 10,
        correctAnswers: 4, // 40% accuracy
        createdAt: '2026-10-14T10:00:00Z',
      };

      const result = calculateTopicWeaknessScore(
        MOCK_TOPIC_1,
        undefined,
        [session],
        [],
        refDate,
      );

      expect(result.accuracy).toBe(40);
      expect(result.score).toBe(35);
      expect(result.signals).toContain('low_accuracy');
      expect(result.primaryReason).toContain('Low practice accuracy (40%)');
    });

    it('penalizes unresolved mistakes and repeated mistake recurrence bonus', () => {
      const mistakes: Mistake[] = [
        {
          id: 101,
          subjectId: 'physics',
          topicId: MOCK_TOPIC_1.id,
          questionRef: 'Q1',
          whatWentWrong: 'Sign slip',
          correctSolution: 'Correct formula',
          type: 'calculation',
          status: 'unresolved',
          createdAt: '2026-10-10T10:00:00Z',
        },
        {
          id: 102,
          subjectId: 'physics',
          topicId: MOCK_TOPIC_1.id,
          questionRef: 'Q2',
          whatWentWrong: 'Theory slip',
          correctSolution: 'Correct law',
          type: 'conceptual',
          status: 'unresolved',
          createdAt: '2026-10-11T10:00:00Z',
        },
      ];

      // 2 unresolved * 15 = 30 pts + repeated bonus 20 = 50 pts
      const result = calculateTopicWeaknessScore(
        MOCK_TOPIC_1,
        undefined,
        [],
        mistakes,
        refDate,
      );

      expect(result.unresolvedMistakes).toBe(2);
      expect(result.totalMistakes).toBe(2);
      expect(result.score).toBe(50);
      expect(result.urgency).toBe('moderate');
      expect(result.signals).toContain('unresolved_mistakes');
      expect(result.signals).toContain('repeated_mistakes');
      expect(result.primaryReason).toContain('2 unresolved mistakes');
    });

    it('penalizes revision recency decay (> 30 days inactive adds 20 pts)', () => {
      const progress: TopicProgress = {
        topicId: MOCK_TOPIC_1.id,
        status: 'practicing',
        lastStudiedAt: '2026-08-01T10:00:00Z', // > 70 days ago
        updatedAt: '2026-08-01T10:00:00Z',
      };

      const result = calculateTopicWeaknessScore(
        MOCK_TOPIC_1,
        progress,
        [],
        [],
        refDate,
      );

      expect(result.daysSinceLastStudied).toBeGreaterThan(30);
      expect(result.score).toBe(20);
      expect(result.signals).toContain('revision_overdue');
    });

    it('compounds multiple negative signals to trigger critical urgency (score >= 70)', () => {
      const progress: TopicProgress = {
        topicId: MOCK_TOPIC_1.id,
        status: 'needs_revision', // +30
        lastStudiedAt: '2026-09-01T10:00:00Z', // > 30 days = +20
        updatedAt: '2026-09-01T10:00:00Z',
      };

      const session: StudySession = {
        id: 1,
        date: '2026-09-01',
        subjectId: 'physics',
        topicId: MOCK_TOPIC_1.id,
        durationMinutes: 60,
        questionsSolved: 12,
        correctAnswers: 4, // 33% accuracy = +35
        createdAt: '2026-09-01T10:00:00Z',
      };

      const mistake: Mistake = {
        id: 1,
        subjectId: 'physics',
        topicId: MOCK_TOPIC_1.id,
        questionRef: 'Q1',
        whatWentWrong: 'Theoretical confusion',
        correctSolution: 'Newton third law',
        type: 'conceptual',
        status: 'unresolved', // +15
        createdAt: '2026-09-01T10:00:00Z',
      };

      // 30 + 20 + 35 + 15 = 100 max
      const result = calculateTopicWeaknessScore(
        MOCK_TOPIC_1,
        progress,
        [session],
        [mistake],
        refDate,
      );

      expect(result.score).toBe(100);
      expect(result.urgency).toBe('critical');
      expect(result.signals).toContain('needs_revision_status');
      expect(result.signals).toContain('low_accuracy');
      expect(result.signals).toContain('revision_overdue');
      expect(result.signals).toContain('unresolved_mistakes');
    });

    it('discounts high practice accuracy and strong mastery', () => {
      const progress: TopicProgress = {
        topicId: MOCK_TOPIC_1.id,
        status: 'strong', // -20
        lastStudiedAt: '2026-10-14T10:00:00Z',
        updatedAt: '2026-10-14T10:00:00Z',
      };

      const session: StudySession = {
        id: 1,
        date: '2026-10-14',
        subjectId: 'physics',
        topicId: MOCK_TOPIC_1.id,
        durationMinutes: 40,
        questionsSolved: 20,
        correctAnswers: 19, // 95% accuracy => -15
        createdAt: '2026-10-14T10:00:00Z',
      };

      const result = calculateTopicWeaknessScore(
        MOCK_TOPIC_1,
        progress,
        [session],
        [],
        refDate,
      );

      expect(result.score).toBe(0);
      expect(result.urgency).toBe('healthy');
    });
  });

  describe('detectWeakAreas', () => {
    it('returns empty array when topics array is empty', () => {
      expect(detectWeakAreas([], {}, [], [])).toEqual([]);
    });

    it('filters out healthy topics and ranks critical weak topics first', () => {
      const topics = [MOCK_TOPIC_1, MOCK_TOPIC_2, MOCK_TOPIC_3];

      // Topic 1: Needs revision + 2 unresolved mistakes => critical
      const progressMap: Record<string, TopicProgress> = {
        [MOCK_TOPIC_1.id]: {
          topicId: MOCK_TOPIC_1.id,
          status: 'needs_revision',
          updatedAt: '2026-10-01T10:00:00Z',
        },
      };

      const mistakes: Mistake[] = [
        {
          id: 1,
          subjectId: 'physics',
          topicId: MOCK_TOPIC_1.id,
          questionRef: 'P1',
          whatWentWrong: 'Sign error',
          correctSolution: 'Sol',
          type: 'calculation',
          status: 'unresolved',
          createdAt: '2026-10-01T10:00:00Z',
        },
        {
          id: 2,
          subjectId: 'physics',
          topicId: MOCK_TOPIC_1.id,
          questionRef: 'P2',
          whatWentWrong: 'Formula error',
          correctSolution: 'Sol',
          type: 'formula',
          status: 'unresolved',
          createdAt: '2026-10-02T10:00:00Z',
        },
        // Topic 2: 1 unresolved mistake (15 pts) + low accuracy session (20 pts) => 35 pts (minor)
        {
          id: 3,
          subjectId: 'math',
          topicId: MOCK_TOPIC_2.id,
          questionRef: 'M1',
          whatWentWrong: 'Formula slip',
          correctSolution: 'Sol',
          type: 'formula',
          status: 'unresolved',
          createdAt: '2026-10-05T10:00:00Z',
        },
      ];

      const sessions: StudySession[] = [
        {
          id: 201,
          date: '2026-10-10',
          subjectId: 'math',
          topicId: MOCK_TOPIC_2.id,
          durationMinutes: 30,
          questionsSolved: 10,
          correctAnswers: 6, // 60% accuracy => +20
          createdAt: '2026-10-10T10:00:00Z',
        },
      ];

      // Topic 3: Unstudied, score 0 (filtered out by minScoreThreshold = 20)

      const weakAreas = detectWeakAreas(
        topics,
        progressMap,
        sessions,
        mistakes,
        refDate,
        20,
      );

      expect(weakAreas).toHaveLength(2);
      expect(weakAreas[0].topicId).toBe(MOCK_TOPIC_1.id);
      expect(weakAreas[0].urgency).toBe('critical');

      expect(weakAreas[1].topicId).toBe(MOCK_TOPIC_2.id);
      expect(weakAreas[1].urgency).toBe('minor');
    });
  });

  describe('getWeakAreaSummary', () => {
    it('aggregates summary stats across urgency categories and subjects', () => {
      const mockWeakList = [
        {
          topicId: 'p1',
          topicName: 'Topic P1',
          subjectId: 'physics' as const,
          section: 'Sec',
          chapter: 'Ch',
          score: 85,
          urgency: 'critical' as const,
          primaryReason: 'Reason',
          signals: ['unresolved_mistakes' as const],
          accuracy: 40,
          questionsAttempted: 10,
          unresolvedMistakes: 2,
          totalMistakes: 2,
          daysSinceLastStudied: 10,
          status: 'practicing' as const,
        },
        {
          topicId: 'm1',
          topicName: 'Topic M1',
          subjectId: 'math' as const,
          section: 'Sec',
          chapter: 'Ch',
          score: 55,
          urgency: 'moderate' as const,
          primaryReason: 'Reason',
          signals: ['low_accuracy' as const],
          accuracy: 50,
          questionsAttempted: 8,
          unresolvedMistakes: 0,
          totalMistakes: 0,
          daysSinceLastStudied: 5,
          status: 'learning' as const,
        },
      ];

      const summary = getWeakAreaSummary(mockWeakList);
      expect(summary.totalWeakTopics).toBe(2);
      expect(summary.criticalCount).toBe(1);
      expect(summary.moderateCount).toBe(1);
      expect(summary.minorCount).toBe(0);
      expect(summary.bySubject.physics).toBe(1);
      expect(summary.bySubject.math).toBe(1);
      expect(summary.topWeakTopics).toHaveLength(2);
    });
  });

  describe('filterWeakAreas', () => {
    const mockWeakList = [
      {
        topicId: 'p1',
        topicName: 'Newtonian Dynamics',
        subjectId: 'physics' as const,
        section: 'Mechanics',
        chapter: 'Forces',
        score: 80,
        urgency: 'critical' as const,
        primaryReason: 'Low accuracy in practice',
        signals: ['low_accuracy' as const],
        accuracy: 40,
        questionsAttempted: 10,
        unresolvedMistakes: 2,
        totalMistakes: 2,
        daysSinceLastStudied: 10,
        status: 'practicing' as const,
      },
      {
        topicId: 'm1',
        topicName: 'Definite Integrals',
        subjectId: 'math' as const,
        section: 'Calculus',
        chapter: 'Integration',
        score: 50,
        urgency: 'moderate' as const,
        primaryReason: 'Revision overdue',
        signals: ['revision_overdue' as const],
        accuracy: 70,
        questionsAttempted: 10,
        unresolvedMistakes: 0,
        totalMistakes: 0,
        daysSinceLastStudied: 20,
        status: 'practicing' as const,
      },
    ];

    it('filters by subject', () => {
      const filtered = filterWeakAreas(mockWeakList, { subjectId: 'math' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].topicId).toBe('m1');
    });

    it('filters by urgency', () => {
      const filtered = filterWeakAreas(mockWeakList, { urgency: 'critical' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].topicId).toBe('p1');
    });

    it('filters by search query', () => {
      const filtered = filterWeakAreas(mockWeakList, {
        searchQuery: 'integrals',
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].topicId).toBe('m1');
    });
  });
});

