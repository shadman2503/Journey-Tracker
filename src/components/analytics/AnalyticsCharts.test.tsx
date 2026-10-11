import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MockScoreTrendChart } from './MockScoreTrendChart';
import { AccuracyTrendChart } from './AccuracyTrendChart';
import { SubjectBreakdownChart } from './SubjectBreakdownChart';
import type {
  MockTrendPoint,
  PracticeTrendPoint,
  SubjectPerformanceBreakdown,
} from '@/domain/performanceAnalytics';

describe('Analytics Chart Components', () => {
  describe('MockScoreTrendChart', () => {
    const mockTrendData: MockTrendPoint[] = [
      {
        id: 1,
        testName: 'Model Test 01',
        date: '2026-10-01',
        formattedDate: 'Oct 1',
        score: 65.5,
        accuracy: 72.8,
        totalQuestions: 100,
        correctAnswers: 70,
        wrongAnswers: 18,
        subjectId: undefined,
        subjectName: 'Full Syllabus',
      },
      {
        id: 2,
        testName: 'Model Test 02',
        date: '2026-10-05',
        formattedDate: 'Oct 5',
        score: 74.0,
        accuracy: 80.0,
        totalQuestions: 100,
        correctAnswers: 78,
        wrongAnswers: 16,
        subjectId: undefined,
        subjectName: 'Full Syllabus',
      },
    ];

    it('renders empty state when data is empty', () => {
      render(<MockScoreTrendChart data={[]} />);
      expect(screen.getByText('No Mock Score Data')).toBeInTheDocument();
      expect(
        screen.getByText(/Record mock tests to unlock your historical score progression curve/),
      ).toBeInTheDocument();
    });

    it('renders chart container and benchmark line info when data is provided', () => {
      render(<MockScoreTrendChart data={mockTrendData} targetBenchmark={70} />);
      expect(screen.getByTestId('mock-score-trend-chart')).toBeInTheDocument();
      expect(screen.getByText('Score Progression')).toBeInTheDocument();
      expect(screen.getByText('Target Benchmark: 70')).toBeInTheDocument();
    });
  });

  describe('AccuracyTrendChart', () => {
    const mockPracticeData: PracticeTrendPoint[] = [
      {
        date: '2026-10-01',
        formattedDate: 'Oct 1',
        questionsSolved: 30,
        correctAnswers: 24,
        accuracy: 80.0,
        durationMinutes: 45,
      },
    ];

    const mockTestData: MockTrendPoint[] = [
      {
        id: 1,
        testName: 'Math Mock 01',
        date: '2026-10-02',
        formattedDate: 'Oct 2',
        score: 68.0,
        accuracy: 75.0,
        totalQuestions: 80,
        correctAnswers: 60,
        wrongAnswers: 20,
        subjectId: 'math',
        subjectName: 'Mathematics',
      },
    ];

    it('renders empty state when data is empty', () => {
      render(<AccuracyTrendChart practiceData={[]} mockData={[]} />);
      expect(screen.getByText('No Accuracy Data')).toBeInTheDocument();
      expect(
        screen.getByText(/Log practice questions or mock tests to monitor your accuracy trends/),
      ).toBeInTheDocument();
    });

    it('renders accuracy trend chart and benchmark target', () => {
      render(
        <AccuracyTrendChart
          practiceData={mockPracticeData}
          mockData={mockTestData}
          benchmarkAccuracy={75}
        />,
      );
      expect(screen.getByTestId('accuracy-trend-chart')).toBeInTheDocument();
      expect(screen.getByText('Accuracy Comparison')).toBeInTheDocument();
      expect(screen.getByText('Target: 75%')).toBeInTheDocument();
    });
  });

  describe('SubjectBreakdownChart', () => {
    const emptyBreakdown: SubjectPerformanceBreakdown[] = [
      {
        subjectId: 'math',
        subjectName: 'Mathematics',
        studySessionsCount: 0,
        practiceQuestions: 0,
        practiceAccuracy: 0,
        mockTestsCount: 0,
        mockAverageScore: 0,
        mockAverageAccuracy: 0,
      },
      {
        subjectId: 'physics',
        subjectName: 'Physics',
        studySessionsCount: 0,
        practiceQuestions: 0,
        practiceAccuracy: 0,
        mockTestsCount: 0,
        mockAverageScore: 0,
        mockAverageAccuracy: 0,
      },
    ];

    const activeBreakdown: SubjectPerformanceBreakdown[] = [
      {
        subjectId: 'math',
        subjectName: 'Mathematics',
        studySessionsCount: 3,
        practiceQuestions: 80,
        practiceAccuracy: 85.0,
        mockTestsCount: 2,
        mockAverageScore: 72.5,
        mockAverageAccuracy: 78.0,
      },
      {
        subjectId: 'physics',
        subjectName: 'Physics',
        studySessionsCount: 1,
        practiceQuestions: 30,
        practiceAccuracy: 70.0,
        mockTestsCount: 1,
        mockAverageScore: 60.0,
        mockAverageAccuracy: 65.0,
      },
      {
        subjectId: 'chemistry',
        subjectName: 'Chemistry',
        studySessionsCount: 0,
        practiceQuestions: 0,
        practiceAccuracy: 0,
        mockTestsCount: 0,
        mockAverageScore: 0,
        mockAverageAccuracy: 0,
      },
      {
        subjectId: 'english',
        subjectName: 'English',
        studySessionsCount: 0,
        practiceQuestions: 0,
        practiceAccuracy: 0,
        mockTestsCount: 0,
        mockAverageScore: 0,
        mockAverageAccuracy: 0,
      },
      {
        subjectId: 'cse',
        subjectName: 'Computer Science',
        studySessionsCount: 0,
        practiceQuestions: 0,
        practiceAccuracy: 0,
        mockTestsCount: 0,
        mockAverageScore: 0,
        mockAverageAccuracy: 0,
      },
    ];

    it('renders empty state when all subjects have zero practice and zero mock tests', () => {
      render(<SubjectBreakdownChart data={emptyBreakdown} />);
      expect(screen.getByText('No Subject Performance Data')).toBeInTheDocument();
    });

    it('renders chart and stat cards when there is activity', () => {
      render(<SubjectBreakdownChart data={activeBreakdown} />);
      expect(screen.getByTestId('subject-breakdown-chart')).toBeInTheDocument();
      expect(screen.getByTestId('subject-stat-math')).toBeInTheDocument();
      expect(screen.getByTestId('subject-stat-physics')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('80 Qs')).toBeInTheDocument();
    });
  });
});

