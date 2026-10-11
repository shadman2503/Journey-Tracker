import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MistakeReviewModal } from './MistakeReviewModal';
import { useMistakeStore } from '@/stores/useMistakeStore';
import type { Mistake } from '@/domain/types';

vi.mock('@/repositories/dexie', () => ({
  mistakeRepo: {
    getAll: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue(1),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/repositories/syllabusRepository', () => ({
  syllabusRepository: {
    getAllTopics: vi.fn().mockResolvedValue([
      { id: 'math-calc-01', subjectId: 'math', name: 'Differential Calculus' },
      { id: 'phy-01', subjectId: 'physics', name: 'Newtonian Mechanics' },
    ]),
  },
}));

describe('MistakeReviewModal', () => {
  const dueMistakes: Mistake[] = [
    {
      id: 1,
      subjectId: 'math',
      topicId: 'math-calc-01',
      questionRef: 'Math Q-10',
      whatWentWrong: 'Forgot to divide by derivative of inner function',
      correctSolution: 'Integral of f(ax) dx has factor 1/a',
      type: 'calculation',
      status: 'unresolved',
      reviewDate: '2026-01-01', // Overdue
      createdAt: '',
    },
    {
      id: 2,
      subjectId: 'physics',
      topicId: 'phy-01',
      questionRef: 'Physics Q-4',
      whatWentWrong: 'Assumed kinetic friction instead of static',
      correctSolution: 'Object is at rest, so f_s <= mu_s * N',
      type: 'conceptual',
      status: 'reviewing',
      reviewDate: '2026-01-01', // Overdue
      createdAt: '',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useMistakeStore.setState({
      mistakes: [],
      isReviewSessionOpen: true,
      isLoading: false,
    });
  });

  it('renders empty deck message when no mistakes are due', () => {
    render(<MistakeReviewModal isOpen={true} />);

    expect(screen.getByText('All Caught Up!')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^Close$/i }),
    ).toBeInTheDocument();
  });

  it('steps through review deck, reveals solution, and grades card', async () => {
    useMistakeStore.setState({ mistakes: dueMistakes });

    render(<MistakeReviewModal isOpen={true} />);

    // First card: Math Q-10
    expect(screen.getByText('Card 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('Math Q-10')).toBeInTheDocument();
    expect(
      screen.getByText(/Forgot to divide by derivative/i),
    ).toBeInTheDocument();

    // Solution should be hidden initially
    expect(
      screen.queryByText(/Integral of f\(ax\) dx/i),
    ).not.toBeInTheDocument();

    // Click reveal solution
    const revealBtn = screen.getByRole('button', {
      name: /Reveal Correct Concept & Solution/i,
    });
    fireEvent.click(revealBtn);

    // Solution is now visible
    expect(
      screen.getByText(/Integral of f\(ax\) dx has factor 1\/a/i),
    ).toBeInTheDocument();

    // Grade card as Fixed & Mastered
    const masterBtn = screen.getByRole('button', { name: /Fixed & Mastered/i });
    fireEvent.click(masterBtn);

    // Moves to second card: Physics Q-4
    await waitFor(() => {
      expect(screen.getByText('Card 2 of 2')).toBeInTheDocument();
      expect(screen.getByText('Physics Q-4')).toBeInTheDocument();
    });

    // Reveal second card and mark Still Unclear
    const revealBtn2 = screen.getByRole('button', {
      name: /Reveal Correct Concept & Solution/i,
    });
    fireEvent.click(revealBtn2);

    const unclearBtn = screen.getByRole('button', { name: /Still Unclear/i });
    fireEvent.click(unclearBtn);

    // Finished summary view
    await waitFor(() => {
      expect(screen.getByText('Review Workout Complete!')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Finish Session/i }),
      ).toBeInTheDocument();
    });

    // Finish session closes modal
    const finishBtn = screen.getByRole('button', { name: /Finish Session/i });
    fireEvent.click(finishBtn);

    expect(useMistakeStore.getState().isReviewSessionOpen).toBe(false);
  });
});
