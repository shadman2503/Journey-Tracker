import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useToastStore, toast } from './useToastStore';

describe('useToastStore and toast helpers', () => {
  beforeEach(() => {
    useToastStore.getState().clearToasts();
    vi.useRealTimers();
  });

  it('adds and removes toasts properly', () => {
    const id = useToastStore.getState().showToast({
      message: 'Test notification',
      type: 'info',
      duration: 0,
    });

    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0].message).toBe('Test notification');

    useToastStore.getState().removeToast(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('triggers auto dismiss after duration expires', () => {
    vi.useFakeTimers();

    toast.success('Saved successfully', 2000);
    expect(useToastStore.getState().toasts).toHaveLength(1);

    vi.advanceTimersByTime(2000);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('provides convenience toast helper methods', () => {
    toast.error('An error occurred', 0);
    toast.info('Information note', 0);

    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(2);
    expect(toasts[0].type).toBe('error');
    expect(toasts[1].type).toBe('info');
  });
});

