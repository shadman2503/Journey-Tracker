import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnalyticsPage } from './AnalyticsPage';
import { useMockTestStore } from '@/stores/useMockTestStore';
import { useStudySessionStore } from '@/stores/useStudySessionStore';
import { useMistakeStore } from '@/stores/useMistakeStore';
import type { MockTest, StudySession, Mistake } from '@/domain/types';

// Mock repositories
vi.mock('@/repositories/dexie', () => ({
  mockTestRepo: {
    getAll: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue(1),
    delete: vi.fn().mockResolvedValue(undefined),
  },
  studySessionRepo: {
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
}));

vi.mock('@/repositories/syllabusRepository', () => ({
  syllabusRepository: {
    getTopicsBySubject: vi.fn().mockResolvedValue([]),
  },
}));

describe('AnalyticsPage', () => {
  const sampleTests: MockTest[] = [
    {
      id: 1,
      testName: 'Model Test 01',
      date: '2026-10-01',
      subjectId: undefined,
      totalQuestions: 100,
      correctAnswers: 55,
      wrongAnswers: 20,
      score: 50,
      accuracy: 73.3,
      timeTakenMinutes: 120,
      createdAt: '',
    },
    {
      id: 2,
      testName: 'Math Sectional Test 01',
      date: '2026-10-05',
      subjectId: 'math',
      totalQuestions: 30,
      correctAnswers: 22,
      wrongAnswers: 4,
      score: 65,
      accuracy: 84.6,
      timeTakenMinutes: 45,
      createdAt: '',
    },
    {
      id: 3,
      testName: 'Model Test 02',
      date: '2026-10-08',
      subjectId: undefined,
      totalQuestions: 100,
      correctAnswers: 82,
      wrongAnswers: 8,
      score: 80,
      accuracy: 91.1,
      timeTakenMinutes: 110,
      createdAt: '',
    },
  ];

  const sampleSessions: StudySession[] = [
    {
      id: 1,
      date: '2026-10-02',
      subjectId: 'math',
      topicId: 'math-calc-01',
      durationMinutes: 60,
      questionsSolved: 30,
      correctAnswers: 25,
      createdAt: '',
    },
    {
      id: 2,
      date: '2026-10-06',
      subjectId: 'physics',
      topicId: 'phy-mech-01',
      durationMinutes: 90,
      questionsSolved: 40,
      correctAnswers: 32,
      createdAt: '',
    },
  ];

  const sampleMistakes: Mistake[] = [
    {
      id: 1,
      subjectId: 'math',
      topicId: 'math-calc-01',
      questionRef: 'Q1',
      whatWentWrong: 'Sign error',
      correctSolution: 'Check sign',
      type: 'calculation',
      status: 'fixed',
      createdAt: '',
    },
    {
      id: 2,
      subjectId: 'physics',
      topicId: 'phy-mech-01',
      questionRef: 'Q2',
      whatWentWrong: 'Formula missed',
      correctSolution: 'Use kinematic eq 3',
      type: 'formula',
      status: 'unresolved',
      createdAt: '',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useMockTestStore.setState({
      tests: [],
      loaded: true,
      isLoading: false,
      isRecordModalOpen: false,
    });
    useStudySessionStore.setState({
      sessions: [],
      loaded: true,
      isLoading: false,
      isRecordModalOpen: false,
    });
    useMistakeStore.setState({
      mistakes: [],
      loaded: true,
      isLoading: false,
      isRecordModalOpen: false,
      editingMistake: null,
    });
  });

  it('renders page header and empty state when no data exists', () => {
    render(<AnalyticsPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /Performance Analytics/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/No Performance Analytics Yet/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Record Practice Session/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Log Mock Test/i }),
    ).toBeInTheDocument();
  });

  it('renders KPI stat cards and trajectory pill when data exists', () => {
    useMockTestStore.setState({
      tests: sampleTests,
      loaded: true,
      isLoading: false,
    });
    useStudySessionStore.setState({
      sessions: sampleSessions,
      loaded: true,
      isLoading: false,
    });
    useMistakeStore.setState({
      mistakes: sampleMistakes,
      loaded: true,
      isLoading: false,
    });

    render(<AnalyticsPage />);

    // KPI Header cards in Performance section
    expect(screen.getByText('Average Mock Score')).toBeInTheDocument();
    expect(screen.getByText('Overall Accuracy')).toBeInTheDocument();
    expect(screen.getByText('Questions Solved')).toBeInTheDocument();
    expect(screen.getByText('Prep Time Logged')).toBeInTheDocument();

    // Trajectory pill (improving)
    expect(screen.getByTestId('trajectory-improving')).toBeInTheDocument();

    // Performance charts containers
    expect(screen.getByTestId('mock-score-trend-chart')).toBeInTheDocument();
    expect(screen.getByTestId('accuracy-trend-chart')).toBeInTheDocument();
    expect(screen.getByTestId('subject-breakdown-chart')).toBeInTheDocument();

    // Long-Term Preparation widgets
    expect(screen.getByTestId('preparation-analytics-section')).toBeInTheDocument();
    expect(screen.getByTestId('consistency-metrics-cards')).toBeInTheDocument();
    expect(screen.getByTestId('cumulative-volume-chart')).toBeInTheDocument();
    expect(screen.getByTestId('study-velocity-chart')).toBeInTheDocument();
    expect(screen.getByTestId('subject-time-distribution-chart')).toBeInTheDocument();
    expect(screen.getByTestId('mistake-resolution-overview')).toBeInTheDocument();
  });

  it('switches between view tabs and filters displayed sections', () => {
    useMockTestStore.setState({
      tests: sampleTests,
      loaded: true,
      isLoading: false,
    });
    useStudySessionStore.setState({
      sessions: sampleSessions,
      loaded: true,
      isLoading: false,
    });

    render(<AnalyticsPage />);

    // Default: Consolidated view shows both sections
    expect(screen.getByTestId('preparation-analytics-section')).toBeInTheDocument();
    expect(screen.getByTestId('performance-analytics-section')).toBeInTheDocument();

    // Switch to Preparation Pacing & Trends
    const prepTab = screen.getByRole('tab', { name: /Preparation Pacing & Trends/i });
    fireEvent.click(prepTab);

    expect(screen.getByTestId('preparation-analytics-section')).toBeInTheDocument();
    expect(screen.queryByTestId('performance-analytics-section')).not.toBeInTheDocument();

    // Switch to Exam & Mock Performance
    const perfTab = screen.getByRole('tab', { name: /Exam & Mock Performance/i });
    fireEvent.click(perfTab);

    expect(screen.queryByTestId('preparation-analytics-section')).not.toBeInTheDocument();
    expect(screen.getByTestId('performance-analytics-section')).toBeInTheDocument();

    // Switch back to Consolidated Overview
    const consolidatedTab = screen.getByRole('tab', { name: /Consolidated Overview/i });
    fireEvent.click(consolidatedTab);

    expect(screen.getByTestId('preparation-analytics-section')).toBeInTheDocument();
    expect(screen.getByTestId('performance-analytics-section')).toBeInTheDocument();
  });

  it('toggles time range filters correctly', () => {
    useMockTestStore.setState({
      tests: sampleTests,
      loaded: true,
      isLoading: false,
    });

    render(<AnalyticsPage />);

    const thirtyDaysTab = screen.getByRole('tab', { name: /Last 30 Days/i });
    expect(thirtyDaysTab).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(thirtyDaysTab);
    expect(thirtyDaysTab).toHaveAttribute('aria-selected', 'true');
  });

  it('toggles subject filter pills correctly', () => {
    useMockTestStore.setState({
      tests: sampleTests,
      loaded: true,
      isLoading: false,
    });

    render(<AnalyticsPage />);

    const mathFilterBtn = screen.getByRole('button', { name: /^Mathematics$/i });
    fireEvent.click(mathFilterBtn);

    // Subject breakdown still visible with filtered data
    expect(screen.getByTestId('subject-breakdown-chart')).toBeInTheDocument();
  });

  it('opens record modals when top action buttons are clicked', () => {
    render(<AnalyticsPage />);

    const recordPracticeBtn = screen.getByRole('button', { name: /Record Practice$/i });
    fireEvent.click(recordPracticeBtn);
    expect(useStudySessionStore.getState().isRecordModalOpen).toBe(true);

    const recordMockBtn = screen.getByRole('button', { name: /Record Mock Test$/i });
    fireEvent.click(recordMockBtn);
    expect(useMockTestStore.getState().isRecordModalOpen).toBe(true);
  });
});
