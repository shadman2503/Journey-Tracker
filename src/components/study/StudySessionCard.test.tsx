import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudySessionCard } from './StudySessionCard';
import type { StudySession } from '@/domain/types';

describe('StudySessionCard', () => {
  const baseSession: StudySession = {
    id: 101,
    date: '2026-10-10',
    subjectId: 'math',
    topicId: 'math-alg-complex',
    durationMinutes: 45,
    questionsSolved: 20,
    correctAnswers: 16,
    notes: 'Reviewed De Moivre theorem formula',
    createdAt: '',
  };

  it('renders session card details with resolved topic name and badges', () => {
    render(
      <StudySessionCard session={baseSession} topicName='Complex Numbers' />,
    );

    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Complex Numbers')).toBeInTheDocument();
    expect(screen.getByText('45m')).toBeInTheDocument();
    expect(screen.getByText('16 / 20 questions solved')).toBeInTheDocument();
    expect(screen.getByText('80% accuracy')).toBeInTheDocument();
    expect(
      screen.getByText('Reviewed De Moivre theorem formula'),
    ).toBeInTheDocument();
  });

  it('renders concept study note when questionsSolved is 0', () => {
    const readingSession: StudySession = {
      ...baseSession,
      questionsSolved: 0,
      correctAnswers: 0,
      notes: undefined,
    };

    render(
      <StudySessionCard
        session={readingSession}
        topicName='Newtonian Mechanics'
      />,
    );

    expect(
      screen.getByText('Concept study & theory review'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/accuracy/i)).not.toBeInTheDocument();
  });

  it('shows confirmation prompt and calls onDelete upon confirmation', () => {
    const onDelete = vi.fn();
    render(
      <StudySessionCard
        session={baseSession}
        topicName='Complex Numbers'
        onDelete={onDelete}
      />,
    );

    const deleteBtn = screen.getByRole('button', {
      name: /Delete study session/i,
    });
    fireEvent.click(deleteBtn);

    expect(screen.getByText('Delete this session record?')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmBtn);

    expect(onDelete).toHaveBeenCalledWith(101);
  });

  it('cancels deletion when Cancel button is clicked', () => {
    const onDelete = vi.fn();
    render(
      <StudySessionCard
        session={baseSession}
        topicName='Complex Numbers'
        onDelete={onDelete}
      />,
    );

    const deleteBtn = screen.getByRole('button', {
      name: /Delete study session/i,
    });
    fireEvent.click(deleteBtn);

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);

    expect(
      screen.queryByText('Delete this session record?'),
    ).not.toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
