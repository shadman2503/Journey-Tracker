import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTopicProgressStore } from './useTopicProgressStore';
import { topicProgressRepo } from '@/repositories/dexie';

vi.mock('@/repositories/dexie', () => ({
  topicProgressRepo: {
    getAll: vi.fn(),
    save: vi.fn(),
  },
}));

describe('useTopicProgressStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTopicProgressStore.setState({
      progressMap: {},
      loaded: false,
      isLoading: false,
    });
  });

  it('defaults to not_started for untracked topics', () => {
    const status = useTopicProgressStore.getState().getStatus('non-existent');
    expect(status).toBe('not_started');
    const notes = useTopicProgressStore.getState().getNotes('non-existent');
    expect(notes).toBe('');
  });

  it('loads progress from repository and indexes by topicId', async () => {
    vi.mocked(topicProgressRepo.getAll).mockResolvedValue([
      {
        topicId: 'math-1',
        status: 'learning',
        notes: 'review limits',
        updatedAt: '2026-10-07T00:00:00Z',
      },
    ]);

    await useTopicProgressStore.getState().loadProgress();

    expect(useTopicProgressStore.getState().loaded).toBe(true);
    expect(useTopicProgressStore.getState().getStatus('math-1')).toBe('learning');
    expect(useTopicProgressStore.getState().getNotes('math-1')).toBe('review limits');
  });

  it('updates status and persists to topicProgressRepo', async () => {
    vi.mocked(topicProgressRepo.save).mockResolvedValue(undefined);

    await useTopicProgressStore.getState().setStatus('math-2', 'strong');

    expect(useTopicProgressStore.getState().getStatus('math-2')).toBe('strong');
    expect(topicProgressRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        topicId: 'math-2',
        status: 'strong',
      }),
    );
  });

  it('cycles status in sequence and wraps around', async () => {
    vi.mocked(topicProgressRepo.save).mockResolvedValue(undefined);

    // Initial untracked -> not_started. Cycle -> learning
    await useTopicProgressStore.getState().cycleStatus('math-3');
    expect(useTopicProgressStore.getState().getStatus('math-3')).toBe('learning');

    // Cycle again -> practicing
    await useTopicProgressStore.getState().cycleStatus('math-3');
    expect(useTopicProgressStore.getState().getStatus('math-3')).toBe('practicing');
  });
});
