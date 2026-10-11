import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MockTestCard } from './MockTestCard';
import type { MockTest } from '@/domain/types';

describe('MockTestCard', () => {
  const test1: MockTest = {
    id: 1,
    testName: 'DUET Full Model Test 1',
    date: '2026-10-01',
    subjectId: undefined, // Full Syllabus
    totalQuestions: 100,
    correctAnswers: 60,
    wrongAnswers: 20,
    score: 55,
    accuracy: 75,
    timeTakenMinutes: 120,
    notes: 'Good baseline performance',
    createdAt: '',
  };

  const test2: MockTest = {
    id: 2,
    testName: 'DUET Full Model Test 2',
    date: '2026-10-08',
    subjectId: undefined,
    totalQuestions: 100,
    correctAnswers: 72,
    wrongAnswers: 16,
    score: 68,
    accuracy: 81.8,
    timeTakenMinutes: 115,
    notes: 'Improved calculus speed',
    createdAt: '',
  };

  it('renders mock test details correctly', () => {
    render(<MockTestCard test={test1} />);

    expect(screen.getByText('DUET Full Model Test 1')).toBeInTheDocument();
    expect(screen.getByText('Full Syllabus')).toBeInTheDocument();
    expect(screen.getByText('55.00')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('+60')).toBeInTheDocument();
    expect(screen.getByText('-20')).toBeInTheDocument();
    expect(screen.getByText('120m')).toBeInTheDocument();
    expect(screen.getByText('Good baseline performance')).toBeInTheDocument();
  });

  it('displays relative score delta badge when prior test exists', () => {
    render(<MockTestCard test={test2} allTests={[test1, test2]} />);

    // 68 - 55 = +13 pts
    expect(screen.getByText('+13 pts')).toBeInTheDocument();
  });

  it('shows delete confirmation prompt and calls onDelete', () => {
    const handleDelete = vi.fn();
    render(<MockTestCard test={test1} onDelete={handleDelete} />);

    const deleteBtn = screen.getByLabelText(/Delete mock test/i);
    fireEvent.click(deleteBtn);

    expect(screen.getByText(/Delete\?/i)).toBeInTheDocument();

    const yesBtn = screen.getByRole('button', { name: /Yes/i });
    fireEvent.click(yesBtn);

    expect(handleDelete).toHaveBeenCalledWith(1);
  });

  it('cancels delete confirmation when No is clicked', () => {
    const handleDelete = vi.fn();
    render(<MockTestCard test={test1} onDelete={handleDelete} />);

    fireEvent.click(screen.getByLabelText(/Delete mock test/i));
    expect(screen.getByText(/Delete\?/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /No/i }));
    expect(screen.queryByText(/Delete\?/i)).not.toBeInTheDocument();
    expect(handleDelete).not.toHaveBeenCalled();
  });

  it('toggles compare selection when compare button is clicked', () => {
    const handleToggleCompare = vi.fn();
    render(
      <MockTestCard
        test={test1}
        isSelectedForCompare={false}
        onToggleCompare={handleToggleCompare}
      />,
    );

    const compareBtn = screen.getByRole('button', { name: /Compare/i });
    fireEvent.click(compareBtn);

    expect(handleToggleCompare).toHaveBeenCalledWith(test1);
  });
});
