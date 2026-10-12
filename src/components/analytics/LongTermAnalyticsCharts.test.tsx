import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CumulativeVolumeChart } from './CumulativeVolumeChart';
import { StudyVelocityChart } from './StudyVelocityChart';
import { SubjectTimeDistributionChart } from './SubjectTimeDistributionChart';
import { MistakeResolutionOverview } from './MistakeResolutionOverview';
import { ConsistencyMetricsCards } from './ConsistencyMetricsCards';
import type {
  CumulativeVolumePoint,
  StudyVelocityPoint,
  SubjectTimeAllocation,
  MistakeResolutionAnalytics,
  PreparationConsistencyMetrics,
} from '@/domain/longTermAnalytics';

describe('Long-Term Analytics Visual Components', () => {
  describe('CumulativeVolumeChart', () => {
    const sampleData: CumulativeVolumePoint[] = [
      {
        date: '2026-10-01',
        formattedDate: 'Oct 1',
        cumulativeHours: 2.5,
        cumulativeQuestions: 60,
        dailyHours: 2.5,
        dailyQuestions: 60,
      },
      {
        date: '2026-10-05',
        formattedDate: 'Oct 5',
        cumulativeHours: 6.0,
        cumulativeQuestions: 150,
        dailyHours: 3.5,
        dailyQuestions: 90,
      },
    ];

    it('renders empty fallback when data is empty', () => {
      render(<CumulativeVolumeChart data={[]} />);
      expect(screen.getByTestId('cumulative-volume-empty')).toBeInTheDocument();
      expect(screen.getByText('No Cumulative Prep Data')).toBeInTheDocument();
    });

    it('renders chart container and latest summary with data', () => {
      render(<CumulativeVolumeChart data={sampleData} />);
      expect(screen.getByTestId('cumulative-volume-chart')).toBeInTheDocument();
      expect(screen.getByText(/Total Preparation Growth/i)).toBeInTheDocument();
      expect(screen.getByText(/6 hrs · 150 questions solved/i)).toBeInTheDocument();
    });

    it('switches metric views between both, hours, and questions', () => {
      render(<CumulativeVolumeChart data={sampleData} />);
      const hoursBtn = screen.getByRole('button', { name: /^Hours$/i });
      fireEvent.click(hoursBtn);
      expect(hoursBtn).toHaveClass('font-semibold');

      const questionsBtn = screen.getByRole('button', { name: /^Questions$/i });
      fireEvent.click(questionsBtn);
      expect(questionsBtn).toHaveClass('font-semibold');
    });
  });

  describe('StudyVelocityChart', () => {
    const sampleData: StudyVelocityPoint[] = [
      {
        periodKey: 'W1',
        label: 'Oct 01 - Oct 07',
        startDate: '2026-10-01',
        endDate: '2026-10-07',
        questionsSolved: 120,
        hoursSpent: 5.5,
        sessionsCount: 4,
        accuracy: 82.5,
      },
    ];

    it('renders empty fallback when data is empty', () => {
      render(<StudyVelocityChart data={[]} />);
      expect(screen.getByTestId('study-velocity-empty')).toBeInTheDocument();
      expect(screen.getByText('No Pacing Velocity Data')).toBeInTheDocument();
    });

    it('renders chart container and average velocity info with data', () => {
      render(<StudyVelocityChart data={sampleData} />);
      expect(screen.getByTestId('study-velocity-chart')).toBeInTheDocument();
      expect(screen.getByText('Weekly Question Velocity')).toBeInTheDocument();
      expect(screen.getByText(/Average 120 questions \/ week/i)).toBeInTheDocument();
    });
  });

  describe('SubjectTimeDistributionChart', () => {
    const sampleData: SubjectTimeAllocation[] = [
      {
        subjectId: 'math',
        subjectName: 'Mathematics',
        minutes: 180,
        hours: 3.0,
        formattedHours: '3 hrs',
        percentage: 50,
        targetBenchmarkPercentage: 30,
      },
      {
        subjectId: 'physics',
        subjectName: 'Physics',
        minutes: 180,
        hours: 3.0,
        formattedHours: '3 hrs',
        percentage: 50,
        targetBenchmarkPercentage: 20,
      },
      {
        subjectId: 'chemistry',
        subjectName: 'Chemistry',
        minutes: 0,
        hours: 0,
        formattedHours: '0m',
        percentage: 0,
        targetBenchmarkPercentage: 15,
      },
      {
        subjectId: 'english',
        subjectName: 'English',
        minutes: 0,
        hours: 0,
        formattedHours: '0m',
        percentage: 0,
        targetBenchmarkPercentage: 10,
      },
      {
        subjectId: 'cse',
        subjectName: 'Computer Science',
        minutes: 0,
        hours: 0,
        formattedHours: '0m',
        percentage: 0,
        targetBenchmarkPercentage: 25,
      },
    ];

    it('renders empty fallback when total minutes is 0', () => {
      const emptyData = sampleData.map((s) => ({ ...s, minutes: 0, percentage: 0 }));
      render(<SubjectTimeDistributionChart data={emptyData} />);
      expect(screen.getByTestId('subject-time-distribution-empty')).toBeInTheDocument();
    });

    it('renders subject rows and benchmark targets when time is logged', () => {
      render(<SubjectTimeDistributionChart data={sampleData} />);
      expect(screen.getByTestId('subject-time-distribution-chart')).toBeInTheDocument();
      expect(screen.getByTestId('subject-time-row-math')).toBeInTheDocument();
      expect(screen.getByTestId('subject-time-row-physics')).toBeInTheDocument();
      expect(screen.getByText('Subject Time Balance')).toBeInTheDocument();
      expect(screen.getByText(/Actual prep time vs DUET benchmark weighting/i)).toBeInTheDocument();
    });
  });

  describe('MistakeResolutionOverview', () => {
    const sampleData: MistakeResolutionAnalytics = {
      totalMistakes: 10,
      resolvedCount: 6,
      reviewingCount: 2,
      unresolvedCount: 2,
      resolutionRate: 60,
      byType: {
        formula: 4,
        calculation: 3,
        conceptual: 3,
      },
      bySubject: {
        math: { total: 5, resolved: 3, unresolved: 2 },
        physics: { total: 3, resolved: 2, unresolved: 1 },
        chemistry: { total: 2, resolved: 1, unresolved: 1 },
        english: { total: 0, resolved: 0, unresolved: 0 },
        cse: { total: 0, resolved: 0, unresolved: 0 },
      },
    };

    it('renders empty fallback when total mistakes is 0', () => {
      render(
        <MistakeResolutionOverview
          data={{
            totalMistakes: 0,
            resolvedCount: 0,
            reviewingCount: 0,
            unresolvedCount: 0,
            resolutionRate: 0,
            byType: {},
            bySubject: {
              math: { total: 0, resolved: 0, unresolved: 0 },
              physics: { total: 0, resolved: 0, unresolved: 0 },
              chemistry: { total: 0, resolved: 0, unresolved: 0 },
              english: { total: 0, resolved: 0, unresolved: 0 },
              cse: { total: 0, resolved: 0, unresolved: 0 },
            },
          }}
        />,
      );
      expect(screen.getByTestId('mistake-resolution-empty')).toBeInTheDocument();
    });

    it('renders resolution percentage and error type tags', () => {
      const handleViewMistakes = vi.fn();
      render(
        <MistakeResolutionOverview
          data={sampleData}
          onViewMistakes={handleViewMistakes}
        />,
      );
      expect(screen.getByTestId('mistake-resolution-overview')).toBeInTheDocument();
      expect(screen.getByText('60% Resolved (6 of 10)')).toBeInTheDocument();
      expect(screen.getByText('Formula')).toBeInTheDocument();
      expect(screen.getByText('Calculation')).toBeInTheDocument();

      const notebookBtn = screen.getByRole('button', { name: /Review Notebook/i });
      fireEvent.click(notebookBtn);
      expect(handleViewMistakes).toHaveBeenCalledTimes(1);
    });
  });

  describe('ConsistencyMetricsCards', () => {
    const sampleMetrics: PreparationConsistencyMetrics = {
      totalActiveDays: 14,
      totalSessions: 22,
      totalHours: 35.5,
      formattedTotalHours: '35.5 hrs',
      averageSessionDurationMinutes: 97,
      questionsPerHour: 28.5,
      averageQuestionsPerDay: 45,
    };

    it('renders all 4 consistency metrics accurately', () => {
      render(<ConsistencyMetricsCards metrics={sampleMetrics} />);
      expect(screen.getByTestId('consistency-metrics-cards')).toBeInTheDocument();
      expect(screen.getByText('Active Study Days')).toBeInTheDocument();
      expect(screen.getByText('14')).toBeInTheDocument();
      expect(screen.getByText('Avg Session Length')).toBeInTheDocument();
      expect(screen.getByText('97 min')).toBeInTheDocument();
      expect(screen.getByText('Solving Pace')).toBeInTheDocument();
      expect(screen.getByText('28.5 q/hr')).toBeInTheDocument();
      expect(screen.getByText('Daily Output')).toBeInTheDocument();
      expect(screen.getByText('45 q/day')).toBeInTheDocument();
    });
  });
});

