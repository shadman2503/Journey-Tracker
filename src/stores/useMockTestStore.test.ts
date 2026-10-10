import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMockTestStore } from './useMockTestStore';
import type { MockTest } from '@/domain/types';

// Mock repository
vi.mock('@/repositories/dexie', () => ({
  mockTestRepo: {
    getAll: vi.fn(),
    add: vi.fn(),
    delete: vi.fn(),
  },
}));

import { mockTestRepo } from '@/repositories/dexie';

describe('useMockTestStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMockTestStore.setState({
      tests: [],
      loaded: false,
      isLoading: false,
      isRecordModalOpen: false,
    });
  });

  it('loads mock tests from repository and sorts them descending by date', async () => {
    const mockData: MockTest[] = [
      {
        id: 1,
        testName: 'Mock 1',
        date: '2026-10-01',
        totalQuestions: 100,
        correctAnswers: 70,
        wrongAnswers: 20,
        score: 65,
        accuracy: 77.8,
        timeTakenMinutes: 120,
        createdAt: '',
      },
      {
        id: 2,
        testName: 'Mock 2',
        date: '2026-10-08',
        totalQuestions: 100,
        correctAnswers: 80,
        wrongAnswers: 10,
        score: 77.5,
        accuracy: 88.9,
        timeTakenMinutes: 110,
        createdAt: '',
      },
    ];

    vi.mocked(mockTestRepo.getAll).mockResolvedValue([...mockData]);

    await useMockTestStore.getState().loadMockTests();

    const state = useMockTestStore.getState();
    expect(state.loaded).toBe(true);
    expect(state.tests.length).toBe(2);
    // Newest date first
    expect(state.tests[0].date).toBe('2026-10-08');
    expect(state.tests[1].date).toBe('2026-10-01');

    const metrics = state.getMetrics();
    expect(metrics.totalTests).toBe(2);
    expect(metrics.highestScore).toBe(77.5);
    expect(metrics.totalQuestionsAttempted).toBe(180);
  });

  it('records a new valid mock test through repository and updates store', async () => {
    vi.mocked(mockTestRepo.add).mockResolvedValue(99);

    const id = await useMockTestStore.getState().recordMockTest({
      testName: 'DUET Full Model Test 3',
      date: '2026-10-10',
      totalQuestions: 100,
      correctAnswers: 76,
      wrongAnswers: 16,
      timeTakenMinutes: 115,
      notes: 'Strong in Math, review Physics optics',
    });

    expect(id).toBe(99);
    expect(mockTestRepo.add).toHaveBeenCalledTimes(1);

    // Verify calculated score: 76 - (16 * 0.25) = 72
    // Verify accuracy: 76 / 92 * 100 = 82.6%
    const addedPayload = vi.mocked(mockTestRepo.add).mock.calls[0][0];
    expect(addedPayload.score).toBe(72);
    expect(addedPayload.accuracy).toBe(82.6);
    expect(addedPayload.testName).toBe('DUET Full Model Test 3');

    const state = useMockTestStore.getState();
    expect(state.tests.length).toBe(1);
    expect(state.tests[0].id).toBe(99);
    expect(state.tests[0].score).toBe(72);
    expect(state.isRecordModalOpen).toBe(false);

    const metrics = state.getMetrics();
    expect(metrics.totalTests).toBe(1);
    expect(metrics.averageScore).toBe(72);
  });

  it('throws validation error and does not call repository when input is invalid', async () => {
    await expect(
      useMockTestStore.getState().recordMockTest({
        testName: 'Invalid Test',
        date: '2026-10-10',
        totalQuestions: 50,
        correctAnswers: 40,
        wrongAnswers: 20, // 40 + 20 = 60 > 50
        timeTakenMinutes: 60,
      }),
    ).rejects.toThrow();

    expect(mockTestRepo.add).not.toHaveBeenCalled();
    expect(useMockTestStore.getState().tests.length).toBe(0);
  });

  it('deletes mock test from repository and updates store state', async () => {
    vi.mocked(mockTestRepo.delete).mockResolvedValue(undefined);

    useMockTestStore.setState({
      tests: [
        {
          id: 5,
          testName: 'Mock 5',
          date: '2026-10-10',
          totalQuestions: 100,
          correctAnswers: 80,
          wrongAnswers: 10,
          score: 77.5,
          accuracy: 88.9,
          timeTakenMinutes: 120,
          createdAt: '',
        },
      ],
      loaded: true,
    });

    await useMockTestStore.getState().deleteMockTest(5);

    expect(mockTestRepo.delete).toHaveBeenCalledWith(5);
    expect(useMockTestStore.getState().tests.length).toBe(0);
  });

  it('manages modal open and close state', () => {
    const store = useMockTestStore.getState();

    store.openRecordModal();
    let state = useMockTestStore.getState();
    expect(state.isRecordModalOpen).toBe(true);

    store.closeRecordModal();
    state = useMockTestStore.getState();
    expect(state.isRecordModalOpen).toBe(false);
  });
});

