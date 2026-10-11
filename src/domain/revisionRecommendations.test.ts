import { describe, it, expect } from 'vitest';
import type {
  SyllabusTopic,
  TopicProgress,
  StudySession,
  Mistake,
} from './types';
import {
  generateRevisionRecommendations,
  getRevisionRecommendationSummary,
  filterRevisionRecommendations,
  type RevisionRecommendation,
} from './revisionRecommendations';

describe('revisionRecommendations domain logic', () => {
  const sampleTopics: SyllabusTopic[] = [
    {
      id: 'math-calc-01',
      subjectId: 'math',
      section: 'Calculus',
      chapter: 'Differential Calculus',
      name: 'Limits & Continuity',
      order: 1,
    },
    {
      id: 'math-alg-01',
      subjectId: 'math',
      section: 'Algebra',
      chapter: 'Complex Numbers',
      name: 'Complex Numbers & De Moivre',
      order: 2,
    },
    {
      id: 'phy-mech-01',
      subjectId: 'physics',
      section: 'Mechanics',
      chapter: 'Dynamics',
      name: 'Newtonian Mechanics',
      order: 3,
    },
    {
      id: 'cse-ds-01',
      subjectId: 'cse',
      section: 'Data Structures',
      chapter: 'Trees',
      name: 'Binary Search Trees',
      order: 4,
    },
  ];

  const now = new Date('2026-10-15T12:00:00.000Z');

  it('returns empty array when there is no progress or activity', () => {
    const recommendations = generateRevisionRecommendations(
      sampleTopics,
      {},
      [],
      [],
      now
    );
    expect(recommendations).toEqual([]);
  });

  it('generates a critical drill recommendation for topic with low accuracy and high weakness', () => {
    const progressMap: Record<string, TopicProgress> = {
      'math-calc-01': {
        topicId: 'math-calc-01',
        status: 'learning',
        lastStudiedAt: '2026-10-12T10:00:00.000Z',
        updatedAt: '2026-10-12T10:00:00.000Z',
      },
    };
    const sessions: StudySession[] = [
      {
        id: 1,
        date: '2026-10-12',
        subjectId: 'math',
        topicId: 'math-calc-01',
        durationMinutes: 45,
        questionsSolved: 20,
        correctAnswers: 7, // 35% accuracy
        createdAt: '2026-10-12T10:00:00.000Z',
      },
    ];

    const recommendations = generateRevisionRecommendations(
      sampleTopics,
      progressMap,
      sessions,
      [],
      now
    );

    expect(recommendations.length).toBe(1);
    expect(recommendations[0].type).toBe('critical_drill');
    expect(recommendations[0].priority).toBe('urgent');
    expect(recommendations[0].suggestedDurationMinutes).toBe(45);
    expect(recommendations[0].suggestedAction).toBe('practice');
    expect(recommendations[0].rationale).toContain('35%');
  });

  it('generates a critical drill for topic marked as needs_revision', () => {
    const progressMap: Record<string, TopicProgress> = {
      'math-alg-01': {
        topicId: 'math-alg-01',
        status: 'needs_revision',
        updatedAt: '2026-10-10T00:00:00.000Z',
      },
    };

    const recommendations = generateRevisionRecommendations(
      sampleTopics,
      progressMap,
      [],
      [],
      now
    );

    expect(recommendations.length).toBe(1);
    expect(recommendations[0].type).toBe('critical_drill');
    expect(recommendations[0].priority).toBe('urgent');
    expect(recommendations[0].rationale).toContain('Needs Revision');
  });

  it('generates mistake drill recommendation for topic with unresolved mistakes', () => {
    const progressMap: Record<string, TopicProgress> = {
      'phy-mech-01': {
        topicId: 'phy-mech-01',
        status: 'strong',
        lastStudiedAt: '2026-10-14T00:00:00.000Z',
        updatedAt: '2026-10-14T00:00:00.000Z',
      },
    };
    const mistakes: Mistake[] = [
      {
        id: 101,
        subjectId: 'physics',
        topicId: 'phy-mech-01',
        questionRef: 'Q1',
        whatWentWrong: 'Forgot friction vector',
        correctSolution: 'Add mu * N in opposite direction',
        type: 'conceptual',
        status: 'unresolved',
        reviewDate: '2026-10-14',
        createdAt: '2026-10-14T00:00:00.000Z',
      },
      {
        id: 102,
        subjectId: 'physics',
        topicId: 'phy-mech-01',
        questionRef: 'Q2',
        whatWentWrong: 'Calculation slip in sine',
        correctSolution: 'sin(30) = 0.5',
        type: 'calculation',
        status: 'unresolved',
        reviewDate: '2026-10-14',
        createdAt: '2026-10-14T00:00:00.000Z',
      },
    ];

    const recommendations = generateRevisionRecommendations(
      sampleTopics,
      progressMap,
      [],
      mistakes,
      now
    );

    expect(recommendations.length).toBe(1);
    expect(recommendations[0].type).toBe('mistake_drill');
    expect(recommendations[0].suggestedAction).toBe('mistakes');
    expect(recommendations[0].unresolvedMistakes).toBe(2);
    expect(recommendations[0].rationale).toContain('2 unresolved errors');
  });

  it('generates spaced repetition intervals correctly (7d, 14d, 30d)', () => {
    // Topic A: 8 days ago (weekly refresher)
    // Topic B: 16 days ago (14-day reinforcement)
    // Topic C: 35 days ago (30-day overdue)
    const progressMap: Record<string, TopicProgress> = {
      'math-calc-01': {
        topicId: 'math-calc-01',
        status: 'strong',
        lastStudiedAt: '2026-10-07T12:00:00.000Z', // 8 days ago
        updatedAt: '2026-10-07T12:00:00.000Z',
      },
      'math-alg-01': {
        topicId: 'math-alg-01',
        status: 'strong',
        lastStudiedAt: '2026-09-29T12:00:00.000Z', // 16 days ago
        updatedAt: '2026-09-29T12:00:00.000Z',
      },
      'phy-mech-01': {
        topicId: 'phy-mech-01',
        status: 'strong',
        lastStudiedAt: '2026-09-10T12:00:00.000Z', // 35 days ago
        updatedAt: '2026-09-10T12:00:00.000Z',
      },
    };

    const recommendations = generateRevisionRecommendations(
      sampleTopics,
      progressMap,
      [],
      [],
      now
    );

    expect(recommendations.length).toBe(3);

    // 35-day overdue should be ranked higher than 16-day and 8-day
    const overdue35 = recommendations.find((r) => r.topicId === 'phy-mech-01');
    expect(overdue35?.type).toBe('spaced_repetition');
    expect(overdue35?.priority).toBe('high');
    expect(overdue35?.suggestedDurationMinutes).toBe(40);
    expect(overdue35?.title).toContain('Overdue Spaced Review');

    const review14 = recommendations.find((r) => r.topicId === 'math-alg-01');
    expect(review14?.type).toBe('spaced_repetition');
    expect(review14?.priority).toBe('high');
    expect(review14?.suggestedDurationMinutes).toBe(30);

    const weekly7 = recommendations.find((r) => r.topicId === 'math-calc-01');
    expect(weekly7?.type).toBe('spaced_repetition');
    expect(weekly7?.priority).toBe('normal');
    expect(weekly7?.suggestedDurationMinutes).toBe(20);
  });

  it('generates stagnant_topic recommendation for learning topics stalled > 14 days', () => {
    const progressMap: Record<string, TopicProgress> = {
      'cse-ds-01': {
        topicId: 'cse-ds-01',
        status: 'learning',
        lastStudiedAt: '2026-09-25T12:00:00.000Z', // 20 days ago
        updatedAt: '2026-09-25T12:00:00.000Z',
      },
    };

    const recommendations = generateRevisionRecommendations(
      sampleTopics,
      progressMap,
      [],
      [],
      now
    );

    expect(recommendations.length).toBe(1);
    expect(recommendations[0].type).toBe('stagnant_topic');
    expect(recommendations[0].title).toContain('Resume Topic');
    expect(recommendations[0].rationale).toContain('Started learning but inactive');
  });

  it('caps recommendations when maxRecommendations is specified', () => {
    const progressMap: Record<string, TopicProgress> = {
      'math-calc-01': { topicId: 'math-calc-01', status: 'needs_revision', updatedAt: '2026-09-01T00:00:00Z' },
      'math-alg-01': { topicId: 'math-alg-01', status: 'needs_revision', updatedAt: '2026-09-01T00:00:00Z' },
      'phy-mech-01': { topicId: 'phy-mech-01', status: 'needs_revision', updatedAt: '2026-09-01T00:00:00Z' },
    };

    const recommendations = generateRevisionRecommendations(
      sampleTopics,
      progressMap,
      [],
      [],
      now,
      { maxRecommendations: 2 }
    );

    expect(recommendations.length).toBe(2);
  });

  it('computes accurate summary statistics with getRevisionRecommendationSummary', () => {
    const dummyRecs: RevisionRecommendation[] = [
      {
        id: '1',
        topicId: 'math-01',
        topicName: 'Limits',
        subjectId: 'math',
        section: 'Calc',
        chapter: 'Limits',
        type: 'critical_drill',
        priority: 'urgent',
        title: 'Urgent Drill',
        rationale: 'Reason 1',
        suggestedDurationMinutes: 45,
        suggestedAction: 'practice',
        score: 90,
        daysSinceLastStudied: 10,
        unresolvedMistakes: 2,
        accuracy: 40,
      },
      {
        id: '2',
        topicId: 'phy-01',
        topicName: 'Dynamics',
        subjectId: 'physics',
        section: 'Mech',
        chapter: 'Dynamics',
        type: 'spaced_repetition',
        priority: 'high',
        title: 'Spaced Review',
        rationale: 'Reason 2',
        suggestedDurationMinutes: 30,
        suggestedAction: 'practice',
        score: 60,
        daysSinceLastStudied: 15,
        unresolvedMistakes: 0,
        accuracy: 80,
      },
      {
        id: '3',
        topicId: 'math-02',
        topicName: 'Complex',
        subjectId: 'math',
        section: 'Algebra',
        chapter: 'Complex',
        type: 'mistake_drill',
        priority: 'normal',
        title: 'Mistake Drill',
        rationale: 'Reason 3',
        suggestedDurationMinutes: 20,
        suggestedAction: 'mistakes',
        score: 45,
        daysSinceLastStudied: 5,
        unresolvedMistakes: 1,
        accuracy: 70,
      },
    ];

    const summary = getRevisionRecommendationSummary(dummyRecs);

    expect(summary.totalRecommendations).toBe(3);
    expect(summary.urgentCount).toBe(1);
    expect(summary.highCount).toBe(1);
    expect(summary.normalCount).toBe(1);
    expect(summary.estimatedTotalMinutes).toBe(95);
    expect(summary.byType.critical_drill).toBe(1);
    expect(summary.byType.spaced_repetition).toBe(1);
    expect(summary.byType.mistake_drill).toBe(1);
    expect(summary.bySubject.math).toBe(2);
    expect(summary.bySubject.physics).toBe(1);
  });

  it('filters recommendations by subject, type, priority, and search query', () => {
    const dummyRecs: RevisionRecommendation[] = [
      {
        id: '1',
        topicId: 'math-01',
        topicName: 'Limits & Continuity',
        subjectId: 'math',
        section: 'Calc',
        chapter: 'Limits',
        type: 'critical_drill',
        priority: 'urgent',
        title: 'Urgent Drill: Limits',
        rationale: 'Low accuracy in calculus limits',
        suggestedDurationMinutes: 45,
        suggestedAction: 'practice',
        score: 90,
        daysSinceLastStudied: 10,
        unresolvedMistakes: 2,
        accuracy: 40,
      },
      {
        id: '2',
        topicId: 'phy-01',
        topicName: 'Newtonian Dynamics',
        subjectId: 'physics',
        section: 'Mech',
        chapter: 'Dynamics',
        type: 'spaced_repetition',
        priority: 'high',
        title: 'Spaced Review',
        rationale: 'Memory decay checkup',
        suggestedDurationMinutes: 30,
        suggestedAction: 'practice',
        score: 60,
        daysSinceLastStudied: 15,
        unresolvedMistakes: 0,
        accuracy: 80,
      },
    ];

    // Filter by subject
    const mathOnly = filterRevisionRecommendations(dummyRecs, { subjectId: 'math' });
    expect(mathOnly.length).toBe(1);
    expect(mathOnly[0].topicId).toBe('math-01');

    // Filter by type
    const spacedOnly = filterRevisionRecommendations(dummyRecs, { type: 'spaced_repetition' });
    expect(spacedOnly.length).toBe(1);
    expect(spacedOnly[0].topicId).toBe('phy-01');

    // Filter by priority
    const urgentOnly = filterRevisionRecommendations(dummyRecs, { priority: 'urgent' });
    expect(urgentOnly.length).toBe(1);
    expect(urgentOnly[0].topicId).toBe('math-01');

    // Filter by search query
    const searchMatch = filterRevisionRecommendations(dummyRecs, { searchQuery: 'Newtonian' });
    expect(searchMatch.length).toBe(1);
    expect(searchMatch[0].topicId).toBe('phy-01');

    const searchNoMatch = filterRevisionRecommendations(dummyRecs, { searchQuery: 'Organic' });
    expect(searchNoMatch.length).toBe(0);
  });
});
