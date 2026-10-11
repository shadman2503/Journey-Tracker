import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MistakesPage } from './MistakesPage';
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
      { id: 'math-calc-01', subjectId: 'math', name: 'Differentiation Basics' },
      { id: 'chem-org-01', subjectId: 'chemistry', name: 'Hydrocarbons' },
    ]),
    getTopicsBySubject: vi.fn().mockResolvedValue([
      { id: 'math-calc-01', subjectId: 'math', name: 'Differentiation Basics' },
    ]),
  },
}));

describe('MistakesPage', () => {
  const sampleMistakes: Mistake[] = [
    {
      id: 1,
      subjectId: 'math',
      topicId: 'math-calc-01',
      questionRef: 'Math Q4',
      type: 'calculation',
      whatWentWrong: 'Forgot to multiply by 2 during integration',
      correctSolution: 'Apply chain rule factor 2x correctly',
      status: 'unresolved',
      createdAt: '2026-10-01T10:00:00.000Z',
    },
    {
      id: 2,
      subjectId: 'chemistry',
      topicId: 'chem-org-01',
      questionRef: 'Chem Q12',
      type: 'conceptual',
      whatWentWrong: 'Confused Markovnikov rule with anti-Markovnikov',
      correctSolution: 'Electrophilic addition goes via carbocation stability',
      status: 'fixed',
      createdAt: '2026-10-02T12:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useMistakeStore.setState({
      mistakes: [],
      isLoading: false,
      isRecordModalOpen: false,
      prefilledSubjectId: undefined,
      prefilledTopicId: undefined,
    });
  });

  it('renders page header and empty state when no mistakes exist', () => {
    render(<MistakesPage />);

    expect(screen.getByText('Mistake Tracking')).toBeInTheDocument();
    expect(screen.getByText('No Mistakes Logged Yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log Your First Mistake/i })).toBeInTheDocument();
  });

  it('opens record modal when clicking header "Log Mistake" button', () => {
    render(<MistakesPage />);

    const logBtn = screen.getByRole('button', { name: /Log Mistake/i });
    fireEvent.click(logBtn);

    expect(useMistakeStore.getState().isRecordModalOpen).toBe(true);
  });

  it('opens record modal when clicking empty state CTA button', () => {
    render(<MistakesPage />);

    const emptyCta = screen.getByRole('button', { name: /Log Your First Mistake/i });
    fireEvent.click(emptyCta);

    expect(useMistakeStore.getState().isRecordModalOpen).toBe(true);
  });

  it('renders KPI summary cards with correct metrics when mistakes exist', async () => {
    useMistakeStore.setState({ mistakes: sampleMistakes });

    render(<MistakesPage />);

    expect(screen.getByText('Total Logged')).toBeInTheDocument();
    expect(screen.getAllByText('Unresolved').length).toBeGreaterThan(0);
    expect(screen.getByText('In Review')).toBeInTheDocument();
    expect(screen.getByText('Fixed & Mastered')).toBeInTheDocument();

    // Total: 2, Fixed: 1, Resolution Rate: 50%
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('50% resolution rate')).toBeInTheDocument();

    // Verify cards are rendered
    await waitFor(() => {
      expect(screen.getByText('Differentiation Basics')).toBeInTheDocument();
      expect(screen.getByText('Hydrocarbons')).toBeInTheDocument();
    });
  });

  it('allows marking an unresolved mistake as fixed', async () => {
    useMistakeStore.setState({ mistakes: sampleMistakes });

    render(<MistakesPage />);

    await waitFor(() => {
      expect(screen.getByText('Differentiation Basics')).toBeInTheDocument();
    });

    const markFixedBtn = screen.getByRole('button', { name: /Mark Fixed/i });
    fireEvent.click(markFixedBtn);

    await waitFor(() => {
      const updated = useMistakeStore.getState().mistakes.find((m) => m.id === 1);
      expect(updated?.status).toBe('fixed');
    });
  });

  it('allows deleting a mistake card after confirmation', async () => {
    useMistakeStore.setState({ mistakes: sampleMistakes });

    render(<MistakesPage />);

    await waitFor(() => {
      expect(screen.getByText('Differentiation Basics')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /Delete mistake/i });
    fireEvent.click(deleteButtons[0]);

    // Confirm deletion
    const yesButton = screen.getByRole('button', { name: /^Yes$/i });
    fireEvent.click(yesButton);

    await waitFor(() => {
      expect(useMistakeStore.getState().mistakes).toHaveLength(1);
    });
  });
});
