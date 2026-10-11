import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MistakePatternInsights } from './MistakePatternInsights';
import type { PatternInsight } from '@/domain/recurringMistakes';

const MOCK_INSIGHTS: PatternInsight[] = [
  {
    id: 'chronic-1',
    type: 'chronic_topic',
    title: 'Chronic Bottleneck: Integration',
    description: '3 mistakes recorded with 2 still unresolved.',
    severity: 'warning',
    topicId: 'math-calc-integration',
    count: 3,
  },
  {
    id: 'dominant-1',
    type: 'dominant_type',
    title: 'Frequent Calculation Slips (50% of errors)',
    description: '4 of your 8 mistakes stem from calculations.',
    severity: 'info',
    count: 4,
  },
];

describe('MistakePatternInsights', () => {
  it('returns null when insights array is empty', () => {
    const { container } = render(<MistakePatternInsights insights={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders insight cards with titles and descriptions', () => {
    render(<MistakePatternInsights insights={MOCK_INSIGHTS} />);

    expect(screen.getByText('Diagnostic Pattern Insights')).toBeInTheDocument();
    expect(screen.getByText('Chronic Bottleneck: Integration')).toBeInTheDocument();
    expect(screen.getByText('3 mistakes recorded with 2 still unresolved.')).toBeInTheDocument();
    expect(
      screen.getByText('Frequent Calculation Slips (50% of errors)'),
    ).toBeInTheDocument();
  });

  it('triggers onSelectTopic when View Topic Mistakes is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <MistakePatternInsights
        insights={MOCK_INSIGHTS}
        onSelectTopic={handleSelect}
      />,
    );

    const button = screen.getByRole('button', { name: /View Topic Mistakes/i });
    fireEvent.click(button);

    expect(handleSelect).toHaveBeenCalledWith('math-calc-integration');
  });
});

