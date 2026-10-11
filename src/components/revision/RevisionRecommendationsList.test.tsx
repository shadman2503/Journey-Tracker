import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RevisionRecommendationsList } from './RevisionRecommendationsList';
import type { RevisionRecommendation } from '@/domain/revisionRecommendations';

describe('RevisionRecommendationsList', () => {
  const dummyRecs: RevisionRecommendation[] = [
    {
      id: 'rec-1',
      topicId: 'math-calc-01',
      topicName: 'Limits & Continuity',
      subjectId: 'math',
      section: 'Calculus',
      chapter: 'Differential Calculus',
      type: 'critical_drill',
      priority: 'urgent',
      title: 'Urgent Drill: Limits & Continuity',
      rationale: 'Low practice accuracy (40%)',
      suggestedDurationMinutes: 45,
      suggestedAction: 'practice',
      score: 85,
      daysSinceLastStudied: 12,
      unresolvedMistakes: 2,
      accuracy: 40,
    },
    {
      id: 'rec-2',
      topicId: 'phy-mech-01',
      topicName: 'Newtonian Dynamics',
      subjectId: 'physics',
      section: 'Mechanics',
      chapter: 'Dynamics',
      type: 'spaced_repetition',
      priority: 'high',
      title: '14-Day Reinforcement: Newtonian Dynamics',
      rationale: 'Last practiced 18 days ago',
      suggestedDurationMinutes: 30,
      suggestedAction: 'practice',
      score: 60,
      daysSinceLastStudied: 18,
      unresolvedMistakes: 0,
      accuracy: 75,
    },
    {
      id: 'rec-3',
      topicId: 'cse-algo-01',
      topicName: 'Binary Search',
      subjectId: 'cse',
      section: 'Algorithms',
      chapter: 'Searching',
      type: 'mistake_drill',
      priority: 'normal',
      title: 'Mistake Reflection: Binary Search',
      rationale: '1 unresolved error',
      suggestedDurationMinutes: 20,
      suggestedAction: 'mistakes',
      score: 45,
      daysSinceLastStudied: 5,
      unresolvedMistakes: 1,
      accuracy: 80,
    },
  ];

  it('renders summary stat cards and list of recommendation cards', () => {
    render(<RevisionRecommendationsList recommendations={dummyRecs} />);

    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    expect(screen.getByText('Est. Total Time')).toBeInTheDocument();
    expect(screen.getByText('1h 35m')).toBeInTheDocument();
    expect(screen.getByText('Urgent Drill: Limits & Continuity')).toBeInTheDocument();
    expect(
      screen.getByText('14-Day Reinforcement: Newtonian Dynamics')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Mistake Reflection: Binary Search')
    ).toBeInTheDocument();
  });

  it('filters recommendations by search text input', () => {
    render(<RevisionRecommendationsList recommendations={dummyRecs} />);

    const searchInput = screen.getByPlaceholderText(/Search recommendations/i);
    fireEvent.change(searchInput, { target: { value: 'Newtonian' } });

    expect(
      screen.getByText('14-Day Reinforcement: Newtonian Dynamics')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Urgent Drill: Limits & Continuity')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Mistake Reflection: Binary Search')
    ).not.toBeInTheDocument();
  });

  it('filters recommendations by subject button pill', () => {
    render(<RevisionRecommendationsList recommendations={dummyRecs} />);

    const physicsBtn = screen.getByRole('button', { name: /^Physics$/i });
    fireEvent.click(physicsBtn);

    expect(
      screen.getByText('14-Day Reinforcement: Newtonian Dynamics')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Urgent Drill: Limits & Continuity')
    ).not.toBeInTheDocument();
  });

  it('filters recommendations by type select dropdown', () => {
    render(<RevisionRecommendationsList recommendations={dummyRecs} />);

    const typeSelect = screen.getByLabelText(/Filter by recommendation type/i);
    fireEvent.change(typeSelect, { target: { value: 'critical_drill' } });

    expect(
      screen.getByText('Urgent Drill: Limits & Continuity')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('14-Day Reinforcement: Newtonian Dynamics')
    ).not.toBeInTheDocument();
  });

  it('filters recommendations by priority select dropdown', () => {
    render(<RevisionRecommendationsList recommendations={dummyRecs} />);

    const prioritySelect = screen.getByLabelText(/Filter by priority/i);
    fireEvent.change(prioritySelect, { target: { value: 'urgent' } });

    expect(
      screen.getByText('Urgent Drill: Limits & Continuity')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('14-Day Reinforcement: Newtonian Dynamics')
    ).not.toBeInTheDocument();
  });

  it('resets filters when clicking Reset button', () => {
    render(<RevisionRecommendationsList recommendations={dummyRecs} />);

    const searchInput = screen.getByPlaceholderText(/Search recommendations/i);
    fireEvent.change(searchInput, { target: { value: 'Newtonian' } });
    expect(
      screen.queryByText('Urgent Drill: Limits & Continuity')
    ).not.toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetBtn);

    expect(
      screen.getByText('Urgent Drill: Limits & Continuity')
    ).toBeInTheDocument();
    expect(
      screen.getByText('14-Day Reinforcement: Newtonian Dynamics')
    ).toBeInTheDocument();
  });

  it('displays empty state when recommendations list is empty', () => {
    render(<RevisionRecommendationsList recommendations={[]} />);

    expect(screen.getByText('All Caught Up!')).toBeInTheDocument();
    expect(
      screen.getByText(/No pending revisions/i)
    ).toBeInTheDocument();
  });

  it('displays filter empty state when no recommendations match filter', () => {
    render(<RevisionRecommendationsList recommendations={dummyRecs} />);

    const searchInput = screen.getByPlaceholderText(/Search recommendations/i);
    fireEvent.change(searchInput, { target: { value: 'NonexistentSearchTerm' } });

    expect(
      screen.getByText('No Recommendations Match Filters')
    ).toBeInTheDocument();
  });

  it('propagates onStartPractice and onViewMistakes events', () => {
    const onStartPractice = vi.fn();
    const onViewMistakes = vi.fn();

    render(
      <RevisionRecommendationsList
        recommendations={dummyRecs}
        onStartPractice={onStartPractice}
        onViewMistakes={onViewMistakes}
      />
    );

    const practiceBtns = screen.getAllByRole('button', {
      name: /Start Practice/i,
    });
    fireEvent.click(practiceBtns[0]);
    expect(onStartPractice).toHaveBeenCalledWith('math', 'math-calc-01', 45);

    const mistakeBtns = screen.getAllByRole('button', {
      name: /Mistakes/i,
    });
    fireEvent.click(mistakeBtns[0]);
    expect(onViewMistakes).toHaveBeenCalledWith('math-calc-01');
  });
});

