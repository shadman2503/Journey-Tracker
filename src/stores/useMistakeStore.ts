import { create } from 'zustand';
import type { Mistake, SubjectId } from '@/domain/types';
import { mistakeRepo } from '@/repositories/dexie';
import {
  createMistakeSchema,
  updateMistakeSchema,
  type CreateMistakeInput,
  type UpdateMistakeInput,
  calculateMistakeMetrics,
  type MistakeMetricsSummary,
} from '@/domain/mistake';

interface MistakeState {
  mistakes: Mistake[];
  loaded: boolean;
  isLoading: boolean;
  isRecordModalOpen: boolean;
  editingMistake: Mistake | null;
  isReviewSessionOpen: boolean;
  prefilledSubjectId?: SubjectId;
  prefilledTopicId?: string;
  prefilledQuestionRef?: string;

  loadMistakes: () => Promise<void>;
  recordMistake: (input: CreateMistakeInput) => Promise<number>;
  updateMistake: (id: number, input: UpdateMistakeInput) => Promise<void>;
  deleteMistake: (id: number) => Promise<void>;
  openRecordModal: (prefill?: {
    subjectId?: SubjectId;
    topicId?: string;
    questionRef?: string;
  }) => void;
  openEditModal: (mistake: Mistake) => void;
  closeRecordModal: () => void;
  openReviewSession: () => void;
  closeReviewSession: () => void;
  getMetrics: () => MistakeMetricsSummary;
}

export const useMistakeStore = create<MistakeState>((set, get) => ({
  mistakes: [],
  loaded: false,
  isLoading: false,
  isRecordModalOpen: false,
  editingMistake: null,
  isReviewSessionOpen: false,
  prefilledSubjectId: undefined,
  prefilledTopicId: undefined,
  prefilledQuestionRef: undefined,

  loadMistakes: async () => {
    if (get().loaded || get().isLoading) return;
    set({ isLoading: true });
    try {
      const records = await mistakeRepo.getAll();
      // Sort newest first
      records.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ||
          (b.id ?? 0) - (a.id ?? 0),
      );
      set({ mistakes: records, loaded: true, isLoading: false });
    } catch (err) {
      console.error('Failed to load mistakes from Dexie:', err);
      set({ isLoading: false });
    }
  },

  recordMistake: async (input: CreateMistakeInput) => {
    const validated = createMistakeSchema.parse(input);
    const now = new Date().toISOString();

    const newMistakeData: Omit<Mistake, 'id'> = {
      subjectId: validated.subjectId,
      topicId: validated.topicId,
      questionRef: validated.questionRef,
      whatWentWrong: validated.whatWentWrong,
      correctSolution: validated.correctSolution,
      type: validated.type,
      status: validated.status ?? 'unresolved',
      reviewDate: validated.reviewDate ? validated.reviewDate : undefined,
      createdAt: now,
    };

    const id = await mistakeRepo.add(newMistakeData);
    const created: Mistake = {
      ...newMistakeData,
      id,
    };

    set((state) => ({
      mistakes: [created, ...state.mistakes],
      isRecordModalOpen: false,
      editingMistake: null,
      prefilledSubjectId: undefined,
      prefilledTopicId: undefined,
      prefilledQuestionRef: undefined,
    }));

    return id;
  },

  updateMistake: async (id: number, input: UpdateMistakeInput) => {
    const validated = updateMistakeSchema.parse(input);

    const updatePayload: Partial<Mistake> = {};
    if (validated.subjectId !== undefined) updatePayload.subjectId = validated.subjectId;
    if (validated.topicId !== undefined) updatePayload.topicId = validated.topicId;
    if (validated.questionRef !== undefined) updatePayload.questionRef = validated.questionRef;
    if (validated.whatWentWrong !== undefined) updatePayload.whatWentWrong = validated.whatWentWrong;
    if (validated.correctSolution !== undefined)
      updatePayload.correctSolution = validated.correctSolution;
    if (validated.type !== undefined) updatePayload.type = validated.type;
    if (validated.status !== undefined) updatePayload.status = validated.status;
    if (validated.reviewDate !== undefined)
      updatePayload.reviewDate = validated.reviewDate || undefined;

    await mistakeRepo.update(id, updatePayload);

    set((state) => ({
      mistakes: state.mistakes.map((m) => (m.id === id ? { ...m, ...updatePayload } : m)),
      isRecordModalOpen: false,
      editingMistake: null,
    }));
  },

  deleteMistake: async (id: number) => {
    await mistakeRepo.delete(id);
    set((state) => ({
      mistakes: state.mistakes.filter((m) => m.id !== id),
    }));
  },

  openRecordModal: (prefill) => {
    set({
      isRecordModalOpen: true,
      editingMistake: null,
      prefilledSubjectId: prefill?.subjectId,
      prefilledTopicId: prefill?.topicId,
      prefilledQuestionRef: prefill?.questionRef,
    });
  },

  openEditModal: (mistake) => {
    set({
      isRecordModalOpen: true,
      editingMistake: mistake,
      prefilledSubjectId: mistake.subjectId,
      prefilledTopicId: mistake.topicId,
      prefilledQuestionRef: mistake.questionRef,
    });
  },

  closeRecordModal: () => {
    set({
      isRecordModalOpen: false,
      editingMistake: null,
      prefilledSubjectId: undefined,
      prefilledTopicId: undefined,
      prefilledQuestionRef: undefined,
    });
  },

  openReviewSession: () => {
    set({ isReviewSessionOpen: true });
  },

  closeReviewSession: () => {
    set({ isReviewSessionOpen: false });
  },

  getMetrics: () => {
    return calculateMistakeMetrics(get().mistakes);
  },
}));
