import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import { useTopicProgressStore } from '@/stores/useTopicProgressStore';
import { useCountdownStore } from '@/stores/useCountdownStore';
import { useStudySessionStore } from '@/stores/useStudySessionStore';
import { useMockTestStore } from '@/stores/useMockTestStore';
import { useMistakeStore } from '@/stores/useMistakeStore';

vi.mock('@/repositories/dexie', () => ({
  topicProgressRepo: {
    getAll: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
  },
  studySessionRepo: {
    getAll: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue(1),
    delete: vi.fn().mockResolvedValue(undefined),
  },
  mockTestRepo: {
    getAll: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue(1),
    delete: vi.fn().mockResolvedValue(undefined),
  },
  mistakeRepo: {
    getAll: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue(1),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  },
  milestoneRepo: {
    getAll: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue(1),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    useTopicProgressStore.setState({
      progressMap: {},
      loaded: true,
      isLoading: false,
    });
    useCountdownStore.getState().resetToDefault();
    useStudySessionStore.setState({
      sessions: [],
      loaded: true,
      isLoading: false,
      isRecordModalOpen: false,
      prefilledSubjectId: undefined,
      prefilledTopicId: undefined,
    });
    useMockTestStore.setState({
      tests: [],
      loaded: true,
      isLoading: false,
      isRecordModalOpen: false,
    });
    useMistakeStore.setState({
      mistakes: [],
      loaded: true,
      isLoading: false,
    });
  });

  it('renders dashboard title and top metric cards', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText('DUET 2027 Journey Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Overall Completion')).toBeInTheDocument();
    expect(screen.getByText('Current Streak')).toBeInTheDocument();
    expect(screen.getByText('Questions Solved')).toBeInTheDocument();
    expect(screen.getByText('Study Time')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/161 topics/i)).toBeInTheDocument();
    });
  });

  it('renders syllabus progress overview section and all 5 subject cards', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Syllabus Progress Overview')).toBeInTheDocument();
    expect(screen.getByText('Overall Syllabus Mastery')).toBeInTheDocument();
    expect(screen.getByText('Subject-wise Mastery')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
      expect(screen.getByText('Physics')).toBeInTheDocument();
      expect(screen.getByText('Chemistry')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Computer Science & Engineering')).toBeInTheDocument();
    });
  });

  it('updates overall completion when topics have progress', async () => {
    useTopicProgressStore.setState({
      progressMap: {
        'math-alg-complex': {
          topicId: 'math-alg-complex',
          status: 'strong',
          updatedAt: '',
        },
      },
      loaded: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // 1 strong topic out of 161 total topics = ~1%
      expect(screen.getByText('1 of 161 topics mastered')).toBeInTheDocument();
    });
  });

  it('contains navigation links to syllabus subjects', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const mathLink = screen.getByRole('link', { name: /Mathematics/i });
      expect(mathLink).toHaveAttribute('href', '/syllabus?subject=math');

      const physicsLink = screen.getByRole('link', { name: /Physics/i });
      expect(physicsLink).toHaveAttribute('href', '/syllabus?subject=physics');
    });
  });

  it('renders DUET countdown banner with digits and labels', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('DUET Admission Test 2027')).toBeInTheDocument();
      expect(screen.getByText('Days')).toBeInTheDocument();
      expect(screen.getByText('Hours')).toBeInTheDocument();
      expect(screen.getByText('Minutes')).toBeInTheDocument();
      expect(screen.getByText('Seconds')).toBeInTheDocument();
      expect(screen.getByText('Preparation Journey Timeline')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Edit target exam date/i })).toBeInTheDocument();
    });
  });

  it('opens and closes the target date configuration modal', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    const changeBtn = screen.getByRole('button', { name: /Edit target exam date/i });
    fireEvent.click(changeBtn);

    expect(screen.getByText('Configure Target Exam Date')).toBeInTheDocument();
    expect(screen.getByLabelText(/Event \/ Exam Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Target Admission Date/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText('Configure Target Exam Date')).not.toBeInTheDocument();
    });
  });

  it('opens record study session modal when Record Study Session button is clicked', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    const recordBtn = screen.getByRole('button', { name: /Record Study Session/i });
    expect(recordBtn).toBeInTheDocument();
    fireEvent.click(recordBtn);

    expect(screen.getByRole('heading', { name: /Record Study Session/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Record Study Session/i })).not.toBeInTheDocument();
    });
  });

  it('opens record mock test modal when Record Mock Test button is clicked', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    const recordMockBtn = screen.getByRole('button', { name: /Record Mock Test/i });
    expect(recordMockBtn).toBeInTheDocument();
    fireEvent.click(recordMockBtn);

    expect(screen.getByRole('heading', { name: /Record Mock Test/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Test Name \/ Model Test Title/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Record Mock Test/i })).not.toBeInTheDocument();
    });
  });

  it('renders live questions solved and study time from study session store', async () => {
    useStudySessionStore.setState({
      sessions: [
        {
          id: 1,
          date: '2026-10-10',
          subjectId: 'math',
          topicId: 'math-1',
          durationMinutes: 90,
          questionsSolved: 25,
          correctAnswers: 20,
          createdAt: '',
        },
      ],
      loaded: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('25').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('1.5 hrs').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('80% practice accuracy')).toBeInTheDocument();
      expect(screen.getByText('1 recorded session')).toBeInTheDocument();
    });
  });

  it('renders live study streak status from study session store', async () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    useStudySessionStore.setState({
      sessions: [
        {
          id: 1,
          date: todayStr,
          subjectId: 'math',
          topicId: 'math-1',
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
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('1 day')).toBeInTheDocument();
      expect(screen.getByText('Streak Active')).toBeInTheDocument();
      expect(screen.getByTestId('study-streak-card')).toBeInTheDocument();
    });
  });

  it('renders weak area spotlight widget empty state when no weak areas exist', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Weak Area Radar')).toBeInTheDocument();
      expect(screen.getByText('All Clear')).toBeInTheDocument();
      expect(screen.getByText('No Weak Areas Detected')).toBeInTheDocument();
    });
  });

  it('renders weak area spotlight with flagged topics and handles practice and radar dialog workflows', async () => {
    useTopicProgressStore.setState({
      progressMap: {
        'math-alg-complex': {
          topicId: 'math-alg-complex',
          status: 'needs_revision',
          updatedAt: '2026-08-01T00:00:00.000Z',
        },
      },
      loaded: true,
      isLoading: false,
    });

    useMistakeStore.setState({
      mistakes: [
        {
          id: 1,
          subjectId: 'math',
          topicId: 'math-alg-complex',
          questionRef: 'DUET 2024 Math Q-10',
          whatWentWrong: 'Sign mistake in polar form',
          correctSolution: 'Use r(cos theta + i sin theta)',
          type: 'calculation',
          status: 'unresolved',
          reviewDate: '2026-08-15',
          createdAt: '2026-08-01T00:00:00.000Z',
        },
      ],
      loaded: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    // Wait for topic to be detected as weak area and rendered in spotlight
    await waitFor(() => {
      expect(screen.getAllByText(/Complex Numbers/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/View Full Radar/i)).toBeInTheDocument();
    });

    // Test clicking Practice Topic pre-fills session modal
    const practiceBtn = screen.getByRole('button', { name: /Practice Topic/i });
    fireEvent.click(practiceBtn);

    const sessionState = useStudySessionStore.getState();
    expect(sessionState.isRecordModalOpen).toBe(true);
    expect(sessionState.prefilledSubjectId).toBe('math');
    expect(sessionState.prefilledTopicId).toBe('math-alg-complex');

    // Test opening the full radar modal dialog
    const viewRadarBtn = screen.getByRole('button', { name: /View Full Radar/i });
    fireEvent.click(viewRadarBtn);

    expect(screen.getByText('Weak Area Diagnostic Radar')).toBeInTheDocument();

    // Close the radar dialog
    const closeDialogBtn = screen.getByLabelText(/Close radar dialog/i);
    fireEvent.click(closeDialogBtn);

    expect(screen.queryByText('Weak Area Diagnostic Radar')).not.toBeInTheDocument();
  });

  it('renders revision recommendations spotlight widget empty state when no revisions are due', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Revision Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Up to Date')).toBeInTheDocument();
      expect(screen.getByText('No Revisions Due Today')).toBeInTheDocument();
    });
  });

  it('renders revision recommendations spotlight and handles practice and planner modal workflows', async () => {
    useTopicProgressStore.setState({
      progressMap: {
        'math-alg-complex': {
          topicId: 'math-alg-complex',
          status: 'needs_revision',
          updatedAt: '2026-08-01T00:00:00.000Z',
        },
      },
      loaded: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/View Full Plan/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Urgent Drill/i).length).toBeGreaterThan(0);
    });

    // Test clicking Start Practice pre-fills session modal
    const startPracticeBtn = screen.getAllByRole('button', {
      name: /Start Practice/i,
    })[0];
    fireEvent.click(startPracticeBtn);

    const sessionState = useStudySessionStore.getState();
    expect(sessionState.isRecordModalOpen).toBe(true);
    expect(sessionState.prefilledSubjectId).toBe('math');
    expect(sessionState.prefilledTopicId).toBe('math-alg-complex');

    // Test opening the full revision recommendations modal dialog
    const viewPlanBtn = screen.getByRole('button', { name: /View Full Plan/i });
    fireEvent.click(viewPlanBtn);

    expect(screen.getByText('Smart Revision Recommendations')).toBeInTheDocument();

    // Close the revision recommendations dialog
    const closeDialogBtn = screen.getByLabelText(/Close revision dialog/i);
    fireEvent.click(closeDialogBtn);

    expect(
      screen.queryByText('Smart Revision Recommendations')
    ).not.toBeInTheDocument();
  });

  it('renders journey milestones widget and handles add goal modal workflow', async () => {
    useStudySessionStore.setState({
      sessions: [
        {
          id: 1,
          date: '2026-10-01',
          subjectId: 'math',
          topicId: 'math-1',
          durationMinutes: 45,
          questionsSolved: 60,
          correctAnswers: 50,
          createdAt: '',
        },
      ],
      loaded: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Journey Milestones')).toBeInTheDocument();
      expect(screen.getByText(/Unlocked/i)).toBeInTheDocument();
      expect(screen.getByText('Fifty Questions Down')).toBeInTheDocument();
    });

    // Test opening Add Goal modal from widget
    const addGoalBtn = screen.getByRole('button', { name: /Add Goal/i });
    fireEvent.click(addGoalBtn);

    expect(screen.getByRole('dialog', { name: /Add Custom Milestone/i })).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByRole('dialog', { name: /Add Custom Milestone/i })).not.toBeInTheDocument();
  });

  it('opens record mistake modal when Log Mistake button is clicked in header', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    const logMistakeBtn = screen.getAllByRole('button', { name: /Log Mistake/i })[0];
    expect(logMistakeBtn).toBeInTheDocument();
    fireEvent.click(logMistakeBtn);

    expect(screen.getByRole('heading', { name: /Log New Mistake/i })).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Log New Mistake/i })).not.toBeInTheDocument();
    });
  });

  it('renders mock performance spotlight with test details and trajectory', async () => {
    useMockTestStore.setState({
      tests: [
        {
          id: 1,
          testName: 'DUET Practice Model 1',
          date: '2026-10-01',
          totalQuestions: 100,
          correctAnswers: 75,
          wrongAnswers: 15,
          score: 71.25,
          accuracy: 83.3,
          timeTakenMinutes: 110,
          createdAt: '',
        },
      ],
      loaded: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mock Test Performance')).toBeInTheDocument();
      expect(screen.getByText('DUET Practice Model 1')).toBeInTheDocument();
      expect(screen.getByText(/1 Taken/i)).toBeInTheDocument();
      expect(screen.getByText(/83.3% Accuracy/i)).toBeInTheDocument();
    });
  });

  it('renders mistakes spotlight and launches spaced review modal', async () => {
    useMistakeStore.setState({
      mistakes: [
        {
          id: 1,
          subjectId: 'math',
          topicId: 'math-alg-complex',
          questionRef: 'DUET 2024 Math Q-5',
          whatWentWrong: 'Sign slip during modulus computation',
          correctSolution: '|z| = sqrt(x^2 + y^2)',
          type: 'calculation',
          status: 'unresolved',
          reviewDate: '2026-09-01',
          createdAt: '2026-09-01T10:00:00.000Z',
        },
      ],
      loaded: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mistake Journal & Hotspots')).toBeInTheDocument();
      expect(screen.getByText(/1 Active/i)).toBeInTheDocument();
      expect(screen.getByText(/1 Mistake Due for Review/i)).toBeInTheDocument();
    });

    // Click Start Review
    const startReviewBtn = screen.getByRole('button', { name: /Start Review/i });
    fireEvent.click(startReviewBtn);

    expect(screen.getByText(/Card 1 of 1/i)).toBeInTheDocument();
    expect(screen.getByText('DUET 2024 Math Q-5')).toBeInTheDocument();
  });
});



