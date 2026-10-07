import { describe, it, expect } from 'vitest';
import { SUBJECTS_META, SYLLABUS_TOPICS } from './syllabusData';
import type { SubjectId } from './types';

describe('Syllabus Dataset Integrity', () => {
  it('contains exactly 5 subjects with expected IDs', () => {
    const expectedIds: SubjectId[] = [
      'math',
      'physics',
      'chemistry',
      'english',
      'cse',
    ];
    expect(SUBJECTS_META).toHaveLength(5);
    const subjectIds = SUBJECTS_META.map((s) => s.id);
    expect(subjectIds).toEqual(expectedIds);
  });

  it('has unique topic IDs across the entire dataset', () => {
    const ids = SYLLABUS_TOPICS.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(SYLLABUS_TOPICS.length);
  });

  it('ensures every subject has topics and accurate counts in metadata', () => {
    for (const subject of SUBJECTS_META) {
      const topics = SYLLABUS_TOPICS.filter((t) => t.subjectId === subject.id);
      expect(topics.length).toBeGreaterThan(0);
      expect(topics.length).toBe(subject.totalTopics);
    }
  });

  it('has positive ordering numbers for every topic', () => {
    for (const topic of SYLLABUS_TOPICS) {
      expect(topic.order).toBeGreaterThan(0);
      expect(topic.name.trim()).not.toBe('');
      expect(topic.chapter.trim()).not.toBe('');
      expect(topic.section.trim()).not.toBe('');
    }
  });
});
