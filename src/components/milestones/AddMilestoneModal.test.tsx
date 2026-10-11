import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddMilestoneModal } from './AddMilestoneModal';

describe('AddMilestoneModal', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <AddMilestoneModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal dialog when isOpen is true', () => {
    render(
      <AddMilestoneModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />
    );
    expect(screen.getByRole('dialog', { name: /Add Custom Milestone/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Milestone Title \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description \*/i)).toBeInTheDocument();
  });

  it('submits form with validated input and invokes onSubmit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(10);
    const onClose = vi.fn();

    render(
      <AddMilestoneModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />
    );

    fireEvent.change(screen.getByLabelText(/Milestone Title \*/i), {
      target: { value: 'Target: DUET Merit List' },
    });
    fireEvent.change(screen.getByLabelText(/Description \*/i), {
      target: { value: 'Aspirations for securing CSE department' },
    });
    fireEvent.change(screen.getByLabelText(/Date Achieved \*/i), {
      target: { value: '2026-10-15' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Save Milestone/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Target: DUET Merit List',
        description: 'Aspirations for securing CSE department',
        date: '2026-10-15',
        category: 'custom',
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows validation error when title is too short', async () => {
    const onSubmit = vi.fn();

    render(
      <AddMilestoneModal isOpen={true} onClose={vi.fn()} onSubmit={onSubmit} />
    );

    fireEvent.change(screen.getByLabelText(/Milestone Title \*/i), {
      target: { value: 'A' },
    });
    fireEvent.change(screen.getByLabelText(/Description \*/i), {
      target: { value: 'Valid description text' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Save Milestone/i }));

    await waitFor(() => {
      expect(screen.getByText(/Title must be at least 2 characters/i)).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});

