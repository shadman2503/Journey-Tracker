import { create } from 'zustand';
import type { MockTest } from '@/domain/types';
import { mockTestRepo } from '@/repositories/dexie';
import {
  createMockTestSchema,
  type CreateMockTestInput,
  calculateMockScore,
  calculateMockAccuracy,
  calculateMockTestMetrics,
  type MockTestMetricsSummary,
} from '@/domain/mockTest';

interface MockTestState {
  tests: MockTest[];
  loaded: boolean;
  isLoading: boolean;
  isRecordModalOpen: boolean;

  loadMockTests: () => Promise<void>;
  recordMockTest: (input: CreateMockTestInput) => Promise<number>;
  deleteMockTest: (id: number) => Promise<void>;
  openRecordModal: () => void;
  closeRecordModal: () => void;
  getMetrics: () => MockTestMetricsSummary;
}

export const useMockTestStore = create<MockTestState>((set, get) => ({
  tests: [],
  loaded: false,
  isLoading: false,
  isRecordModalOpen: false,

  loadMockTests: async () => {
    if (get().loaded || get().isLoading) return;
    set({ isLoading: true });
    try {
      const records = await mockTestRepo.getAll();
      // Sort newest date first
      records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      set({ tests: records, loaded: true, isLoading: false });
    } catch (err) {
      console.error('Failed to load mock tests from Dexie:', err);
      set({ isLoading: false });
    }
  },

  recordMockTest: async (input: CreateMockTestInput) => {
    // Validate payload with Zod schema
    const validated = createMockTestSchema.parse(input);

    const score = calculateMockScore(validated.correctAnswers, validated.wrongAnswers);
    const accuracy = calculateMockAccuracy(validated.correctAnswers, validated.wrongAnswers);
    const now = new Date().toISOString();

    const newTestData: Omit<MockTest, 'id'> = {
      testName: validated.testName,
      date: validated.date,
      subjectId: validated.subjectId,
      totalQuestions: validated.totalQuestions,
      correctAnswers: validated.correctAnswers,
      wrongAnswers: validated.wrongAnswers,
      score,
      accuracy,
      timeTakenMinutes: validated.timeTakenMinutes,
      notes: validated.notes || undefined,
      createdAt: now,
    };

    const id = await mockTestRepo.add(newTestData);
    const createdTest: MockTest = {
      ...newTestData,
      id,
    };

    // Update state with newly created test at the beginning of the list
    set((state) => ({
      tests: [createdTest, ...state.tests],
      isRecordModalOpen: false,
    }));

    return id;
  },

  deleteMockTest: async (id: number) => {
    await mockTestRepo.delete(id);
    set((state) => ({
      tests: state.tests.filter((t) => t.id !== id),
    }));
  },

  openRecordModal: () => {
    set({ isRecordModalOpen: true });
  },

  closeRecordModal: () => {
    set({ isRecordModalOpen: false });
  },

  getMetrics: () => {
    return calculateMockTestMetrics(get().tests);
  },
}));

