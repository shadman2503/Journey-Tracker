import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeakAreaRadar } from './WeakAreaRadar';
import type { WeakAreaTopic } from '@/domain/weakArea';

describe('WeakAreaRadar', () => {
  const dummyWeakAreas: WeakAreaTopic[] = [
    {
      topicId: 'math-calc-01',
      topicName: 'Limits & Continuity',
      subjectId: 'math',
      section: 'Calculus',
      chapter: 'Differential Calculus',
      score: 85,
      urgency: 'critical',
      primaryReason: 'Low practice accuracy (40%)',
      signals: ['low_accuracy'],
      accuracy: 40,
      questionsAttempted: 30,
      unresolvedMistakes: 2,
      totalMistakes: 3,
      daysSinceLastStudied: 12,
      status: 'learning',
    },
    {
      topicId: 'phy-mech-01',
      topicName: 'Newtonian Mechanics',
      subjectId: 'physics',
      section: 'Mechanics',
      chapter: 'Dynamics',
      score: 55,
      urgency: 'moderate',
      primaryReason: 'Inactive for 25 days',
      signals: ['revision_overdue'],
      accuracy: 72,
      questionsAttempted: 40,
      unresolvedMistakes: 1,
      totalMistakes: 1,
      daysSinceLastStudied: 25,
      status: 'needs_revision',
    },
    {
      topicId: 'cse-ds-01',
      topicName: 'Binary Search Trees',
      subjectId: 'cse',
      section: 'Data Structures',
      chapter: 'Trees',
      score: 30,
      urgency: 'minor',
      primaryReason: 'Moderate practice accuracy (68%)',
      signals: ['low_accuracy'],
      accuracy: 68,
      questionsAttempted: 25,
      unresolvedMistakes: 0,
      totalMistakes: 0,
      daysSinceLastStudied: 5,
      status: 'learning',
    },
  ];

  it('renders summary stat cards and list of weak area topics', () => {
    render(<WeakAreaRadar weakAreas={dummyWeakAreas} />);

    expect(screen.getByText('Total Flagged')).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    expect(screen.getByText('Limits & Continuity')).toBeInTheDocument();
    expect(screen.getByText('Newtonian Mechanics')).toBeInTheDocument();
    expect(screen.getByText('Binary Search Trees')).toBeInTheDocument();
  });

  it('filters topics by search text input', () => {
    render(<WeakAreaRadar weakAreas={dummyWeakAreas} />);

    const searchInput = screen.getByPlaceholderText(/Search weak topics/i);
    fireEvent.change(searchInput, { target: { value: 'Newtonian' } });

    expect(screen.getByText('Newtonian Mechanics')).toBeInTheDocument();
    expect(screen.queryByText('Limits & Continuity')).not.toBeInTheDocument();
    expect(screen.queryByText('Binary Search Trees')).not.toBeInTheDocument();
  });

  it('filters topics by subject button pill', () => {
    render(<WeakAreaRadar weakAreas={dummyWeakAreas} />);

    const physicsButton = screen.getByRole('button', { name: /^Physics$/i });
    fireEvent.click(physicsButton);

    expect(screen.getByText('Newtonian Mechanics')).toBeInTheDocument();
    expect(screen.queryByText('Limits & Continuity')).not.toBeInTheDocument();
    expect(screen.queryByText('Binary Search Trees')).not.toBeInTheDocument();
  });

  it('filters topics by urgency dropdown selector', () => {
    render(<WeakAreaRadar weakAreas={dummyWeakAreas} />);

    const urgencySelect = screen.getByRole('combobox');
    fireEvent.change(urgencySelect, { target: { value: 'critical' } });

    expect(screen.getByText('Limits & Continuity')).toBeInTheDocument();
    expect(screen.queryByText('Newtonian Mechanics')).not.toBeInTheDocument();
    expect(screen.queryByText('Binary Search Trees')).not.toBeInTheDocument();
  });

  it('resets filters when clicking Reset button', () => {
    render(<WeakAreaRadar weakAreas={dummyWeakAreas} />);

    const searchInput = screen.getByPlaceholderText(/Search weak topics/i);
    fireEvent.change(searchInput, { target: { value: 'Newtonian' } });
    expect(screen.queryByText('Limits & Continuity')).not.toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText('Limits & Continuity')).toBeInTheDocument();
    expect(screen.getByText('Newtonian Mechanics')).toBeInTheDocument();
  });

  it('displays empty state when no weak areas exist', () => {
    render(<WeakAreaRadar weakAreas={[]} />);

    expect(screen.getByText('No Weak Areas Detected')).toBeInTheDocument();
    expect(
      screen.getByText(/Your practice accuracy is solid/i)
    ).toBeInTheDocument();
  });

  it('displays filter empty state when search returns no matches', () => {
    render(<WeakAreaRadar weakAreas={dummyWeakAreas} />);

    const searchInput = screen.getByPlaceholderText(/Search weak topics/i);
    fireEvent.change(searchInput, { target: { value: 'NonexistentTopic123' } });

    expect(
      screen.getByText('No Weak Topics Match Your Filter')
    ).toBeInTheDocument();
  });

  it('propagates practice and mistake actions', () => {
    const onPracticeTopic = vi.fn();
    const onViewMistakes = vi.fn();

    render(
      <WeakAreaRadar
        weakAreas={dummyWeakAreas}
        onPracticeTopic={onPracticeTopic}
        onViewMistakes={onViewMistakes}
      />
    );

    const practiceBtns = screen.getAllByRole('button', {
      name: /Practice Topic/i,
    });
    fireEvent.click(practiceBtns[0]);
    expect(onPracticeTopic).toHaveBeenCalledWith('math', 'math-calc-01');

    const mistakeBtns = screen.getAllByRole('button', {
      name: /Mistakes \(3\)/i,
    });
    fireEvent.click(mistakeBtns[0]);
    expect(onViewMistakes).toHaveBeenCalledWith('math-calc-01');
  });
});
