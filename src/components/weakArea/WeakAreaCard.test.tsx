import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeakAreaCard } from './WeakAreaCard';
import type { WeakAreaTopic } from '@/domain/weakArea';

describe('WeakAreaCard', () => {
  const dummyWeakArea: WeakAreaTopic = {
    topicId: 'math-calc-01',
    topicName: 'Limits & Continuity',
    subjectId: 'math',
    section: 'Calculus',
    chapter: 'Differential Calculus',
    score: 82,
    urgency: 'critical',
    primaryReason: 'Low practice accuracy (42%) and 3 unresolved mistakes',
    signals: ['low_accuracy', 'unresolved_mistakes', 'repeated_mistakes'],
    accuracy: 42,
    questionsAttempted: 50,
    unresolvedMistakes: 3,
    totalMistakes: 4,
    daysSinceLastStudied: 18,
    status: 'needs_revision',
  };

  it('renders topic details, urgency badge, diagnosis, and metrics', () => {
    render(<WeakAreaCard item={dummyWeakArea} />);

    expect(screen.getByText('Limits & Continuity')).toBeInTheDocument();
    expect(screen.getByText(/Calculus/)).toBeInTheDocument();
    expect(screen.getByText(/Differential Calculus/)).toBeInTheDocument();
    expect(screen.getByText('Critical Weakness')).toBeInTheDocument();
    expect(screen.getByText('82/100')).toBeInTheDocument();
    expect(
      screen.getByText('Low practice accuracy (42%) and 3 unresolved mistakes')
    ).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('18d')).toBeInTheDocument();
  });

  it('triggers onPracticeTopic callback with subjectId and topicId', () => {
    const onPracticeTopic = vi.fn();
    render(
      <WeakAreaCard item={dummyWeakArea} onPracticeTopic={onPracticeTopic} />
    );

    const practiceBtn = screen.getByRole('button', { name: /Practice Topic/i });
    fireEvent.click(practiceBtn);

    expect(onPracticeTopic).toHaveBeenCalledWith('math', 'math-calc-01');
  });

  it('triggers onViewMistakes callback when mistakes button is clicked', () => {
    const onViewMistakes = vi.fn();
    render(
      <WeakAreaCard item={dummyWeakArea} onViewMistakes={onViewMistakes} />
    );

    const mistakesBtn = screen.getByRole('button', { name: /Mistakes \(4\)/i });
    fireEvent.click(mistakesBtn);

    expect(onViewMistakes).toHaveBeenCalledWith('math-calc-01');
  });

  it('does not render mistakes button when totalMistakes is 0', () => {
    const noMistakesItem: WeakAreaTopic = {
      ...dummyWeakArea,
      totalMistakes: 0,
      unresolvedMistakes: 0,
    };

    render(
      <WeakAreaCard item={noMistakesItem} onViewMistakes={vi.fn()} />
    );

    expect(screen.queryByRole('button', { name: /Mistakes/i })).not.toBeInTheDocument();
  });
});

