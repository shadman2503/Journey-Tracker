import { describe, it, expect } from 'vitest';
import {
  STATUS_CONFIG,
  STATUS_ORDER,
  calculateStatusBreakdown,
  getNextStatus,
} from './progress';
import type { SyllabusTopic, TopicProgress } from './types';

describe('Progress Domain Logic', () => {
  it('defines metadata for all 5 statuses', () => {
    expect(STATUS_ORDER).toHaveLength(5);
    for (const status of STATUS_ORDER) {
      expect(STATUS_CONFIG[status]).toBeDefined();
      expect(STATUS_CONFIG[status].label).toBeTruthy();
      expect(STATUS_CONFIG[status].colorClass).toBeTruthy();
      expect(STATUS_CONFIG[status].badgeClass).toBeTruthy();
    }
  });

  it('calculates status breakdown correctly with default not_started', () => {
    const mockTopics: SyllabusTopic[] = [
      {
        id: 't1',
        subjectId: 'math',
        section: 'S',
        chapter: 'C',
        name: 'T1',
        order: 1,
      },
      {
        id: 't2',
        subjectId: 'math',
        section: 'S',
        chapter: 'C',
        name: 'T2',
        order: 2,
      },
      {
        id: 't3',
        subjectId: 'math',
        section: 'S',
        chapter: 'C',
        name: 'T3',
        order: 3,
      },
      {
        id: 't4',
        subjectId: 'math',
        section: 'S',
        chapter: 'C',
        name: 'T4',
        order: 4,
      },
    ];

    const mockProgressMap: Record<string, TopicProgress> = {
      t1: { topicId: 't1', status: 'strong', updatedAt: '' },
      t2: { topicId: 't2', status: 'learning', updatedAt: '' },
      // t3 and t4 untracked
    };

    const breakdown = calculateStatusBreakdown(mockTopics, mockProgressMap);
    expect(breakdown.total).toBe(4);
    expect(breakdown.strong).toBe(1);
    expect(breakdown.learning).toBe(1);
    expect(breakdown.practicing).toBe(0);
    expect(breakdown.needs_revision).toBe(0);
    expect(breakdown.not_started).toBe(2);
  });

  it('cycles to the next status in order and wraps around', () => {
    expect(getNextStatus('not_started')).toBe('learning');
    expect(getNextStatus('learning')).toBe('practicing');
    expect(getNextStatus('practicing')).toBe('strong');
    expect(getNextStatus('strong')).toBe('needs_revision');
    expect(getNextStatus('needs_revision')).toBe('not_started');
  });
});
