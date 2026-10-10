import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_EXAM_DATE,
  DEFAULT_EXAM_TITLE,
} from '@/domain/countdown';

interface CountdownState {
  targetDate: string;
  examTitle: string;
  setTargetDate: (date: string) => void;
  setExamTitle: (title: string) => void;
  resetToDefault: () => void;
}

export const useCountdownStore = create<CountdownState>()(
  persist(
    (set) => ({
      targetDate: DEFAULT_EXAM_DATE,
      examTitle: DEFAULT_EXAM_TITLE,

      setTargetDate: (targetDate: string) => set({ targetDate }),

      setExamTitle: (examTitle: string) => set({ examTitle }),

      resetToDefault: () =>
        set({
          targetDate: DEFAULT_EXAM_DATE,
          examTitle: DEFAULT_EXAM_TITLE,
        }),
    }),
    {
      name: 'duet-countdown-storage',
    }
  )
);

