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
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as CountdownState;
        if (version < 2) {
          if (state?.targetDate === '2027-06-20T09:00:00+06:00') {
            return {
              ...state,
              targetDate: DEFAULT_EXAM_DATE,
            };
          }
        }
        return state;
      },
    }
  )
);

