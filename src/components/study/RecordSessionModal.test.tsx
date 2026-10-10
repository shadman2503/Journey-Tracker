import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RecordSessionModal } from './RecordSessionModal';
import { useStudySessionStore } from '@/stores/useStudySessionStore';

// Mock repositories
vi.mock('@/repositories/dexie', () => ({
  studySessionRepo: {
    getAll: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue(1),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/repositories/syllabusRepository', () => ({
  syllabusRepository: {
    getTopicsBySubject: vi.fn().mockImplementation((sub: string) => {
      if (sub === 'math') {
        return Promise.resolve([
          { id: 'math-1', name: 'Complex Numbers', subjectId: 'math', section: 'Alg', chapter: 'C1', order: 1 },
          { id: 'math-2', name: 'Quadratic Equations', subjectId: 'math', section: 'Alg', chapter: 'C2', order: 2 },
        ]);
      }
      return Promise.resolve([
        { id: 'phys-1', name: 'Vectors', subjectId: 'physics', section: 'Mech', chapter: 'C1', order: 1 },
      ]);
    }),
  },
}));

describe('RecordSessionModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStudySessionStore.setState({
      sessions: [],
      loaded: true,
      isLoading: false,
      isRecordModalOpen: false,
      prefilledSubjectId: undefined,
      prefilledTopicId: undefined,
    });
  });

  it('renders modal dialog when open with form controls', async () => {
    render(<RecordSessionModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Record Study Session/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Topic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date Studied/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Questions Solved/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correct Answers/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Complex Numbers')).toBeInTheDocument();
    });
  });

  it('does not render when isOpen is false', () => {
    render(<RecordSessionModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('updates duration when a quick preset button is clicked', async () => {
    render(<RecordSessionModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Complex Numbers')).toBeInTheDocument();
    });

    const preset60 = screen.getByRole('button', { name: '60m' });
    fireEvent.click(preset60);

    const durationInput = screen.getByLabelText(/Duration/i) as HTMLInputElement;
    expect(durationInput.value).toBe('60');
  });

  it('updates accuracy preview when questions and correct answers change', async () => {
    render(<RecordSessionModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Complex Numbers')).toBeInTheDocument();
    });

    const questionsInput = screen.getByLabelText(/Questions Solved/i);
    const correctInput = screen.getByLabelText(/Correct Answers/i);

    fireEvent.change(questionsInput, { target: { value: '20' } });
    fireEvent.change(correctInput, { target: { value: '15' } });

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('validates that correct answers cannot exceed questions solved', async () => {
    render(<RecordSessionModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Complex Numbers')).toBeInTheDocument();
    });

    const questionsInput = screen.getByLabelText(/Questions Solved/i);
    const correctInput = screen.getByLabelText(/Correct Answers/i);

    fireEvent.change(questionsInput, { target: { value: '10' } });
    fireEvent.change(correctInput, { target: { value: '15' } });

    const submitBtn = screen.getByRole('button', { name: /Record Session/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Correct answers cannot exceed total questions solved/i)
      ).toBeInTheDocument();
    });
  });

  it('submits valid session and calls onSaved callback', async () => {
    const onSaved = vi.fn();
    const onClose = vi.fn();

    render(<RecordSessionModal isOpen={true} onClose={onClose} onSaved={onSaved} />);

    await waitFor(() => {
      expect(screen.getByText('Complex Numbers')).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: /Record Session/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
