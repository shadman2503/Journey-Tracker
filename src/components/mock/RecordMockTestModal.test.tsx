import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecordMockTestModal } from './RecordMockTestModal';
import { useMockTestStore } from '@/stores/useMockTestStore';

// Mock repository
vi.mock('@/repositories/dexie', () => ({
  mockTestRepo: {
    getAll: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue(101),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

import { mockTestRepo } from '@/repositories/dexie';

describe('RecordMockTestModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMockTestStore.setState({
      tests: [],
      loaded: true,
      isLoading: false,
      isRecordModalOpen: false,
    });
  });

  it('renders modal dialog when open with form controls', () => {
    render(<RecordMockTestModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Record Mock Test/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Test Name \/ Model Test Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Test Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Test Scope \/ Subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total Questions/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correct/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Wrong/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Time Taken \(Minutes\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Notes & Reflections/i)).toBeInTheDocument();
    expect(screen.getByText(/Scoring Preview/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<RecordMockTestModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('updates title when a name preset is clicked', () => {
    render(<RecordMockTestModal isOpen={true} onClose={vi.fn()} />);

    const mathPreset = screen.getByRole('button', { name: 'Math Sectional Test' });
    fireEvent.click(mathPreset);

    const nameInput = screen.getByLabelText(/Test Name \/ Model Test Title/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Math Sectional Test');
  });

  it('updates time taken when a time preset is clicked', () => {
    render(<RecordMockTestModal isOpen={true} onClose={vi.fn()} />);

    const preset60 = screen.getByRole('button', { name: '60m' });
    fireEvent.click(preset60);

    const timeInput = screen.getByLabelText(/Time Taken \(Minutes\)/i) as HTMLInputElement;
    expect(timeInput.value).toBe('60');
  });

  it('live-calculates score, accuracy, and penalties when questions change', () => {
    render(<RecordMockTestModal isOpen={true} onClose={vi.fn()} />);

    const totalInput = screen.getByLabelText(/Total Questions/i);
    const correctInput = screen.getByLabelText(/Correct/i);
    const wrongInput = screen.getByLabelText(/Wrong/i);

    // Set 100 total, 80 correct, 20 wrong -> Net score 75.00, Accuracy 80%
    fireEvent.change(totalInput, { target: { value: '100' } });
    fireEvent.change(correctInput, { target: { value: '80' } });
    fireEvent.change(wrongInput, { target: { value: '20' } });

    expect(screen.getByText('75.00')).toBeInTheDocument();
    expect(screen.getByText('+80 - 5.00')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('validates that correct + wrong cannot exceed total questions', async () => {
    render(<RecordMockTestModal isOpen={true} onClose={vi.fn()} />);

    const totalInput = screen.getByLabelText(/Total Questions/i);
    const correctInput = screen.getByLabelText(/Correct/i);
    const wrongInput = screen.getByLabelText(/Wrong/i);

    fireEvent.change(totalInput, { target: { value: '50' } });
    fireEvent.change(correctInput, { target: { value: '40' } });
    fireEvent.change(wrongInput, { target: { value: '15' } }); // 40 + 15 = 55 > 50

    const submitBtn = screen.getByRole('button', { name: /Save Mock Test/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Sum of correct and wrong answers cannot exceed total questions/i),
      ).toBeInTheDocument();
    });
    expect(mockTestRepo.add).not.toHaveBeenCalled();
  });

  it('submits valid mock test and calls store and onSaved callback', async () => {
    const handleSaved = vi.fn();
    const handleClose = vi.fn();

    render(
      <RecordMockTestModal
        isOpen={true}
        onClose={handleClose}
        onSaved={handleSaved}
      />,
    );

    const nameInput = screen.getByLabelText(/Test Name \/ Model Test Title/i);
    fireEvent.change(nameInput, { target: { value: 'DUET Mock Final' } });

    const submitBtn = screen.getByRole('button', { name: /Save Mock Test/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockTestRepo.add).toHaveBeenCalledTimes(1);
      expect(handleSaved).toHaveBeenCalledWith(101);
      expect(handleClose).toHaveBeenCalled();
    });
  });
});

