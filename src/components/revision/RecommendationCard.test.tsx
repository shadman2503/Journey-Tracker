import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecommendationCard } from './RecommendationCard';
import type { RevisionRecommendation } from '@/domain/revisionRecommendations';

describe('RecommendationCard', () => {
  const dummyRec: RevisionRecommendation = {
    id: 'rec-1',
    topicId: 'math-calc-01',
    topicName: 'Limits & Continuity',
    subjectId: 'math',
    section: 'Calculus',
    chapter: 'Differential Calculus',
    type: 'critical_drill',
    priority: 'urgent',
    title: 'Urgent Drill: Limits & Continuity',
    rationale: 'Low practice accuracy (42%) and 3 unresolved mistakes',
    suggestedDurationMinutes: 45,
    suggestedAction: 'practice',
    score: 88,
    daysSinceLastStudied: 14,
    unresolvedMistakes: 3,
    accuracy: 42,
  };

  it('renders card title, metadata, priority, duration, and rationale', () => {
    render(<RecommendationCard item={dummyRec} />);

    expect(screen.getByText('Urgent Drill: Limits & Continuity')).toBeInTheDocument();
    expect(screen.getByText(/Calculus/)).toBeInTheDocument();
    expect(screen.getByText(/Differential Calculus/)).toBeInTheDocument();
    expect(screen.getByText('Critical Drill')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('45m')).toBeInTheDocument();
    expect(
      screen.getByText('Low practice accuracy (42%) and 3 unresolved mistakes')
    ).toBeInTheDocument();
    expect(screen.getByText('14d')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('triggers onStartPractice callback with subjectId, topicId, and duration', () => {
    const onStartPractice = vi.fn();
    render(
      <RecommendationCard item={dummyRec} onStartPractice={onStartPractice} />
    );

    const practiceBtn = screen.getByRole('button', {
      name: /Start Practice \(45m\)/i,
    });
    fireEvent.click(practiceBtn);

    expect(onStartPractice).toHaveBeenCalledWith('math', 'math-calc-01', 45);
  });

  it('triggers onViewMistakes callback when mistakes button is clicked', () => {
    const onViewMistakes = vi.fn();
    render(
      <RecommendationCard item={dummyRec} onViewMistakes={onViewMistakes} />
    );

    const mistakesBtn = screen.getByRole('button', {
      name: /Mistakes \(3\)/i,
    });
    fireEvent.click(mistakesBtn);

    expect(onViewMistakes).toHaveBeenCalledWith('math-calc-01');
  });

  it('does not render mistakes button when unresolvedMistakes is 0', () => {
    const noMistakesItem: RevisionRecommendation = {
      ...dummyRec,
      unresolvedMistakes: 0,
    };

    render(
      <RecommendationCard item={noMistakesItem} onViewMistakes={vi.fn()} />
    );

    expect(screen.queryByRole('button', { name: /Mistakes/i })).not.toBeInTheDocument();
  });
});

