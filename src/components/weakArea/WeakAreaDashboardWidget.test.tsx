import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeakAreaDashboardWidget } from './WeakAreaDashboardWidget';
import type { WeakAreaTopic } from '@/domain/weakArea';

describe('WeakAreaDashboardWidget', () => {
  const dummyWeakAreas: WeakAreaTopic[] = [
    {
      topicId: 'math-01',
      topicName: 'Limits & Continuity',
      subjectId: 'math',
      section: 'Calculus',
      chapter: 'Differential Calculus',
      score: 85,
      urgency: 'critical',
      primaryReason: 'Low practice accuracy (40%)',
      signals: ['low_accuracy'],
      accuracy: 40,
      questionsAttempted: 20,
      unresolvedMistakes: 2,
      totalMistakes: 3,
      daysSinceLastStudied: 10,
      status: 'learning',
    },
    {
      topicId: 'phy-01',
      topicName: 'Newtonian Mechanics',
      subjectId: 'physics',
      section: 'Mechanics',
      chapter: 'Dynamics',
      score: 75,
      urgency: 'critical',
      primaryReason: '3 unresolved mistakes',
      signals: ['unresolved_mistakes'],
      accuracy: 60,
      questionsAttempted: 35,
      unresolvedMistakes: 3,
      totalMistakes: 3,
      daysSinceLastStudied: 14,
      status: 'needs_revision',
    },
    {
      topicId: 'cse-01',
      topicName: 'Binary Search Trees',
      subjectId: 'cse',
      section: 'Data Structures',
      chapter: 'Trees',
      score: 50,
      urgency: 'moderate',
      primaryReason: 'Revision overdue',
      signals: ['revision_overdue'],
      accuracy: 75,
      questionsAttempted: 25,
      unresolvedMistakes: 0,
      totalMistakes: 0,
      daysSinceLastStudied: 32,
      status: 'learning',
    },
    {
      topicId: 'chem-01',
      topicName: 'Organic Reaction Mechanisms',
      subjectId: 'chemistry',
      section: 'Organic Chemistry',
      chapter: 'Reactions',
      score: 45,
      urgency: 'moderate',
      primaryReason: 'Needs revision',
      signals: ['needs_revision_status'],
      accuracy: 68,
      questionsAttempted: 30,
      unresolvedMistakes: 1,
      totalMistakes: 1,
      daysSinceLastStudied: 8,
      status: 'needs_revision',
    },
  ];

  it('renders all clear empty state when no weak areas exist', () => {
    render(<WeakAreaDashboardWidget weakAreas={[]} />);

    expect(screen.getByText('Weak Area Radar')).toBeInTheDocument();
    expect(screen.getByText('All Clear')).toBeInTheDocument();
    expect(screen.getByText('No Weak Areas Detected')).toBeInTheDocument();
  });

  it('renders widget title, critical badge, and top weak areas up to maxItems', () => {
    render(<WeakAreaDashboardWidget weakAreas={dummyWeakAreas} maxItems={2} />);

    expect(screen.getByText('Weak Area Radar')).toBeInTheDocument();
    expect(screen.getByText('2 Critical')).toBeInTheDocument();
    expect(screen.getByText('Limits & Continuity')).toBeInTheDocument();
    expect(screen.getByText('Newtonian Mechanics')).toBeInTheDocument();
    // 3rd and 4th items should not be in the top 2 cards
    expect(screen.queryByText('Binary Search Trees')).not.toBeInTheDocument();
  });

  it('calls onViewRadar when header View Full Radar button is clicked', () => {
    const onViewRadar = vi.fn();
    render(
      <WeakAreaDashboardWidget
        weakAreas={dummyWeakAreas}
        onViewRadar={onViewRadar}
      />,
    );

    const viewRadarBtn = screen.getByRole('button', {
      name: /View Full Radar \(4\)/i,
    });
    fireEvent.click(viewRadarBtn);

    expect(onViewRadar).toHaveBeenCalled();
  });

  it('calls onViewRadar when bottom overflow button is clicked', () => {
    const onViewRadar = vi.fn();
    render(
      <WeakAreaDashboardWidget
        weakAreas={dummyWeakAreas}
        maxItems={3}
        onViewRadar={onViewRadar}
      />,
    );

    const overflowBtn = screen.getByRole('button', {
      name: /\+1 more topics need attention/i,
    });
    fireEvent.click(overflowBtn);

    expect(onViewRadar).toHaveBeenCalled();
  });

  it('forwards onPracticeTopic action from cards', () => {
    const onPracticeTopic = vi.fn();
    render(
      <WeakAreaDashboardWidget
        weakAreas={dummyWeakAreas}
        onPracticeTopic={onPracticeTopic}
      />,
    );

    const practiceBtns = screen.getAllByRole('button', {
      name: /Practice Topic/i,
    });
    fireEvent.click(practiceBtns[0]);

    expect(onPracticeTopic).toHaveBeenCalledWith('math', 'math-01');
  });
});
