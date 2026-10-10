import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStudySessionStore } from './useStudySessionStore';
import type { StudySession } from '@/domain/types';

// Mock repository
vi.mock('@/repositories/dexie', () => ({
  studySessionRepo: {
    getAll: vi.fn(),
    add: vi.fn(),
    delete: vi.fn(),
  },
}));

import { studySessionRepo } from '@/repositories/dexie';

describe('useStudySessionStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStudySessionStore.setState({
      sessions: [],
      loaded: false,
      isLoading: false,
      isRecordModalOpen: false,
      prefilledSubjectId: undefined,
      prefilledTopicId: undefined,
    });
  });

  it('loads sessions from repository and sorts them descending by date', async () => {
    const mockSessions: StudySession[] = [
      {
        id: 1,
        date: '2026-10-01',
        subjectId: 'math',
        topicId: 'math-1',
        durationMinutes: 30,
        questionsSolved: 10,
        correctAnswers: 8,
        createdAt: '',
      },
      {
        id: 2,
        date: '2026-10-05',
        subjectId: 'physics',
        topicId: 'phys-1',
        durationMinutes: 60,
        questionsSolved: 20,
        correctAnswers: 18,
        createdAt: '',
      },
    ];

    vi.mocked(studySessionRepo.getAll).mockResolvedValue([...mockSessions]);

    await useStudySessionStore.getState().loadSessions();

    const state = useStudySessionStore.getState();
    expect(state.loaded).toBe(true);
    expect(state.sessions.length).toBe(2);
    // Newest date first
    expect(state.sessions[0].date).toBe('2026-10-05');
    expect(state.sessions[1].date).toBe('2026-10-01');

    const metrics = state.getMetrics();
    expect(metrics.totalMinutes).toBe(90);
    expect(metrics.totalQuestionsSolved).toBe(30);
    expect(metrics.totalCorrectAnswers).toBe(26);
  });

  it('records a new valid session through repository and updates store', async () => {
    vi.mocked(studySessionRepo.add).mockResolvedValue(42);

    const id = await useStudySessionStore.getState().recordSession({
      date: '2026-10-10',
      subjectId: 'chemistry',
      topicId: 'chem-atomic',
      durationMinutes: 45,
      questionsSolved: 15,
      correctAnswers: 12,
      notes: 'Good progress',
    });

    expect(id).toBe(42);
    expect(studySessionRepo.add).toHaveBeenCalledTimes(1);

    const state = useStudySessionStore.getState();
    expect(state.sessions.length).toBe(1);
    expect(state.sessions[0].id).toBe(42);
    expect(state.sessions[0].subjectId).toBe('chemistry');
    expect(state.isRecordModalOpen).toBe(false);

    const metrics = state.getMetrics();
    expect(metrics.totalMinutes).toBe(45);
    expect(metrics.totalQuestionsSolved).toBe(15);
  });

  it('throws validation error and does not call repository when input is invalid', async () => {
    await expect(
      useStudySessionStore.getState().recordSession({
        date: '2026-10-10',
        subjectId: 'math',
        topicId: 'math-1',
        durationMinutes: 30,
        questionsSolved: 5,
        correctAnswers: 10, // Invalid: correct > questionsSolved
      })
    ).rejects.toThrow();

    expect(studySessionRepo.add).not.toHaveBeenCalled();
    expect(useStudySessionStore.getState().sessions.length).toBe(0);
  });

  it('deletes session from repository and updates store state', async () => {
    vi.mocked(studySessionRepo.delete).mockResolvedValue(undefined);

    useStudySessionStore.setState({
      sessions: [
        {
          id: 1,
          date: '2026-10-10',
          subjectId: 'cse',
          topicId: 'cse-c-basics',
          durationMinutes: 60,
          questionsSolved: 20,
          correctAnswers: 18,
          createdAt: '',
        },
      ],
      loaded: true,
    });

    await useStudySessionStore.getState().deleteSession(1);

    expect(studySessionRepo.delete).toHaveBeenCalledWith(1);
    expect(useStudySessionStore.getState().sessions.length).toBe(0);
  });

  it('manages modal open/close state and prefill properties', () => {
    const store = useStudySessionStore.getState();

    store.openRecordModal({ subjectId: 'physics', topicId: 'phys-vector' });
    let state = useStudySessionStore.getState();
    expect(state.isRecordModalOpen).toBe(true);
    expect(state.prefilledSubjectId).toBe('physics');
    expect(state.prefilledTopicId).toBe('phys-vector');

    store.closeRecordModal();
    state = useStudySessionStore.getState();
    expect(state.isRecordModalOpen).toBe(false);
    expect(state.prefilledSubjectId).toBeUndefined();
    expect(state.prefilledTopicId).toBeUndefined();
  });
});

