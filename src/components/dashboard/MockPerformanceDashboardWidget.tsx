import React, { useMemo } from 'react';
import {
  Award,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
} from 'lucide-react';
import type { MockTest } from '@/domain/types';
import { calculateMockTestMetrics } from '@/domain/mockTest';
import { calculatePerformanceTrajectory } from '@/domain/performanceAnalytics';
import { Button } from '@/components/ui/button';

interface MockPerformanceDashboardWidgetProps {
  tests: MockTest[];
  onRecordMockTest?: () => void;
  onViewAll?: () => void;
}

export const MockPerformanceDashboardWidget: React.FC<
  MockPerformanceDashboardWidgetProps
> = ({ tests, onRecordMockTest, onViewAll }) => {
  const metrics = useMemo(() => calculateMockTestMetrics(tests), [tests]);
  const trajectory = useMemo(() => calculatePerformanceTrajectory(tests), [tests]);

  // Sort newest first
  const sortedTests = useMemo(() => {
    return [...tests].sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime() ||
        (b.id ?? 0) - (a.id ?? 0),
    );
  }, [tests]);

  const latestTest = sortedTests[0];

  return (
    <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
              Mock Test Performance
              {metrics.totalTests > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  {metrics.totalTests} Taken
                </span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              Exam simulations, negative marking & accuracy benchmarks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRecordMockTest && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRecordMockTest}
              className="h-8 px-2.5 text-xs gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Record Test</span>
            </Button>
          )}

          {onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="h-8 px-2 text-xs gap-1 text-primary hover:text-primary"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {metrics.totalTests === 0 ? (
        <div className="p-6 text-center rounded-lg border border-dashed bg-muted/20">
          <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <h4 className="text-sm font-semibold text-foreground mb-1">
            No Mock Tests Recorded Yet
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-3">
            Simulate exam conditions with timed practice model tests to benchmark your marks, speed, and accuracy.
          </p>
          {onRecordMockTest && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRecordMockTest}
              className="h-8 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Record First Mock Test
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {/* Summary Metric Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-lg bg-background border">
              <span className="text-[11px] text-muted-foreground block font-medium">
                Average Score
              </span>
              <span className="text-base font-bold text-foreground">
                {metrics.averageScore}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-background border">
              <span className="text-[11px] text-muted-foreground block font-medium">
                Average Accuracy
              </span>
              <span className="text-base font-bold text-sky-600 dark:text-sky-400">
                {metrics.averageAccuracy}%
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-background border">
              <span className="text-[11px] text-muted-foreground block font-medium">
                Highest Score
              </span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {metrics.highestScore}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-background border">
              <span className="text-[11px] text-muted-foreground block font-medium">
                Trajectory
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                {trajectory.direction === 'improving' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +{trajectory.deltaScore}
                  </span>
                ) : trajectory.direction === 'declining' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    <TrendingDown className="h-3.5 w-3.5" />
                    {trajectory.deltaScore}
                  </span>
                ) : trajectory.direction === 'stable' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <Minus className="h-3.5 w-3.5" />
                    Stable
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Baseline</span>
                )}
              </div>
            </div>
          </div>

          {/* Latest Test Highlight Card */}
          {latestTest && (
            <div className="p-3.5 rounded-lg border bg-sky-500/5 border-sky-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-bold text-foreground truncate">
                    {latestTest.testName}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    Latest Mock
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="font-semibold text-foreground">
                    Score: {latestTest.score} / {latestTest.totalQuestions}
                  </span>
                  <span>•</span>
                  <span className="text-sky-600 dark:text-sky-400 font-medium">
                    {latestTest.accuracy}% Accuracy
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {latestTest.timeTakenMinutes}m
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 self-end sm:self-center">
                <Calendar className="h-3.5 w-3.5" />
                <span>{latestTest.date}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

