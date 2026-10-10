import { describe, it, expect } from 'vitest';
import {
  calculateTopicProgressPercentage,
  calculateSubjectProgress,
  calculateOverallProgress,
  calculateStudyStreak,
  STATUS_WEIGHTS,
} from './calculations';
import type { SyllabusTopic, TopicProgress } from './types';

describe('calculateTopicProgressPercentage', () => {
  it('returns 0 when there are no topics', () => {
    expect(calculateTopicProgressPercentage(0, [])).toBe(0);
  });

  it('calculates progress accurately according to status weightings', () => {
    const progressList: TopicProgress[] = [
      { topicId: '1', status: 'strong', updatedAt: '' },
      { topicId: '2', status: 'learning', updatedAt: '' },
    ];
    // 1.0 + 0.4 = 1.4 / 2 = 70%
    expect(calculateTopicProgressPercentage(2, progressList)).toBe(70);
  });

  it('verifies all status weights match the spec', () => {
    expect(STATUS_WEIGHTS.strong).toBe(1.0);
    expect(STATUS_WEIGHTS.practicing).toBe(0.75);
    expect(STATUS_WEIGHTS.needs_revision).toBe(0.5);
    expect(STATUS_WEIGHTS.learning).toBe(0.4);
    expect(STATUS_WEIGHTS.not_started).toBe(0);
  });
});

describe('calculateSubjectProgress', () => {
  const mockTopics: SyllabusTopic[] = [
    { id: 'm1', subjectId: 'math', section: 'S', chapter: 'C', name: 'T1', order: 1 },
    { id: 'm2', subjectId: 'math', section: 'S', chapter: 'C', name: 'T2', order: 2 },
    { id: 'm3', subjectId: 'math', section: 'S', chapter: 'C', name: 'T3', order: 3 },
    { id: 'm4', subjectId: 'math', section: 'S', chapter: 'C', name: 'T4', order: 4 },
  ];

  it('returns 0% and counts all not_started when progressMap is empty', () => {
    const summary = calculateSubjectProgress('math', 'Mathematics', mockTopics, {});
    expect(summary.totalTopics).toBe(4);
    expect(summary.percentage).toBe(0);
    expect(summary.completedTopics).toBe(0);
    expect(summary.inProgressTopics).toBe(0);
    expect(summary.needsRevisionTopics).toBe(0);
    expect(summary.notStartedTopics).toBe(4);
  });

  it('correctly calculates mixed progress states and weighted percentage', () => {
    const progressMap: Record<string, TopicProgress> = {
      m1: { topicId: 'm1', status: 'strong', updatedAt: '' }, // 1.0
      m2: { topicId: 'm2', status: 'practicing', updatedAt: '' }, // 0.75
      m3: { topicId: 'm3', status: 'needs_revision', updatedAt: '' }, // 0.5
      // m4 untracked -> not_started: 0
    };
    // Total weight = 1.0 + 0.75 + 0.5 + 0 = 2.25 / 4 = 56.25% -> rounds to 56%
    const summary = calculateSubjectProgress('math', 'Mathematics', mockTopics, progressMap);
    expect(summary.totalTopics).toBe(4);
    expect(summary.completedTopics).toBe(1);
    expect(summary.inProgressTopics).toBe(1);
    expect(summary.needsRevisionTopics).toBe(1);
    expect(summary.notStartedTopics).toBe(1);
    expect(summary.percentage).toBe(56);
  });

  it('returns 0% when subject has no topics in list', () => {
    const summary = calculateSubjectProgress('physics', 'Physics', mockTopics, {});
    expect(summary.totalTopics).toBe(0);
    expect(summary.percentage).toBe(0);
  });
});

describe('calculateOverallProgress', () => {
  const topics: SyllabusTopic[] = [
    { id: 'm1', subjectId: 'math', section: 'S', chapter: 'C', name: 'M1', order: 1 },
    { id: 'p1', subjectId: 'physics', section: 'S', chapter: 'C', name: 'P1', order: 1 },
    { id: 'c1', subjectId: 'chemistry', section: 'S', chapter: 'C', name: 'C1', order: 1 },
    { id: 'e1', subjectId: 'english', section: 'S', chapter: 'C', name: 'E1', order: 1 },
    { id: 'cs1', subjectId: 'cse', section: 'S', chapter: 'C', name: 'CS1', order: 1 },
  ];

  it('calculates 100% when all topics are marked strong', () => {
    const progressMap: Record<string, TopicProgress> = {
      m1: { topicId: 'm1', status: 'strong', updatedAt: '' },
      p1: { topicId: 'p1', status: 'strong', updatedAt: '' },
      c1: { topicId: 'c1', status: 'strong', updatedAt: '' },
      e1: { topicId: 'e1', status: 'strong', updatedAt: '' },
      cs1: { topicId: 'cs1', status: 'strong', updatedAt: '' },
    };

    const overall = calculateOverallProgress(topics, progressMap);
    expect(overall.totalTopics).toBe(5);
    expect(overall.completedTopics).toBe(5);
    expect(overall.percentage).toBe(100);
    expect(overall.subjects.math.percentage).toBe(100);
    expect(overall.subjects.physics.percentage).toBe(100);
  });

  it('aggregates mixed statuses across subjects accurately', () => {
    const progressMap: Record<string, TopicProgress> = {
      m1: { topicId: 'm1', status: 'strong', updatedAt: '' }, // 1.0
      p1: { topicId: 'p1', status: 'learning', updatedAt: '' }, // 0.4
      // c1, e1, cs1 are untracked (0)
    };
    // Total weight = 1.4 / 5 = 28%
    const overall = calculateOverallProgress(topics, progressMap);
    expect(overall.totalTopics).toBe(5);
    expect(overall.completedTopics).toBe(1);
    expect(overall.inProgressTopics).toBe(1);
    expect(overall.notStartedTopics).toBe(3);
    expect(overall.percentage).toBe(28);
    expect(overall.subjects.math.percentage).toBe(100);
    expect(overall.subjects.physics.percentage).toBe(40);
    expect(overall.subjects.chemistry.percentage).toBe(0);
  });
});

describe('calculateStudyStreak', () => {
  it('returns 0 streaks for empty dates', () => {
    expect(calculateStudyStreak([])).toEqual({ currentStreak: 0, bestStreak: 0 });
  });

  it('calculates best streak correctly across consecutive dates', () => {
    const dates = ['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-05', '2026-03-06'];
    const result = calculateStudyStreak(dates);
    expect(result.bestStreak).toBe(3);
  });
});
