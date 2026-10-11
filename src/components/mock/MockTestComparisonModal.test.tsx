import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MockTestComparisonModal } from './MockTestComparisonModal';
import type { MockTest } from '@/domain/types';

describe('MockTestComparisonModal', () => {
  const testA: MockTest = {
    id: 2,
    testName: 'DUET Full Model Test 2',
    date: '2026-10-08',
    totalQuestions: 100,
    correctAnswers: 72,
    wrongAnswers: 16,
    score: 68,
    accuracy: 81.8,
    timeTakenMinutes: 110,
    createdAt: '',
  };

  const testB: MockTest = {
    id: 1,
    testName: 'DUET Full Model Test 1',
    date: '2026-10-01',
    totalQuestions: 100,
    correctAnswers: 60,
    wrongAnswers: 20,
    score: 55,
    accuracy: 75,
    timeTakenMinutes: 120,
    createdAt: '',
  };

  it('renders side-by-side metrics and deltas when open', () => {
    render(
      <MockTestComparisonModal
        isOpen={true}
        testA={testA}
        testB={testB}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Mock Test Comparison/i })).toBeInTheDocument();
    expect(screen.getByText('DUET Full Model Test 2')).toBeInTheDocument();
    expect(screen.getByText('DUET Full Model Test 1')).toBeInTheDocument();

    // Score comparison: 68 vs 55 -> +13
    expect(screen.getByText('68.00')).toBeInTheDocument();
    expect(screen.getByText('55.00')).toBeInTheDocument();
    expect(screen.getByText('+13')).toBeInTheDocument();

    // Accuracy: 81.8% vs 75% -> +6.8%
    expect(screen.getByText('81.8%')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('+6.8%')).toBeInTheDocument();
  });

  it('does not render when isOpen is false or tests are missing', () => {
    const { rerender } = render(
      <MockTestComparisonModal
        isOpen={false}
        testA={testA}
        testB={testB}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <MockTestComparisonModal
        isOpen={true}
        testA={null}
        testB={testB}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <MockTestComparisonModal
        isOpen={true}
        testA={testA}
        testB={testB}
        onClose={handleClose}
      />,
    );

    const closeBtn = screen.getByRole('button', { name: 'Close Comparison' });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalled();
  });
});

