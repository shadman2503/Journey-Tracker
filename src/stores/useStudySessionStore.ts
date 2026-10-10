import { create } from 'zustand';
import type { StudySession, SubjectId } from '@/domain/types';
import { studySessionRepo } from '@/repositories/dexie';
import {
  createStudySessionSchema,
  type CreateStudySessionInput,
  calculateStudyMetrics,
  type StudyMetricsSummary,
} from '@/domain/studySession';

interface StudySessionState {
  sessions: StudySession[];
  loaded: boolean;
  isLoading: boolean;
  isRecordModalOpen: boolean;
  prefilledSubjectId?: SubjectId;
  prefilledTopicId?: string;

  loadSessions: () => Promise<void>;
  recordSession: (input: CreateStudySessionInput) => Promise<number>;
  deleteSession: (id: number) => Promise<void>;
  openRecordModal: (prefill?: { subjectId?: SubjectId; topicId?: string }) => void;
  closeRecordModal: () => void;
  getMetrics: () => StudyMetricsSummary;
}

export const useStudySessionStore = create<StudySessionState>((set, get) => ({
  sessions: [],
  loaded: false,
  isLoading: false,
  isRecordModalOpen: false,
  prefilledSubjectId: undefined,
  prefilledTopicId: undefined,

  loadSessions: async () => {
    if (get().loaded || get().isLoading) return;
    set({ isLoading: true });
    try {
      const records = await studySessionRepo.getAll();
      // Sort newest date first
      records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      set({ sessions: records, loaded: true, isLoading: false });
    } catch (err) {
      console.error('Failed to load study sessions from Dexie:', err);
      set({ isLoading: false });
    }
  },

  recordSession: async (input: CreateStudySessionInput) => {
    // Validate payload with Zod schema
    const validated = createStudySessionSchema.parse(input);

    const now = new Date().toISOString();
    const newSessionData: Omit<StudySession, 'id'> = {
      ...validated,
      createdAt: now,
    };

    const id = await studySessionRepo.add(newSessionData);
    const createdSession: StudySession = {
      ...newSessionData,
      id,
    };

    // Update state with newly created session at the beginning of the list
    set((state) => ({
      sessions: [createdSession, ...state.sessions],
      isRecordModalOpen: false,
      prefilledSubjectId: undefined,
      prefilledTopicId: undefined,
    }));

    return id;
  },

  deleteSession: async (id: number) => {
    await studySessionRepo.delete(id);
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
    }));
  },

  openRecordModal: (prefill) => {
    set({
      isRecordModalOpen: true,
      prefilledSubjectId: prefill?.subjectId,
      prefilledTopicId: prefill?.topicId,
    });
  },

  closeRecordModal: () => {
    set({
      isRecordModalOpen: false,
      prefilledSubjectId: undefined,
      prefilledTopicId: undefined,
    });
  },

  getMetrics: () => {
    return calculateStudyMetrics(get().sessions);
  },
}));

