import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RevisionDashboardWidget } from './RevisionDashboardWidget';
import type { RevisionRecommendation } from '@/domain/revisionRecommendations';

describe('RevisionDashboardWidget', () => {
  const dummyRecs: RevisionRecommendation[] = [
    {
      id: 'rec-1',
      topicId: 'math-1',
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
      daysSinceLastStudied: 10,
      unresolvedMistakes: 2,
      accuracy: 40,
    },
    {
      id: 'rec-2',
      topicId: 'phy-1',
      topicName: 'Newtonian Dynamics',
      subjectId: 'physics',
      section: 'Mechanics',
      chapter: 'Dynamics',
      type: 'spaced_repetition',
      priority: 'high',
      title: 'Spaced Review: Newtonian Dynamics',
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
      topicId: 'cse-1',
      topicName: 'Binary Search',
      subjectId: 'cse',
      section: 'Algorithms',
      chapter: 'Searching',
      type: 'mistake_drill',
      priority: 'normal',
      title: 'Mistake Drill: Binary Search',
      rationale: '1 unresolved mistake',
      suggestedDurationMinutes: 20,
      suggestedAction: 'mistakes',
      score: 45,
      daysSinceLastStudied: 5,
      unresolvedMistakes: 1,
      accuracy: 80,
    },
    {
      id: 'rec-4',
      topicId: 'chem-1',
      topicName: 'Organic Reactions',
      subjectId: 'chemistry',
      section: 'Organic',
      chapter: 'Reactions',
      type: 'stagnant_topic',
      priority: 'normal',
      title: 'Resume Topic: Organic Reactions',
      rationale: 'Stalled learning',
      suggestedDurationMinutes: 35,
      suggestedAction: 'practice',
      score: 40,
      daysSinceLastStudied: 20,
      unresolvedMistakes: 0,
      accuracy: null,
    },
  ];

  it('renders empty state when recommendations list is empty', () => {
    render(<RevisionDashboardWidget recommendations={[]} />);

    expect(screen.getByText('Revision Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Up to Date')).toBeInTheDocument();
    expect(screen.getByText('No Revisions Due Today')).toBeInTheDocument();
  });

  it('renders widget title, badge count, estimated time, and top items up to maxItems', () => {
    render(
      <RevisionDashboardWidget recommendations={dummyRecs} maxItems={2} />
    );

    expect(screen.getByText('Revision Recommendations')).toBeInTheDocument();
    expect(screen.getByText('4 Due')).toBeInTheDocument();
    expect(screen.getByText('~2h 10m')).toBeInTheDocument();
    expect(
      screen.getByText('Urgent Drill: Limits & Continuity')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Spaced Review: Newtonian Dynamics')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Mistake Drill: Binary Search')
    ).not.toBeInTheDocument();
  });

  it('calls onViewPlan when header View Full Plan button is clicked', () => {
    const onViewPlan = vi.fn();
    render(
      <RevisionDashboardWidget
        recommendations={dummyRecs}
        onViewPlan={onViewPlan}
      />
    );

    const viewPlanBtn = screen.getByRole('button', {
      name: /View Full Plan \(4\)/i,
    });
    fireEvent.click(viewPlanBtn);

    expect(onViewPlan).toHaveBeenCalled();
  });

  it('calls onViewPlan when bottom overflow button is clicked', () => {
    const onViewPlan = vi.fn();
    render(
      <RevisionDashboardWidget
        recommendations={dummyRecs}
        maxItems={3}
        onViewPlan={onViewPlan}
      />
    );

    const overflowBtn = screen.getByRole('button', {
      name: /\+1 more revision recommendations/i,
    });
    fireEvent.click(overflowBtn);

    expect(onViewPlan).toHaveBeenCalled();
  });

  it('forwards onStartPractice action from cards', () => {
    const onStartPractice = vi.fn();
    render(
      <RevisionDashboardWidget
        recommendations={dummyRecs}
        onStartPractice={onStartPractice}
      />
    );

    const practiceBtns = screen.getAllByRole('button', {
      name: /Start Practice/i,
    });
    fireEvent.click(practiceBtns[0]);

    expect(onStartPractice).toHaveBeenCalledWith('math', 'math-1', 45);
  });
});

