import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MistakesDashboardWidget } from './MistakesDashboardWidget';
import type { Mistake, SyllabusTopic } from '@/domain/types';

describe('MistakesDashboardWidget', () => {
  const mockTopics: SyllabusTopic[] = [
    {
      id: 'math-alg-complex',
      name: 'Complex Numbers',
      subjectId: 'math',
      section: 'Algebra',
      chapter: 'Algebra',
      order: 1,
    },
    {
      id: 'math-calc-diff',
      name: 'Differential Calculus',
      subjectId: 'math',
      section: 'Calculus',
      chapter: 'Calculus',
      order: 2,
    },
  ];

  const mockMistakes: Mistake[] = [
    {
      id: 1,
      subjectId: 'math',
      topicId: 'math-alg-complex',
      questionRef: 'DUET 2024 Math Q-5',
      whatWentWrong: 'Sign slip during modulus computation',
      correctSolution: '|z| = sqrt(x^2 + y^2)',
      type: 'calculation',
      status: 'unresolved',
      reviewDate: '2026-09-01', // overdue / due for review
      createdAt: '2026-09-01T10:00:00.000Z',
    },
    {
      id: 2,
      subjectId: 'math',
      topicId: 'math-alg-complex',
      questionRef: 'DUET 2023 Math Q-8',
      whatWentWrong: 'Forgot De Moivre formula',
      correctSolution: '(cos x + i sin x)^n = cos nx + i sin nx',
      type: 'formula',
      status: 'reviewing',
      reviewDate: '2026-09-01', // also due
      createdAt: '2026-09-02T10:00:00.000Z',
    },
    {
      id: 3,
      subjectId: 'math',
      topicId: 'math-calc-diff',
      questionRef: 'DUET 2022 Math Q-12',
      whatWentWrong: 'Product rule slip',
      correctSolution: 'u dv/dx + v du/dx',
      type: 'calculation',
      status: 'fixed',
      createdAt: '2026-09-03T10:00:00.000Z',
    },
  ];

  it('renders empty state when no mistakes are recorded', () => {
    const onLog = vi.fn();
    render(<MistakesDashboardWidget mistakes={[]} onLogMistake={onLog} />);

    expect(screen.getByText('Zero Mistakes Logged')).toBeInTheDocument();
    expect(
      screen.getByText(/Capture calculation slips, formula slips/i),
    ).toBeInTheDocument();

    const logBtn = screen.getByRole('button', { name: /Log First Mistake/i });
    fireEvent.click(logBtn);
    expect(onLog).toHaveBeenCalledTimes(1);
  });

  it('renders summary metrics, spaced review alert, and recurring hotspot', () => {
    const onReview = vi.fn();

    render(
      <MistakesDashboardWidget
        mistakes={mockMistakes}
        topics={mockTopics}
        onReviewMistakes={onReview}
      />,
    );

    // Header badge
    expect(screen.getByText('1 Active')).toBeInTheDocument();

    // Metrics ribbon
    expect(screen.getByText('Unresolved')).toBeInTheDocument();
    expect(screen.getByText('In Review')).toBeInTheDocument();
    expect(screen.getByText('Mastered & Fixed')).toBeInTheDocument();
    expect(screen.getByText('Resolution Rate')).toBeInTheDocument();

    // Spaced Review Due Banner (2 mistakes have past reviewDate)
    expect(screen.getByText(/2 Mistakes Due for Review/i)).toBeInTheDocument();
    const reviewBtn = screen.getByRole('button', { name: /Start Review/i });
    fireEvent.click(reviewBtn);
    expect(onReview).toHaveBeenCalledTimes(1);

    // Top Recurring Hotspot (Complex Numbers with 2 mistakes)
    expect(screen.getByText('Complex Numbers')).toBeInTheDocument();
    expect(screen.getByText(/Top Hotspot \(2 errors\)/i)).toBeInTheDocument();
    expect(screen.getByText(/1 Unresolved/i)).toBeInTheDocument();
  });

  it('triggers onLogMistake and onViewAll header callbacks', () => {
    const onLog = vi.fn();
    const onViewAll = vi.fn();

    render(
      <MistakesDashboardWidget
        mistakes={mockMistakes}
        topics={mockTopics}
        onLogMistake={onLog}
        onViewAll={onViewAll}
      />,
    );

    const logBtn = screen.getByRole('button', { name: /Log Mistake/i });
    fireEvent.click(logBtn);
    expect(onLog).toHaveBeenCalledTimes(1);

    const viewAllBtn = screen.getByRole('button', { name: /View All/i });
    fireEvent.click(viewAllBtn);
    expect(onViewAll).toHaveBeenCalledTimes(1);
  });
});

