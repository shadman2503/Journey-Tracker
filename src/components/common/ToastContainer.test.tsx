import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastContainer } from './ToastContainer';
import { useToastStore, toast } from '@/stores/useToastStore';

describe('ToastContainer accessibility component', () => {
  beforeEach(() => {
    act(() => {
      useToastStore.getState().clearToasts();
    });
  });

  it('renders empty live region when there are no active toasts', () => {
    render(<ToastContainer />);
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toBeEmptyDOMElement();
  });

  it('renders live region with role="status" and aria-live="polite" when toast is present', () => {
    render(<ToastContainer />);

    act(() => {
      toast.success('Practice session recorded', 0);
    });

    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    expect(screen.getByText('Practice session recorded')).toBeInTheDocument();
  });

  it('removes toast when dismiss button is clicked', () => {
    render(<ToastContainer />);

    act(() => {
      toast.error('Could not save data', 0);
    });
    expect(screen.getByText('Could not save data')).toBeInTheDocument();

    const dismissBtn = screen.getByRole('button', { name: /Dismiss notification/i });
    act(() => {
      fireEvent.click(dismissBtn);
    });

    expect(screen.queryByText('Could not save data')).not.toBeInTheDocument();
  });
});
