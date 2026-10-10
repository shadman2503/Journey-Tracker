import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from './progress';
import { ProgressRing } from '@/components/common/ProgressRing';

describe('Progress component', () => {
  it('renders with accessible role and attributes', () => {
    render(<Progress value={45} max={100} data-testid="test-progress" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-valuenow', '45');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps values between 0 and max', () => {
    const { rerender } = render(<Progress value={150} max={100} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');

    rerender(<Progress value={-20} max={100} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
});

describe('ProgressRing component', () => {
  it('renders SVG progress bar with percentage text', () => {
    render(<ProgressRing percentage={65} />);
    const ring = screen.getByRole('progressbar');
    expect(ring).toBeInTheDocument();
    expect(ring).toHaveAttribute('aria-valuenow', '65');
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('clamps percentage between 0 and 100', () => {
    render(<ProgressRing percentage={120} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});

