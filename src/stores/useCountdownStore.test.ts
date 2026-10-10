import { describe, it, expect, beforeEach } from 'vitest';
import { useCountdownStore } from './useCountdownStore';
import { DEFAULT_EXAM_DATE, DEFAULT_EXAM_TITLE } from '@/domain/countdown';

describe('useCountdownStore', () => {
  beforeEach(() => {
    useCountdownStore.getState().resetToDefault();
  });

  it('initializes with default target exam date and title', () => {
    const state = useCountdownStore.getState();
    expect(state.targetDate).toBe(DEFAULT_EXAM_DATE);
    expect(state.examTitle).toBe(DEFAULT_EXAM_TITLE);
  });

  it('updates target date when setTargetDate is called', () => {
    const newDate = '2027-07-15T10:00:00Z';
    useCountdownStore.getState().setTargetDate(newDate);
    expect(useCountdownStore.getState().targetDate).toBe(newDate);
  });

  it('updates title and resets back to defaults', () => {
    useCountdownStore.getState().setExamTitle('DUET Postponed Exam');
    expect(useCountdownStore.getState().examTitle).toBe('DUET Postponed Exam');

    useCountdownStore.getState().resetToDefault();
    expect(useCountdownStore.getState().targetDate).toBe(DEFAULT_EXAM_DATE);
    expect(useCountdownStore.getState().examTitle).toBe(DEFAULT_EXAM_TITLE);
  });
});

