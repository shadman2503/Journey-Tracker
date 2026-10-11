import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecurringMistakesHotspots } from './RecurringMistakesHotspots';
import type { TopicMistakeHotspot } from '@/domain/recurringMistakes';

const MOCK_HOTSPOTS: TopicMistakeHotspot[] = [
  {
    topicId: 'math-calc-limits',
    topicName: 'Limits and Continuity',
    subjectId: 'math',
    totalMistakes: 3,
    unresolvedCount: 2,
    reviewingCount: 1,
    fixedCount: 0,
    dominantType: 'calculation',
    typeBreakdown: {
      calculation: 2,
      conceptual: 1,
      formula: 0,
      careless: 0,
      misreading: 0,
      time_management: 0,
    },
    severity: 'high',
    unresolvedRatio: 0.67,
  },
  {
    topicId: 'physics-mech-newton',
    topicName: "Newton's Laws of Motion",
    subjectId: 'physics',
    totalMistakes: 2,
    unresolvedCount: 1,
    reviewingCount: 0,
    fixedCount: 1,
    dominantType: 'conceptual',
    typeBreakdown: {
      conceptual: 2,
      calculation: 0,
      formula: 0,
      careless: 0,
      misreading: 0,
      time_management: 0,
    },
    severity: 'medium',
    unresolvedRatio: 0.5,
  },
];

describe('RecurringMistakesHotspots', () => {
  it('renders empty state when hotspots array is empty', () => {
    render(<RecurringMistakesHotspots hotspots={[]} minThreshold={2} />);

    expect(screen.getByText('No Recurring Hotspots Detected')).toBeInTheDocument();
    expect(screen.getByText(/None of your topics have reached 2 repeated mistakes/i)).toBeInTheDocument();
  });

  it('renders hotspot cards with topic name, severity, and dominant mistake type', () => {
    render(<RecurringMistakesHotspots hotspots={MOCK_HOTSPOTS} />);

    expect(screen.getByText('Limits and Continuity')).toBeInTheDocument();
    expect(screen.getByText("Newton's Laws of Motion")).toBeInTheDocument();

    expect(screen.getByText('High Recurrence')).toBeInTheDocument();
    expect(screen.getByText('Medium Recurrence')).toBeInTheDocument();

    expect(screen.getByText('Calculation Slip')).toBeInTheDocument();
    expect(screen.getByText('Conceptual Error')).toBeInTheDocument();
  });

  it('triggers onSelectTopic when Filter & Review Mistakes button is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <RecurringMistakesHotspots
        hotspots={MOCK_HOTSPOTS}
        onSelectTopic={handleSelect}
      />,
    );

    const buttons = screen.getAllByRole('button', { name: /Filter & Review Mistakes/i });
    expect(buttons).toHaveLength(2);

    fireEvent.click(buttons[0]);
    expect(handleSelect).toHaveBeenCalledWith('math-calc-limits');
  });
});

