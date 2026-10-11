import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecordMistakeModal } from './RecordMistakeModal';
import { useMistakeStore } from '@/stores/useMistakeStore';

vi.mock('@/repositories/syllabusRepository', () => ({
  syllabusRepository: {
    getTopicsBySubject: vi.fn().mockResolvedValue([
      { id: 'math-calc-01', subjectId: 'math', section: 'Calc', chapter: 'Limits', name: 'Limits & Continuity', order: 1 },
      { id: 'math-calc-02', subjectId: 'math', section: 'Calc', chapter: 'Derivatives', name: 'Differentiation', order: 2 },
    ]),
  },
}));

vi.mock('@/repositories/dexie', () => ({
  mistakeRepo: {
    add: vi.fn().mockResolvedValue(100),
    update: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('RecordMistakeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMistakeStore.setState({
      isRecordModalOpen: true,
      editingMistake: null,
      prefilledSubjectId: undefined,
      prefilledTopicId: undefined,
      prefilledQuestionRef: undefined,
    });
  });

  it('renders modal dialog when open', async () => {
    render(<RecordMistakeModal />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Log New Mistake/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Limits & Continuity')).toBeInTheDocument();
    });
  });

  it('submits valid form and records mistake through store', async () => {
    render(<RecordMistakeModal />);

    await waitFor(() => {
      expect(screen.getByText('Limits & Continuity')).toBeInTheDocument();
    });

    const questionInput = screen.getByLabelText(/Question Source \/ Reference/i);
    fireEvent.change(questionInput, { target: { value: 'DUET 2024 Math Q-10' } });

    const wrongInput = screen.getByLabelText(/What I Did Wrong/i);
    fireEvent.change(wrongInput, { target: { value: 'Forgot to evaluate limit at infinity' } });

    const solutionInput = screen.getByLabelText(/Correct Solution & Key Concept/i);
    fireEvent.change(solutionInput, { target: { value: 'Divide numerator and denominator by highest power of x' } });

    const submitBtn = screen.getByRole('button', { name: /Log Mistake/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(useMistakeStore.getState().mistakes).toHaveLength(1);
    });
    expect(useMistakeStore.getState().isRecordModalOpen).toBe(false);
  });

  it('populates fields and updates mistake when in edit mode', async () => {
    const existing = {
      id: 55,
      subjectId: 'math' as const,
      topicId: 'math-calc-01',
      questionRef: 'Original Q-55',
      whatWentWrong: 'Original wrong explanation',
      correctSolution: 'Original correct solution',
      type: 'formula' as const,
      status: 'unresolved' as const,
      createdAt: '',
    };

    useMistakeStore.setState({
      isRecordModalOpen: true,
      editingMistake: existing,
      mistakes: [existing],
    });

    render(<RecordMistakeModal />);

    expect(screen.getByRole('heading', { name: /Edit Mistake/i })).toBeInTheDocument();

    const questionInput = screen.getByLabelText(/Question Source \/ Reference/i);
    expect(questionInput).toHaveValue('Original Q-55');

    fireEvent.change(questionInput, { target: { value: 'Updated Q-55' } });

    const updateBtn = screen.getByRole('button', { name: /Update Mistake/i });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      const updated = useMistakeStore.getState().mistakes.find((m) => m.id === 55);
      expect(updated?.questionRef).toBe('Updated Q-55');
    });
  });

  it('shows validation errors when required fields are empty', async () => {
    render(<RecordMistakeModal />);

    await waitFor(() => {
      expect(screen.getByText('Limits & Continuity')).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: /Log Mistake/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Question reference must be at least 2 characters/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Explanation must be at least 5 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/Correct concept\/solution must be at least 5 characters/i)).toBeInTheDocument();
  });
});

