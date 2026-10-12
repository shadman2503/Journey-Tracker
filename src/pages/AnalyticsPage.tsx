import React, { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
  Award,
  Target,
  CheckCircle2,
  Clock,
  Plus,
  BarChart2,
  BookOpen,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useStudySessionStore } from '@/stores/useStudySessionStore';
import { useMockTestStore } from '@/stores/useMockTestStore';
import { useMistakeStore } from '@/stores/useMistakeStore';
import type { SubjectId } from '@/domain/types';
import {
  generatePerformanceAnalytics,
  type PerformanceTimeRange,
} from '@/domain/performanceAnalytics';
import { calculateLongTermAnalyticsSummary } from '@/domain/longTermAnalytics';
import { MockScoreTrendChart } from '@/components/analytics/MockScoreTrendChart';
import { AccuracyTrendChart } from '@/components/analytics/AccuracyTrendChart';
import { SubjectBreakdownChart } from '@/components/analytics/SubjectBreakdownChart';
import { CumulativeVolumeChart } from '@/components/analytics/CumulativeVolumeChart';
import { StudyVelocityChart } from '@/components/analytics/StudyVelocityChart';
import { SubjectTimeDistributionChart } from '@/components/analytics/SubjectTimeDistributionChart';
import { MistakeResolutionOverview } from '@/components/analytics/MistakeResolutionOverview';
import { ConsistencyMetricsCards } from '@/components/analytics/ConsistencyMetricsCards';
import { ActivityHeatmap } from '@/components/study/ActivityHeatmap';
import { RecordSessionModal } from '@/components/study/RecordSessionModal';
import { RecordMockTestModal } from '@/components/mock/RecordMockTestModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TimeRangeOption {
  id: PerformanceTimeRange;
  label: string;
}

