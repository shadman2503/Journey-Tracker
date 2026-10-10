import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StudyLogPage } from './StudyLogPage';
import { useStudySessionStore } from '@/stores/useStudySessionStore';
import type { StudySession, SyllabusTopic } from '@/domain/types';

vi.mock('@/repositories/dexie', () => ({
  studySessionRepo: {
    getAll: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue(1),
    delete: vi.fn().mockResolvedValue(undefined),
  },
  topicProgressRepo: {
    getAll: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockTopics: SyllabusTopic[] = [
  {
    id: 'math-alg-complex',
    name: 'Complex Numbers',
    subjectId: 'math',
    section: 'Algebra',
    chapter: 'Ch 1',
    order: 1,
  },
  {
    id: 'phys-vector',
    name: 'Vectors',
    subjectId: 'physics',
    section: 'Mechanics',
    chapter: 'Ch 2',
    order: 1,
  },
  {
    id: 'chem-atomic',
    name: 'Atomic Structure',
    subjectId: 'chemistry',
    section: 'Inorganic',
    chapter: 'Ch 1',
    order: 1,
  },
];

vi.mock('@/repositories/syllabusRepository', () => ({
  syllabusRepository: {
    getAllTopics: vi.fn().mockImplementation(() => Promise.resolve(mockTopics)),
    getTopicsBySubject: vi.fn().mockImplementation((sub: string) =>
      Promise.resolve(mockTopics.filter((t) => t.subjectId === sub))
    ),
  },
}));

describe('StudyLogPage', () => {
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

  it('renders page header and empty state when no sessions are recorded', async () => {
    render(
      <MemoryRouter>
        <StudyLogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Study Session History')).toBeInTheDocument();
      expect(screen.getByText('No study sessions recorded yet')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Record Your First Session/i })
      ).toBeInTheDocument();
    });
  });

  it('renders session cards and calculated summary metric cards', async () => {
    const mockSessions: StudySession[] = [
      {
        id: 1,
        date: '2026-10-10',
        subjectId: 'math',
        topicId: 'math-alg-complex',
        durationMinutes: 60,
        questionsSolved: 20,
        correctAnswers: 16,
        notes: 'Euler identity review',
        createdAt: '',
      },
      {
        id: 2,
        date: '2026-10-09',
        subjectId: 'physics',
        topicId: 'phys-vector',
        durationMinutes: 45,
        questionsSolved: 10,
        correctAnswers: 9,
        notes: 'Dot and cross product',
        createdAt: '',
      },
    ];

    useStudySessionStore.setState({
      sessions: mockSessions,
      loaded: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <StudyLogPage />
      </MemoryRouter>
    );

    // Summary cards
    expect(screen.getByText('Logged Sessions')).toBeInTheDocument();
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1); // total session count & filter badge
    expect(screen.getByText('1.8 hrs')).toBeInTheDocument(); // 105 mins = 1.75 -> 1.8 hrs
    expect(screen.getByText('30')).toBeInTheDocument(); // 30 questions solved

    // Cards rendered with topic titles from topicsMap
    await waitFor(() => {
      expect(screen.getByText('Complex Numbers')).toBeInTheDocument();
      expect(screen.getByText('Vectors')).toBeInTheDocument();
      expect(screen.getByText('Euler identity review')).toBeInTheDocument();
    });
  });

  it('filters sessions by subject tab', async () => {
    const mockSessions: StudySession[] = [
      {
        id: 1,
        date: '2026-10-10',
        subjectId: 'math',
        topicId: 'math-alg-complex',
        durationMinutes: 60,
        questionsSolved: 20,
        correctAnswers: 16,
        createdAt: '',
      },
      {
        id: 2,
        date: '2026-10-09',
        subjectId: 'physics',
        topicId: 'phys-vector',
        durationMinutes: 45,
        questionsSolved: 10,
        correctAnswers: 9,
        createdAt: '',
      },
    ];

    useStudySessionStore.setState({
      sessions: mockSessions,
      loaded: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <StudyLogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Complex Numbers')).toBeInTheDocument();
      expect(screen.getByText('Vectors')).toBeInTheDocument();
    });

    // Click Physics tab
    const physicsTab = screen.getByRole('button', { name: /Physics/i });
    fireEvent.click(physicsTab);

    expect(screen.queryByText('Complex Numbers')).not.toBeInTheDocument();
    expect(screen.getByText('Vectors')).toBeInTheDocument();
  });

  it('filters sessions by search query keyword', async () => {
    const mockSessions: StudySession[] = [
      {
        id: 1,
        date: '2026-10-10',
        subjectId: 'math',
        topicId: 'math-alg-complex',
        durationMinutes: 60,
        questionsSolved: 20,
        correctAnswers: 16,
        notes: 'Integration by parts',
        createdAt: '',
      },
      {
        id: 2,
        date: '2026-10-09',
        subjectId: 'physics',
        topicId: 'phys-vector',
        durationMinutes: 45,
        questionsSolved: 10,
        correctAnswers: 9,
        notes: 'Kinematics formulas',
        createdAt: '',
      },
    ];

    useStudySessionStore.setState({
      sessions: mockSessions,
      loaded: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <StudyLogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Complex Numbers')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search topics, chapters, or notes.../i);
    fireEvent.change(searchInput, { target: { value: 'Kinematics' } });

    expect(screen.queryByText('Complex Numbers')).not.toBeInTheDocument();
    expect(screen.getByText('Vectors')).toBeInTheDocument();
  });

  it('shows empty filter state and resets filters on button click', async () => {
    const mockSessions: StudySession[] = [
      {
        id: 1,
        date: '2026-10-10',
        subjectId: 'math',
        topicId: 'math-alg-complex',
        durationMinutes: 60,
        questionsSolved: 20,
        correctAnswers: 16,
        createdAt: '',
      },
    ];

    useStudySessionStore.setState({
      sessions: mockSessions,
      loaded: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <StudyLogPage />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Search topics, chapters, or notes.../i);
    fireEvent.change(searchInput, { target: { value: 'NonexistentKeywordXYZ' } });

    expect(screen.getByText('No sessions match your filter')).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(screen.getByText('Complex Numbers')).toBeInTheDocument();
    });
  });

  it('opens record study session modal when button is clicked', async () => {
    render(
      <MemoryRouter>
        <StudyLogPage />
      </MemoryRouter>
    );

    const recordBtn = screen.getByRole('button', { name: /Record Study Session/i });
    fireEvent.click(recordBtn);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Record Study Session/i })).toBeInTheDocument();
    });
  });

  it('confirms and deletes a session', async () => {
    const mockSessions: StudySession[] = [
      {
        id: 42,
        date: '2026-10-10',
        subjectId: 'math',
        topicId: 'math-alg-complex',
        durationMinutes: 60,
        questionsSolved: 20,
        correctAnswers: 16,
        createdAt: '',
      },
    ];

    useStudySessionStore.setState({
      sessions: mockSessions,
      loaded: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <StudyLogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Complex Numbers')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole('button', { name: /Delete study session/i });
    fireEvent.click(deleteBtn);

    expect(screen.getByText('Delete this session record?')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(useStudySessionStore.getState().sessions.length).toBe(0);
    });
  });

  it('renders streak badge in header when active streak exists', async () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    useStudySessionStore.setState({
      sessions: [
        {
          id: 1,
          date: todayStr,
          subjectId: 'math',
          topicId: 'math-alg-complex',
          durationMinutes: 45,
          questionsSolved: 10,
          correctAnswers: 9,
          createdAt: '',
        },
      ],
      loaded: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <StudyLogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('1d Streak')).toBeInTheDocument();
    });
  });
});
