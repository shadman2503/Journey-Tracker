import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MistakeTypeDistribution } from './MistakeTypeDistribution';
import type { Mistake } from '@/domain/types';

const MOCK_MISTAKES: Mistake[] = [
  {
    id: 1,
    subjectId: 'math',
    topicId: 'math-calc',
    questionRef: 'Q1',
    whatWentWrong: 'Sign error',
    correctSolution: 'Check signs',
    type: 'calculation',
    status: 'unresolved',
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 2,
    subjectId: 'math',
    topicId: 'math-calc',
    questionRef: 'Q2',
    whatWentWrong: 'Formula slip',
    correctSolution: 'Integral formula',
    type: 'formula',
    status: 'reviewing',
    createdAt: '2026-10-02T10:00:00Z',
  },
  {
    id: 3,
    subjectId: 'physics',
    topicId: 'phys-mech',
    questionRef: 'Q3',
    whatWentWrong: 'Theoretical confusion',
    correctSolution: 'Law of conservation',
    type: 'conceptual',
    status: 'fixed',
    createdAt: '2026-10-03T10:00:00Z',
  },
];

describe('MistakeTypeDistribution', () => {
  it('renders overall distribution across all mistake types', () => {
    render(<MistakeTypeDistribution mistakes={MOCK_MISTAKES} />);

    expect(screen.getByText('Mistake Classification Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Calculation Slip')).toBeInTheDocument();
    expect(screen.getByText('Formula Mistake')).toBeInTheDocument();
    expect(screen.getByText('Conceptual Error')).toBeInTheDocument();
  });

  it('filters distribution by subject when subject button is clicked', () => {
    render(<MistakeTypeDistribution mistakes={MOCK_MISTAKES} />);

    // Click on Math pill
    const mathButton = screen.getByRole('button', { name: 'Math' });
    fireEvent.click(mathButton);

    // Math has 2 mistakes: 1 calculation, 1 formula
    expect(screen.getAllByText('(1 mistake)')).toHaveLength(2);
    expect(screen.getAllByText('50%')).toHaveLength(2);
  });

  it('shows empty state when selected subject has 0 mistakes', () => {
    render(<MistakeTypeDistribution mistakes={MOCK_MISTAKES} />);

    // Click on CSE pill
    const cseButton = screen.getByRole('button', { name: 'CSE' });
    fireEvent.click(cseButton);

    expect(screen.getByText(/No mistakes recorded for CSE/i)).toBeInTheDocument();
  });
});