const TIME_RANGES: TimeRangeOption[] = [
  { id: '30d', label: 'Last 30 Days' },
  { id: '60d', label: 'Last 60 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: 'all', label: 'All Time' },
];

const SUBJECT_OPTIONS: { id: SubjectId | 'all'; label: string }[] = [
  { id: 'all', label: 'All Subjects' },
  { id: 'math', label: 'Mathematics' },
  { id: 'physics', label: 'Physics' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'english', label: 'English' },
  { id: 'cse', label: 'CSE' },
];

type AnalyticsViewTab = 'consolidated' | 'preparation' | 'performance';

export const AnalyticsPage: React.FC = () => {
  const sessions = useStudySessionStore((state) => state.sessions);
  const loadSessions = useStudySessionStore((state) => state.loadSessions);
  const openRecordSession = useStudySessionStore((state) => state.openRecordModal);

  const tests = useMockTestStore((state) => state.tests);
  const loadMockTests = useMockTestStore((state) => state.loadMockTests);
  const openRecordMock = useMockTestStore((state) => state.openRecordModal);

  const mistakes = useMistakeStore((state) => state.mistakes);
  const loadMistakes = useMistakeStore((state) => state.loadMistakes);

  const [viewTab, setViewTab] = useState<AnalyticsViewTab>('consolidated');
  const [timeRange, setTimeRange] = useState<PerformanceTimeRange>('all');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');

  useEffect(() => {
    loadSessions();
    loadMockTests();
    loadMistakes();
  }, [loadSessions, loadMockTests, loadMistakes]);

  // Pure domain performance calculations (Feature 11)
  const performanceAnalytics = useMemo(() => {
    return generatePerformanceAnalytics(sessions, tests, {
      timeRange,
      subjectId: selectedSubject,
    });
  }, [sessions, tests, timeRange, selectedSubject]);

  // Pure domain long-term preparation calculations (Feature 20)
  const longTermSummary = useMemo(() => {
    return calculateLongTermAnalyticsSummary(sessions, tests, mistakes);
  }, [sessions, tests, mistakes]);

  const hasData = sessions.length > 0 || tests.length > 0 || mistakes.length > 0;

  const showPrepSection = viewTab === 'consolidated' || viewTab === 'preparation';
  const showPerfSection = viewTab === 'consolidated' || viewTab === 'performance';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Performance Analytics & Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Consolidated view of preparation velocity, long-term trends, study balance, and exam performance
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openRecordSession()}
            className="gap-1.5 shadow-xs"
          >
            <BookOpen className="h-4 w-4" />
            <span>Record Practice</span>
          </Button>
          <Button
            size="sm"
            onClick={() => openRecordMock()}
            className="gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Record Mock Test</span>
          </Button>
        </div>
      </div>

      {/* Main View Mode Selector Tabs */}
      <div
        className="flex items-center gap-2 border-b border-border/60 pb-3 overflow-x-auto scrollbar-none"
        role="tablist"
        aria-label="Analytics View Mode"
      >
        <button
          type="button"
          role="tab"
          aria-selected={viewTab === 'consolidated'}
          onClick={() => setViewTab('consolidated')}
          className={cn(
            'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
            viewTab === 'consolidated'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Consolidated Overview</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={viewTab === 'preparation'}
          onClick={() => setViewTab('preparation')}
          className={cn(
            'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
            viewTab === 'preparation'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Preparation Pacing & Trends</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={viewTab === 'performance'}
          onClick={() => setViewTab('performance')}
          className={cn(
            'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
            viewTab === 'performance'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <BarChart2 className="h-3.5 w-3.5" />
          <span>Exam & Mock Performance</span>
        </button>
      </div>

      {!hasData ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-2xl bg-card border-dashed space-y-4">
          <div className="p-4 rounded-2xl bg-primary/10 text-primary">
            <BarChart2 className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-lg font-bold text-foreground">No Performance Analytics Yet</h3>
            <p className="text-xs text-muted-foreground">
              Log your study practice sessions and mock tests to visualize score trends, accuracy trajectory, and subject mastery comparisons.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => openRecordSession()}
              className="gap-1.5 shadow-xs"
            >
              <BookOpen className="h-4 w-4" />
              <span>Record Practice Session</span>
            </Button>
            <Button onClick={() => openRecordMock()} className="gap-1.5 shadow-xs">
              <Plus className="h-4 w-4" />
              <span>Log Mock Test</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* SECTION 1: LONG-TERM PREPARATION PACING & CONSISTENCY */}
          {showPrepSection && (
            <div className="space-y-6" data-testid="preparation-analytics-section">
              {viewTab === 'consolidated' && (
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <h2 className="text-base font-bold text-foreground">
                      Preparation Volume & Study Velocity
                    </h2>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Multi-month preparation trajectory
                  </span>
                </div>
              )}

              {/* Consistency KPI Cards */}
              <ConsistencyMetricsCards metrics={longTermSummary.consistencyMetrics} />

              {/* Dual Charts Grid: Cumulative Volume & Weekly Velocity */}
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <div className="rounded-2xl border bg-card p-5 shadow-xs">
                  <CumulativeVolumeChart data={longTermSummary.cumulativeVolume} />
                </div>

                <div className="rounded-2xl border bg-card p-5 shadow-xs">
                  <StudyVelocityChart data={longTermSummary.studyVelocity} />
                </div>
              </div>

              {/* Two-Column Grid: Subject Time Balance & Mistake Resolution Overview */}
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <div className="rounded-2xl border bg-card p-5 shadow-xs">
                  <SubjectTimeDistributionChart
                    data={longTermSummary.subjectTimeDistribution}
                  />
                </div>

                <div className="rounded-2xl border bg-card p-5 shadow-xs">
                  <MistakeResolutionOverview
                    data={longTermSummary.mistakeResolution}
                    onViewMistakes={() => {
                      window.location.href = '/mistakes';
                    }}
                  />
                </div>
              </div>

              {/* Long-Term Activity Heatmap */}
              <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-foreground">
                      Preparation Intensity Heatmap
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Daily study duration and solving volume across your preparation timeline
                    </p>
                  </div>
                </div>
                <ActivityHeatmap sessions={sessions} />
              </div>
            </div>
          )}

          {/* SECTION 2: TEST PERFORMANCE & ACCURACY PROGRESSION */}
          {showPerfSection && (
            <div className="space-y-6" data-testid="performance-analytics-section">
              {viewTab === 'consolidated' && (
                <div className="flex items-center justify-between border-b pb-2 pt-4">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-primary" />
                    <h2 className="text-base font-bold text-foreground">
                      Exam Trajectory & Subject Mastery
                    </h2>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Mock exam benchmarks & accuracy progression
                  </span>
                </div>
              )}

              {/* Filter Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border bg-card/60 shadow-xs">
                {/* Time Range Pills */}
                <div
                  className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none"
                  role="tablist"
                >
                  {TIME_RANGES.map((range) => {
                    const isActive = timeRange === range.id;
                    return (
                      <button
                        key={range.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setTimeRange(range.id)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                          isActive
                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        {range.label}
                      </button>
                    );
                  })}
                </div>

                {/* Subject Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {SUBJECT_OPTIONS.map((sub) => {
                    const isActive = selectedSubject === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSelectedSubject(sub.id)}
                        className={cn(
                          'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                          isActive
                            ? 'bg-secondary text-secondary-foreground font-semibold shadow-xs'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* KPI Stat Cards */}
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {/* Card 1: Average Score & Trajectory */}
                <div className="rounded-xl border bg-card p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Average Mock Score
                    </span>
                    <Award className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-black tracking-tight">
                      {performanceAnalytics.averageMockScore.toFixed(2)}
                    </div>
                    {/* Trajectory Pill */}
                    <div className="pt-1 flex items-center gap-1.5">
                      {performanceAnalytics.trajectory.direction === 'improving' && (
                        <span
                          data-testid="trajectory-improving"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        >
                          <TrendingUp className="h-3 w-3" />
                          +{performanceAnalytics.trajectory.deltaScore} Upward Trend
                        </span>
                      )}
                      {performanceAnalytics.trajectory.direction === 'declining' && (
                        <span
                          data-testid="trajectory-declining"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        >
                          <TrendingDown className="h-3 w-3" />
                          {performanceAnalytics.trajectory.deltaScore} Downward Trend
                        </span>
                      )}
                      {performanceAnalytics.trajectory.direction === 'stable' && (
                        <span
                          data-testid="trajectory-stable"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        >
                          <Minus className="h-3 w-3" />
                          Stable Trajectory
                        </span>
                      )}
                      {performanceAnalytics.trajectory.direction === 'insufficient_data' && (
                        <span
                          data-testid="trajectory-insufficient"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground"
                        >
                          <HelpCircle className="h-3 w-3" />
                          Min. 2 tests needed
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                    {tests.length > 0
                      ? `Personal best: ${performanceAnalytics.highestMockScore.toFixed(2)} marks`
                      : 'No mock tests logged'}
                  </p>
                </div>

                {/* Card 2: Overall Accuracy */}
                <div className="rounded-xl border bg-card p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Overall Accuracy
                    </span>
                    <Target className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-black tracking-tight">
                      {performanceAnalytics.overallPracticeAccuracy}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Practice:{' '}
                      <strong className="text-foreground">
                        {performanceAnalytics.overallPracticeAccuracy}%
                      </strong>{' '}
                      · Mock:{' '}
                      <strong className="text-foreground">
                        {performanceAnalytics.overallMockAccuracy}%
                      </strong>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                    Across{' '}
                    {performanceAnalytics.totalPracticeQuestions +
                      performanceAnalytics.totalMockQuestions}{' '}
                    evaluated questions
                  </p>
                </div>

                {/* Card 3: Questions Solved */}
                <div className="rounded-xl border bg-card p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Questions Solved
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-black tracking-tight">
                      {performanceAnalytics.totalPracticeQuestions +
                        performanceAnalytics.totalMockQuestions}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {performanceAnalytics.totalPracticeQuestions} practice ·{' '}
                      {performanceAnalytics.totalMockQuestions} mock
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                    Solved in syllabus topics & tests
                  </p>
                </div>

                {/* Card 4: Preparation Time */}
                <div className="rounded-xl border bg-card p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Prep Time Logged
                    </span>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-black tracking-tight">
                      {performanceAnalytics.totalHoursFormatted}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {sessions.length} study sessions recorded
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                    Focused prep for DUET 2027
                  </p>
                </div>
              </div>

              {/* Dual Charts Grid: Mock Score Trend & Accuracy Trend */}
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Chart 1: Mock Score Progression */}
                <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">
                      Mock Score Progression
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Historical scores vs DUET competitive benchmark (70 marks)
                    </p>
                  </div>
                  <MockScoreTrendChart
                    data={performanceAnalytics.mockTrend}
                    targetBenchmark={70}
                  />
                </div>

                {/* Chart 2: Accuracy Trends */}
                <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">
                      Accuracy Progression Over Time
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Daily practice accuracy compared with mock test accuracy
                    </p>
                  </div>
                  <AccuracyTrendChart
                    practiceData={performanceAnalytics.practiceTrend}
                    mockData={performanceAnalytics.mockTrend}
                    benchmarkAccuracy={75}
                  />
                </div>
              </div>

              {/* Chart 3: Subject Breakdown */}
              <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">
                    Subject-wise Mastery & Performance
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Comparative accuracy and volume across Mathematics, Physics, Chemistry, English, and CSE
                  </p>
                </div>
                <SubjectBreakdownChart data={performanceAnalytics.subjectBreakdown} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Record Modals */}
      <RecordSessionModal />
      <RecordMockTestModal />
    </div>
  );
};
