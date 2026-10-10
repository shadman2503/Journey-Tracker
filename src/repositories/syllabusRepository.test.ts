import { describe, it, expect } from 'vitest';
import { StaticSyllabusRepository } from './syllabusRepository';

describe('StaticSyllabusRepository', () => {
  const repo = new StaticSyllabusRepository();

  it('retrieves all 5 subjects', async () => {
    const subjects = await repo.getSubjects();
    expect(subjects).toHaveLength(5);
    expect(subjects.map((s) => s.id)).toContain('math');
    expect(subjects.map((s) => s.id)).toContain('cse');
  });

  it('retrieves all 161 syllabus topics', async () => {
    const topics = await repo.getAllTopics();
    expect(topics).toHaveLength(161);
  });

  it('retrieves subject by ID accurately', async () => {
    const math = await repo.getSubjectById('math');
    expect(math).toBeDefined();
    expect(math?.name).toBe('Mathematics');
  });

  it('retrieves sorted topics for a specific subject', async () => {
    const topics = await repo.getTopicsBySubject('physics');
    expect(topics.length).toBeGreaterThan(0);
    // Ensure ascending order
    for (let i = 1; i < topics.length; i++) {
      expect(topics[i].order).toBeGreaterThanOrEqual(topics[i - 1].order);
    }
  });

  it('groups topics hierarchically by section and chapter', async () => {
    const sections = await repo.getSectionsBySubject('math');
    expect(sections.length).toBeGreaterThan(0);
    const algebra = sections.find((s) => s.section === 'Algebra');
    expect(algebra).toBeDefined();
    expect(algebra?.chapters.length).toBeGreaterThan(0);
    expect(algebra?.totalTopics).toBeGreaterThan(0);
  });

  it('searches topics across names, chapters, and sections case-insensitively', async () => {
    const results = await repo.searchTopics('complex');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((t) => t.id === 'math-alg-complex')).toBe(true);
  });

  it('filters search within a specified subject', async () => {
    // "Circuits" occurs in CSE and Physics
    const cseResults = await repo.searchTopics('circuit', 'cse');
    expect(cseResults.every((t) => t.subjectId === 'cse')).toBe(true);
  });

  it('returns empty array when query does not match any topic', async () => {
    const results = await repo.searchTopics('nonexistent-term-xyz-123');
    expect(results).toEqual([]);
  });
});
