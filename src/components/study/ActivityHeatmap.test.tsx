import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ActivityHeatmap } from './ActivityHeatmap';
import type { StudySession } from '@/domain/types';

describe('ActivityHeatmap', () => {
  const mockSessions: StudySession[] = [
    {
      id: 1,
      date: '2026-10-10',
      subjectId: 'math',
      topicId: 'math-1',
      durationMinutes: 90,
      questionsSolved: 35,
      correctAnswers: 30,
      createdAt: '',
    },
    {
      id: 2,
      date: '2026-10-08',
      subjectId: 'physics',
      topicId: 'phys-1',
      durationMinutes: 45,
      questionsSolved: 15,
      correctAnswers: 12,
      createdAt: '',
    },
  ];

  it('renders heatmap title, summary chips, grid, and legend', () => {
    render(<ActivityHeatmap sessions={mockSessions} defaultTimeRange="3months" />);

    expect(screen.getByText('Study Activity Heatmap')).toBeInTheDocument();
    expect(screen.getByText('Active Days')).toBeInTheDocument();
    expect(screen.getByText('Total Study Time')).toBeInTheDocument();
    expect(screen.getByText('Problems Solved')).toBeInTheDocument();
    expect(screen.getByText('Daily Average')).toBeInTheDocument();

    expect(screen.getByTestId('heatmap-weeks-container')).toBeInTheDocument();
    expect(screen.getByTestId('heatmap-legend')).toBeInTheDocument();
  });

  it('allows switching between Time and Questions metrics', () => {
    render(<ActivityHeatmap sessions={mockSessions} />);

    const questionsBtn = screen.getByRole('button', { name: /Filter by questions solved/i });
    fireEvent.click(questionsBtn);

    expect(questionsBtn).toHaveClass('font-semibold');

    const timeBtn = screen.getByRole('button', { name: /Filter by study duration/i });
    fireEvent.click(timeBtn);

    expect(timeBtn).toHaveClass('font-semibold');
  });

  it('allows switching time range intervals', () => {
    render(<ActivityHeatmap sessions={mockSessions} />);

    const threeMonthsBtn = screen.getByRole('button', { name: /Show 3M range/i });
    fireEvent.click(threeMonthsBtn);

    expect(screen.getByText(/Showing past 14 weeks/i)).toBeInTheDocument();

    const oneYearBtn = screen.getByRole('button', { name: /Show 1Y range/i });
    fireEvent.click(oneYearBtn);

    expect(screen.getByText(/Showing past 52 weeks/i)).toBeInTheDocument();
  });

  it('displays tooltip when hovering over an active cell', () => {
    render(<ActivityHeatmap sessions={mockSessions} />);

    const oct10Cell = screen.getByTestId('heatmap-cell-2026-10-10');
    expect(oct10Cell).toBeInTheDocument();

    fireEvent.mouseEnter(oct10Cell);

    const tooltip = screen.getByTestId('heatmap-tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(screen.getByText(/90m studied/i)).toBeInTheDocument();
    expect(screen.getByText(/35 questions/i)).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();

    fireEvent.mouseLeave(oct10Cell);
    expect(screen.queryByTestId('heatmap-tooltip')).not.toBeInTheDocument();
  });

  it('renders clean empty state with 0 active days when no sessions recorded', () => {
    render(<ActivityHeatmap sessions={[]} />);

    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('0 hrs')).toBeInTheDocument();
  });
});
