import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MistakeCard } from './MistakeCard';
import type { Mistake } from '@/domain/types';

vi.mock('@/repositories/syllabusRepository', () => ({
  syllabusRepository: {
    getAllTopics: vi.fn().mockResolvedValue([
      { id: 'math-calc-01', subjectId: 'math', section: 'Calc', chapter: 'Limits', name: 'Limits & Continuity', order: 1 },
    ]),
  },
}));

describe('MistakeCard', () => {
  const dummyMistake: Mistake = {
    id: 1,
    subjectId: 'math',
    topicId: 'math-calc-01',
    questionRef: 'DUET 2024 Math Q-15',
    whatWentWrong: 'Substituted direct value on 0/0 expression.',
    correctSolution: 'Factor or apply L Hopitals rule first.',
    type: 'conceptual',
    status: 'unresolved',
    reviewDate: '2026-10-20',
    createdAt: '',
  };

  it('renders mistake details, classification badge, and reflections', async () => {
    render(<MistakeCard mistake={dummyMistake} />);

    expect(screen.getByText('DUET 2024 Math Q-15')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Conceptual Error')).toBeInTheDocument();
    expect(screen.getByText('Unresolved')).toBeInTheDocument();
    expect(screen.getByText('What I Did Wrong:')).toBeInTheDocument();
    expect(screen.getByText('Substituted direct value on 0/0 expression.')).toBeInTheDocument();
    expect(screen.getByText('Correct Concept & Solution:')).toBeInTheDocument();
  });

  it('calls onUpdateStatus when Mark Fixed button is clicked', () => {
    const onUpdateStatus = vi.fn();
    render(<MistakeCard mistake={dummyMistake} onUpdateStatus={onUpdateStatus} />);

    const markFixedBtn = screen.getByRole('button', { name: /Mark Fixed/i });
    fireEvent.click(markFixedBtn);

    expect(onUpdateStatus).toHaveBeenCalledWith(1, 'fixed');
  });

  it('shows delete confirmation and triggers onDelete', () => {
    const onDelete = vi.fn();
    render(<MistakeCard mistake={dummyMistake} onDelete={onDelete} />);

    const deleteBtn = screen.getByLabelText(/Delete mistake/i);
    fireEvent.click(deleteBtn);

    expect(screen.getByText('Delete?')).toBeInTheDocument();
    const yesBtn = screen.getByRole('button', { name: /^Yes$/i });
    fireEvent.click(yesBtn);

    expect(onDelete).toHaveBeenCalledWith(1);
  });
});

