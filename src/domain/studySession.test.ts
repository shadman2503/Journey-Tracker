import { describe, it, expect } from 'vitest';
import {
  createStudySessionSchema,
  calculateAccuracy,
  formatDuration,
  formatHours,
  calculateStudyMetrics,
  groupSessionsBySubject,
  sortStudySessions,
  filterStudySessions,
} from './studySession';
import type { StudySession, SyllabusTopic } from './types';

describe('createStudySessionSchema', () => {
  const validPayload = {
    date: '2026-10-10',
    subjectId: 'math',
    topicId: 'math-alg-complex',
    durationMinutes: 45,
    questionsSolved: 15,
    correctAnswers: 12,
    notes: 'Reviewed De Moivre formula',
  };

  it('validates and parses a correct study session payload', () => {
    const result = createStudySessionSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.subjectId).toBe('math');
      expect(result.data.durationMinutes).toBe(45);
      expect(result.data.questionsSolved).toBe(15);
      expect(result.data.correctAnswers).toBe(12);
    }
  });

  it('allows 0 questions solved and 0 correct answers (pure concept reading session)', () => {
    const result = createStudySessionSchema.safeParse({
      ...validPayload,
      questionsSolved: 0,
      correctAnswers: 0,
    });
    expect(result.success).toBe(true);
  });

  it('fails when date format is not YYYY-MM-DD', () => {
    const result = createStudySessionSchema.safeParse({
      ...validPayload,
      date: '10-10-2026',
    });
    expect(result.success).toBe(false);
  });

  it('fails when subjectId is invalid', () => {
    const result = createStudySessionSchema.safeParse({
      ...validPayload,
      subjectId: 'biology',
    });
    expect(result.success).toBe(false);
  });

  it('fails when topicId is empty', () => {
    const result = createStudySessionSchema.safeParse({
      ...validPayload,
      topicId: '',
    });
    expect(result.success).toBe(false);
  });

  it('fails when durationMinutes is 0 or negative', () => {
    const zeroDuration = createStudySessionSchema.safeParse({
      ...validPayload,
      durationMinutes: 0,
    });
    expect(zeroDuration.success).toBe(false);

    const negDuration = createStudySessionSchema.safeParse({
      ...validPayload,
      durationMinutes: -10,
    });
    expect(negDuration.success).toBe(false);
  });

  it('fails when correctAnswers exceeds questionsSolved', () => {
    const result = createStudySessionSchema.safeParse({
      ...validPayload,
      questionsSolved: 10,
      correctAnswers: 12,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('correctAnswers'));
      expect(issue).toBeDefined();
      expect(issue?.message).toMatch(/cannot exceed/i);
    }
  });

  it('fails when notes exceed 1000 characters', () => {
    const result = createStudySessionSchema.safeParse({
      ...validPayload,
      notes: 'a'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

describe('calculateAccuracy', () => {
  it('returns 0 when total questions is 0 or negative', () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
    expect(calculateAccuracy(5, 0)).toBe(0);
    expect(calculateAccuracy(5, -1)).toBe(0);
  });

  it('returns 0 when correct answers is 0 or negative', () => {
    expect(calculateAccuracy(0, 10)).toBe(0);
    expect(calculateAccuracy(-2, 10)).toBe(0);
  });

  it('returns exact percentage rounded to 1 decimal place', () => {
    expect(calculateAccuracy(5, 10)).toBe(50);
    expect(calculateAccuracy(7, 9)).toBe(77.8);
    expect(calculateAccuracy(1, 3)).toBe(33.3);
  });

  it('returns 100 when correct equals or exceeds total', () => {
    expect(calculateAccuracy(10, 10)).toBe(100);
    expect(calculateAccuracy(15, 10)).toBe(100);
  });
});

describe('formatDuration and formatHours', () => {
  it('formats minutes into human readable string', () => {
    expect(formatDuration(0)).toBe('0m');
    expect(formatDuration(25)).toBe('25m');
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(90)).toBe('1h 30m');
    expect(formatDuration(150)).toBe('2h 30m');
  });

  it('formats minutes into decimal hours', () => {
    expect(formatHours(0)).toBe('0 hrs');
    expect(formatHours(30)).toBe('0.5 hrs');
    expect(formatHours(60)).toBe('1 hrs');
    expect(formatHours(90)).toBe('1.5 hrs');
    expect(formatHours(125)).toBe('2.1 hrs');
  });
});

describe('calculateStudyMetrics', () => {
  it('handles empty sessions list', () => {
    const summary = calculateStudyMetrics([]);
    expect(summary.totalMinutes).toBe(0);
    expect(summary.totalHoursFormatted).toBe('0 hrs');
    expect(summary.totalQuestionsSolved).toBe(0);
    expect(summary.totalCorrectAnswers).toBe(0);
    expect(summary.overallAccuracy).toBe(0);
    expect(summary.sessionCount).toBe(0);
  });

  it('aggregates metrics correctly across multiple sessions', () => {
    const mockSessions: StudySession[] = [
      {
        id: 1,
        date: '2026-10-08',
        subjectId: 'math',
        topicId: 'math-alg-complex',
        durationMinutes: 60,
        questionsSolved: 20,
        correctAnswers: 16,
        createdAt: '',
      },
      {
        id: 2,
        date: '2026-10-09',
        subjectId: 'physics',
        topicId: 'phys-vector',
        durationMinutes: 90,
        questionsSolved: 30,
        correctAnswers: 24,
        createdAt: '',
      },
    ];

    const summary = calculateStudyMetrics(mockSessions);
    expect(summary.totalMinutes).toBe(150);
    expect(summary.totalHoursFormatted).toBe('2.5 hrs');
    expect(summary.totalQuestionsSolved).toBe(50);
    expect(summary.totalCorrectAnswers).toBe(40);
    expect(summary.overallAccuracy).toBe(80);
    expect(summary.sessionCount).toBe(2);
  });
});

describe('groupSessionsBySubject', () => {
  it('groups study sessions by their subject ID', () => {
    const mockSessions: StudySession[] = [
      {
        id: 1,
        date: '2026-10-08',
        subjectId: 'math',
        topicId: 'math-1',
        durationMinutes: 30,
        questionsSolved: 10,
        correctAnswers: 8,
        createdAt: '',
      },
      {
        id: 2,
        date: '2026-10-09',
        subjectId: 'physics',
        topicId: 'phys-1',
        durationMinutes: 45,
        questionsSolved: 15,
        correctAnswers: 12,
        createdAt: '',
      },
      {
        id: 3,
        date: '2026-10-10',
        subjectId: 'math',
        topicId: 'math-2',
        durationMinutes: 60,
        questionsSolved: 20,
        correctAnswers: 18,
        createdAt: '',
      },
    ];

    const grouped = groupSessionsBySubject(mockSessions);
    expect(grouped.math.length).toBe(2);
    expect(grouped.physics.length).toBe(1);
    expect(grouped.chemistry.length).toBe(0);
    expect(grouped.english.length).toBe(0);
    expect(grouped.cse.length).toBe(0);
  });
});

describe('sortStudySessions', () => {
  const sessions: StudySession[] = [
    {
      id: 1,
      date: '2026-10-01',
      subjectId: 'math',
      topicId: 't1',
      durationMinutes: 30,
      questionsSolved: 10,
      correctAnswers: 5, // 50%
      createdAt: '',
    },
    {
      id: 2,
      date: '2026-10-05',
      subjectId: 'physics',
      topicId: 't2',
      durationMinutes: 90,
      questionsSolved: 25,
      correctAnswers: 20, // 80%
      createdAt: '',
    },
    {
      id: 3,
      date: '2026-10-03',
      subjectId: 'chemistry',
      topicId: 't3',
      durationMinutes: 45,
      questionsSolved: 30,
      correctAnswers: 30, // 100%
      createdAt: '',
    },
  ];

  it('sorts by date descending by default', () => {
    const res = sortStudySessions(sessions, 'date-desc');
    expect(res.map((s) => s.id)).toEqual([2, 3, 1]);
  });

  it('sorts by date ascending', () => {
    const res = sortStudySessions(sessions, 'date-asc');
    expect(res.map((s) => s.id)).toEqual([1, 3, 2]);
  });

  it('sorts by duration descending', () => {
    const res = sortStudySessions(sessions, 'duration-desc');
    expect(res.map((s) => s.id)).toEqual([2, 3, 1]);
  });

  it('sorts by questions solved descending', () => {
    const res = sortStudySessions(sessions, 'questions-desc');
    expect(res.map((s) => s.id)).toEqual([3, 2, 1]);
  });

  it('sorts by accuracy descending', () => {
    const res = sortStudySessions(sessions, 'accuracy-desc');
    expect(res.map((s) => s.id)).toEqual([3, 2, 1]);
  });
});

describe('filterStudySessions', () => {
  const mockTopics: Record<string, SyllabusTopic> = {
    'math-alg-complex': {
      id: 'math-alg-complex',
      name: 'Complex Numbers',
      subjectId: 'math',
      section: 'Algebra',
      chapter: 'Ch 1',
      order: 1,
    },
    'phys-optics-ref': {
      id: 'phys-optics-ref',
      name: 'Refraction of Light',
      subjectId: 'physics',
      section: 'Optics',
      chapter: 'Ch 3',
      order: 2,
    },
  };

  const sessions: StudySession[] = [
    {
      id: 1,
      date: '2026-10-02',
      subjectId: 'math',
      topicId: 'math-alg-complex',
      durationMinutes: 40,
      questionsSolved: 10,
      correctAnswers: 8,
      notes: 'De Moivre theorem practice',
      createdAt: '',
    },
    {
      id: 2,
      date: '2026-10-04',
      subjectId: 'physics',
      topicId: 'phys-optics-ref',
      durationMinutes: 60,
      questionsSolved: 15,
      correctAnswers: 12,
      notes: 'Prism derivation',
      createdAt: '',
    },
    {
      id: 3,
      date: '2026-10-06',
      subjectId: 'math',
      topicId: 'math-alg-complex',
      durationMinutes: 50,
      questionsSolved: 20,
      correctAnswers: 19,
      notes: 'Euler identity review',
      createdAt: '',
    },
  ];

  it('filters by subject', () => {
    const res = filterStudySessions(sessions, { subjectId: 'physics' });
    expect(res.length).toBe(1);
    expect(res[0].id).toBe(2);
  });

  it('includes all subjects when subjectId is all or omitted', () => {
    const res = filterStudySessions(sessions, { subjectId: 'all' });
    expect(res.length).toBe(3);
  });

  it('searches across notes text', () => {
    const res = filterStudySessions(sessions, { searchQuery: 'Euler' });
    expect(res.length).toBe(1);
    expect(res[0].id).toBe(3);
  });

  it('searches across topic names using topicsMap', () => {
    const res = filterStudySessions(sessions, {
      searchQuery: 'Refraction',
      topicsMap: mockTopics,
    });
    expect(res.length).toBe(1);
    expect(res[0].id).toBe(2);
  });

  it('searches across section and chapter names', () => {
    const res = filterStudySessions(sessions, {
      searchQuery: 'Algebra',
      topicsMap: mockTopics,
    });
    expect(res.length).toBe(2);
  });

  it('returns empty array when search query matches nothing', () => {
    const res = filterStudySessions(sessions, {
      searchQuery: 'NonexistentKeywordXYZ',
      topicsMap: mockTopics,
    });
    expect(res.length).toBe(0);
  });
});


