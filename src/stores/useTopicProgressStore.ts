import { create } from 'zustand';
import type { TopicProgress, TopicStatus } from '@/domain/types';
import { getNextStatus } from '@/domain/progress';
import { topicProgressRepo } from '@/repositories/dexie';

interface TopicProgressState {
  progressMap: Record<string, TopicProgress>;
  loaded: boolean;
  isLoading: boolean;
  loadProgress: () => Promise<void>;
  getStatus: (topicId: string) => TopicStatus;
  getNotes: (topicId: string) => string;
  setStatus: (topicId: string, status: TopicStatus) => Promise<void>;
  setNotes: (topicId: string, notes: string) => Promise<void>;
  cycleStatus: (topicId: string) => Promise<void>;
}

export const useTopicProgressStore = create<TopicProgressState>((set, get) => ({
  progressMap: {},
  loaded: false,
  isLoading: false,

  loadProgress: async () => {
    if (get().loaded || get().isLoading) return;
    set({ isLoading: true });
    try {
      const records = await topicProgressRepo.getAll();
      const map: Record<string, TopicProgress> = {};
      for (const record of records) {
        map[record.topicId] = record;
      }
      set({ progressMap: map, loaded: true, isLoading: false });
    } catch (err) {
      console.error('Failed to load topic progress:', err);
      set({ isLoading: false });
    }
  },

  getStatus: (topicId: string) => {
    return get().progressMap[topicId]?.status ?? 'not_started';
  },

  getNotes: (topicId: string) => {
    return get().progressMap[topicId]?.notes ?? '';
  },

  setStatus: async (topicId: string, status: TopicStatus) => {
    const existing = get().progressMap[topicId];
    const now = new Date().toISOString();
    const updated: TopicProgress = {
      topicId,
      status,
      notes: existing?.notes,
      lastStudiedAt: status !== 'not_started' ? now : existing?.lastStudiedAt,
      updatedAt: now,
    };

    // Optimistic UI update
    set((state) => ({
      progressMap: {
        ...state.progressMap,
        [topicId]: updated,
      },
    }));

    try {
      await topicProgressRepo.save(updated);
    } catch (err) {
      console.error('Failed to save topic status to Dexie:', err);
    }
  },

  setNotes: async (topicId: string, notes: string) => {
    const existing = get().progressMap[topicId];
    const now = new Date().toISOString();
    const updated: TopicProgress = {
      topicId,
      status: existing?.status ?? 'not_started',
      notes,
      lastStudiedAt: existing?.lastStudiedAt,
      updatedAt: now,
    };

    set((state) => ({
      progressMap: {
        ...state.progressMap,
        [topicId]: updated,
      },
    }));

    try {
      await topicProgressRepo.save(updated);
    } catch (err) {
      console.error('Failed to save topic notes to Dexie:', err);
    }
  },

  cycleStatus: async (topicId: string) => {
    const current = get().getStatus(topicId);
    const next = getNextStatus(current);
    await get().setStatus(topicId, next);
  },
}));
