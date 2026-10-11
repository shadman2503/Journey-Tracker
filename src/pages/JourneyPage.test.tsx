import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JourneyPage } from './JourneyPage';
import { useMilestoneStore } from '@/stores/useMilestoneStore';
import { useStudySessionStore } from '@/stores/useStudySessionStore';

vi.mock('@/repositories/dexie', () => ({
  milestoneRepo: {
    getAll: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue(101),
    delete: vi.fn().mockResolvedValue(undefined),
  },
  studySessionRepo: {
    getAll: vi.fn().mockResolvedValue([]),
    add: vi.fn(),
    delete: vi.fn(),
  },
  mockTestRepo: {
    getAll: vi.fn().mockResolvedValue([]),
    add: vi.fn(),
    delete: vi.fn(),
  },
  topicProgressRepo: {
    getAll: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/repositories/syllabusRepository', () => ({
  syllabusRepository: {
    getAllTopics: vi.fn().mockResolvedValue([
      {
        id: 'math-01',
        name: 'Complex Numbers',
        subjectId: 'math',
        section: 'Algebra',
        chapter: 'Algebra',
        order: 1,
      },
    ]),
  },
}));

import { milestoneRepo } from '@/repositories/dexie';

describe('JourneyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMilestoneStore.setState({
      customMilestones: [],
      loaded: false,
      isLoading: false,
      isAddModalOpen: false,
    });
    useStudySessionStore.setState({
      sessions: [],
      loaded: false,
      isLoading: false,
    });
  });

  it('renders page header and empty state when no data exists', async () => {
    render(<JourneyPage />);

    expect(screen.getByText('Preparation Journey & Milestones')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('No Milestones Found')).toBeInTheDocument();
    });
  });

  it('renders milestones when study activity exists and triggers add modal flow', async () => {
    useStudySessionStore.setState({
      sessions: [
        {
          id: 1,
          date: '2026-10-01',
          subjectId: 'math',
          topicId: 'math-01',
          durationMinutes: 45,
          questionsSolved: 55, // crosses 50 questions
          correctAnswers: 45,
          notes: '',
          createdAt: '2026-10-01T10:00:00.000Z',
        },
      ],
      loaded: true,
      isLoading: false,
    });

    render(<JourneyPage />);

    await waitFor(() => {
      expect(screen.getByText('Journey Begun')).toBeInTheDocument();
      expect(screen.getByText('Fifty Questions Down')).toBeInTheDocument();
    });

    // Test opening the Add Personal Goal modal
    const addGoalBtn = screen.getAllByRole('button', { name: /Add Personal Goal/i })[0];
    fireEvent.click(addGoalBtn);

    expect(screen.getByRole('dialog', { name: /Add Custom Milestone/i })).toBeInTheDocument();

    // Close the modal
    const closeBtn = screen.getByLabelText(/Close add milestone dialog/i);
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog', { name: /Add Custom Milestone/i })).not.toBeInTheDocument();
  });

  it('adds and displays custom milestone', async () => {
    vi.mocked(milestoneRepo.add).mockResolvedValue(42);

    render(<JourneyPage />);

    // Open modal
    const addGoalBtn = screen.getAllByRole('button', { name: /Add Personal Goal/i })[0];
    fireEvent.click(addGoalBtn);

    fireEvent.change(screen.getByLabelText(/Milestone Title \*/i), {
      target: { value: 'Finished Routine Setup' },
    });
    fireEvent.change(screen.getByLabelText(/Description \*/i), {
      target: { value: 'Fixed 6-hour daily study schedule' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Save Milestone/i }));

    await waitFor(() => {
      expect(screen.getByText('Finished Routine Setup')).toBeInTheDocument();
      expect(screen.getByText('Personal Goal')).toBeInTheDocument();
    });
  });
});

