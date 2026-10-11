import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMistakeStore } from './useMistakeStore';
import type { Mistake } from '@/domain/types';

vi.mock('@/repositories/dexie', () => ({
  mistakeRepo: {
    getAll: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { mistakeRepo } from '@/repositories/dexie';

describe('useMistakeStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMistakeStore.setState({
      mistakes: [],
      loaded: false,
      isLoading: false,
      isRecordModalOpen: false,
      prefilledSubjectId: undefined,
      prefilledTopicId: undefined,
      prefilledQuestionRef: undefined,
    });
  });

  it('loads mistakes from repository and marks loaded', async () => {
    const dummyMistakes: Mistake[] = [
      {
        id: 1,
        subjectId: 'math',
        topicId: 'math-calc-01',
        questionRef: 'Math Q-1',
        whatWentWrong: 'Forgot chain rule',
        correctSolution: 'Multiply by inner derivative',
        type: 'conceptual',
        status: 'unresolved',
        createdAt: '2026-10-01T10:00:00Z',
      },
      {
        id: 2,
        subjectId: 'physics',
        topicId: 'phy-mech-01',
        questionRef: 'Physics Q-2',
        whatWentWrong: 'Sign slip',
        correctSolution: 'Negative g',
        type: 'calculation',
        status: 'fixed',
        createdAt: '2026-10-05T10:00:00Z',
      },
    ];

    vi.mocked(mistakeRepo.getAll).mockResolvedValue([...dummyMistakes]);

    await useMistakeStore.getState().loadMistakes();

    const state = useMistakeStore.getState();
    expect(state.loaded).toBe(true);
    expect(state.mistakes).toHaveLength(2);
    // Newest created first (id 2)
    expect(state.mistakes[0].id).toBe(2);
    expect(state.mistakes[1].id).toBe(1);
  });

  it('records a new mistake and prepends it to store', async () => {
    vi.mocked(mistakeRepo.add).mockResolvedValue(10);

    const input = {
      subjectId: 'chemistry' as const,
      topicId: 'chem-org-01',
      questionRef: 'Chemistry Test Q-8',
      whatWentWrong: 'Wrong reaction intermediate',
      correctSolution: 'Carbocation rearrangement occurs',
      type: 'conceptual' as const,
      status: 'unresolved' as const,
      reviewDate: '2026-10-18',
    };

    useMistakeStore.setState({ isRecordModalOpen: true });

    const newId = await useMistakeStore.getState().recordMistake(input);
    expect(newId).toBe(10);
    expect(mistakeRepo.add).toHaveBeenCalledTimes(1);

    const state = useMistakeStore.getState();
    expect(state.mistakes).toHaveLength(1);
    expect(state.mistakes[0].id).toBe(10);
    expect(state.mistakes[0].topicId).toBe('chem-org-01');
    expect(state.isRecordModalOpen).toBe(false);
  });

  it('updates an existing mistake status', async () => {
    const existing: Mistake = {
      id: 5,
      subjectId: 'math',
      topicId: 'math-alg-01',
      questionRef: 'Q5',
      whatWentWrong: 'Forgot quadratic formula',
      correctSolution: '-b +- sqrt(b^2 - 4ac) / 2a',
      type: 'formula',
      status: 'unresolved',
      createdAt: '2026-10-01T10:00:00Z',
    };

    useMistakeStore.setState({ mistakes: [existing], loaded: true });
    vi.mocked(mistakeRepo.update).mockResolvedValue(undefined);

    await useMistakeStore.getState().updateMistake(5, { status: 'fixed' });

    expect(mistakeRepo.update).toHaveBeenCalledWith(5, { status: 'fixed' });
    const updated = useMistakeStore.getState().mistakes.find((m) => m.id === 5);
    expect(updated?.status).toBe('fixed');
  });

  it('deletes a mistake from store and repository', async () => {
    const existing: Mistake = {
      id: 7,
      subjectId: 'english',
      topicId: 'eng-vocab-01',
      questionRef: 'Vocab Q3',
      whatWentWrong: 'Confused synonym',
      correctSolution: 'Gregarious means sociable',
      type: 'careless',
      status: 'unresolved',
      createdAt: '',
    };

    useMistakeStore.setState({ mistakes: [existing], loaded: true });
    vi.mocked(mistakeRepo.delete).mockResolvedValue(undefined);

    await useMistakeStore.getState().deleteMistake(7);

    expect(mistakeRepo.delete).toHaveBeenCalledWith(7);
    expect(useMistakeStore.getState().mistakes).toHaveLength(0);
  });

  it('manages modal open and close with prefill data', () => {
    const store = useMistakeStore.getState();
    store.openRecordModal({
      subjectId: 'cse',
      topicId: 'cse-ds-tree',
      questionRef: 'BST Insertion Q2',
    });

    let state = useMistakeStore.getState();
    expect(state.isRecordModalOpen).toBe(true);
    expect(state.prefilledSubjectId).toBe('cse');
    expect(state.prefilledTopicId).toBe('cse-ds-tree');
    expect(state.prefilledQuestionRef).toBe('BST Insertion Q2');

    state.closeRecordModal();
    state = useMistakeStore.getState();
    expect(state.isRecordModalOpen).toBe(false);
    expect(state.prefilledSubjectId).toBeUndefined();
    expect(state.prefilledTopicId).toBeUndefined();
  });

  it('returns metrics through getMetrics', () => {
    const mistakes: Mistake[] = [
      {
        id: 1,
        subjectId: 'math',
        topicId: 'math-calc-01',
        questionRef: 'Q1',
        whatWentWrong: 'Error 1',
        correctSolution: 'Sol 1',
        type: 'conceptual',
        status: 'fixed',
        createdAt: '',
      },
      {
        id: 2,
        subjectId: 'math',
        topicId: 'math-calc-02',
        questionRef: 'Q2',
        whatWentWrong: 'Error 2',
        correctSolution: 'Sol 2',
        type: 'calculation',
        status: 'unresolved',
        createdAt: '',
      },
    ];

    useMistakeStore.setState({ mistakes, loaded: true });
    const metrics = useMistakeStore.getState().getMetrics();

    expect(metrics.totalMistakes).toBe(2);
    expect(metrics.fixedCount).toBe(1);
    expect(metrics.unresolvedCount).toBe(1);
    expect(metrics.resolutionRate).toBe(50.0);
  });
});

