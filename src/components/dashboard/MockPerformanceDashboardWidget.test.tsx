import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MockPerformanceDashboardWidget } from './MockPerformanceDashboardWidget';
import type { MockTest } from '@/domain/types';

describe('MockPerformanceDashboardWidget', () => {
  const mockTests: MockTest[] = [
    {
      id: 1,
      testName: 'DUET Model Test 1',
      date: '2026-10-01',
      totalQuestions: 100,
      correctAnswers: 70,
      wrongAnswers: 20,
      score: 65,
      accuracy: 77.8,
      timeTakenMinutes: 120,
      createdAt: '2026-10-01T10:00:00.000Z',
    },
    {
      id: 2,
      testName: 'DUET Model Test 2',
      date: '2026-10-08',
      totalQuestions: 100,
      correctAnswers: 80,
      wrongAnswers: 12,
      score: 77,
      accuracy: 87,
      timeTakenMinutes: 115,
      createdAt: '2026-10-08T10:00:00.000Z',
    },
  ];

  it('renders empty state when no mock tests are recorded', () => {
    const onRecordMock = vi.fn();
    render(
      <MockPerformanceDashboardWidget
        tests={[]}
        onRecordMockTest={onRecordMock}
      />,
    );

    expect(screen.getByText('No Mock Tests Recorded Yet')).toBeInTheDocument();
    expect(
      screen.getByText(/Simulate exam conditions with timed practice model tests/i),
    ).toBeInTheDocument();

    const recordBtn = screen.getByRole('button', {
      name: /Record First Mock Test/i,
    });
    fireEvent.click(recordBtn);
    expect(onRecordMock).toHaveBeenCalledTimes(1);
  });

  it('renders summary metrics, latest test card, and trajectory when tests exist', () => {
    render(<MockPerformanceDashboardWidget tests={mockTests} />);

    // Header badge
    expect(screen.getByText('2 Taken')).toBeInTheDocument();

    // Summary metrics ribbon
    expect(screen.getByText('Average Score')).toBeInTheDocument();
    expect(screen.getByText('Average Accuracy')).toBeInTheDocument();
    expect(screen.getByText('Highest Score')).toBeInTheDocument();
    expect(screen.getByText('Trajectory')).toBeInTheDocument();
    expect(screen.getByText('+12')).toBeInTheDocument(); // Improving from 65 to 77 (+12)

    // Latest test card (Test 2)
    expect(screen.getByText('DUET Model Test 2')).toBeInTheDocument();
    expect(screen.getByText('Latest Mock')).toBeInTheDocument();
    expect(screen.getByText(/Score: 77 \/ 100/i)).toBeInTheDocument();
    expect(screen.getByText(/87% Accuracy/i)).toBeInTheDocument();
    expect(screen.getByText('115m')).toBeInTheDocument();
    expect(screen.getByText('2026-10-08')).toBeInTheDocument();
  });

  it('triggers onRecordMockTest and onViewAll header callbacks', () => {
    const onRecordMock = vi.fn();
    const onViewAll = vi.fn();

    render(
      <MockPerformanceDashboardWidget
        tests={mockTests}
        onRecordMockTest={onRecordMock}
        onViewAll={onViewAll}
      />,
    );

    const recordBtn = screen.getByRole('button', { name: /Record Test/i });
    fireEvent.click(recordBtn);
    expect(onRecordMock).toHaveBeenCalledTimes(1);

    const viewAllBtn = screen.getByRole('button', { name: /View All/i });
    fireEvent.click(viewAllBtn);
    expect(onViewAll).toHaveBeenCalledTimes(1);
  });
});

