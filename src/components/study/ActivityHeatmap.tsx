import React, { useState, useMemo } from 'react';
import { CalendarDays, Clock, BookCheck, TrendingUp } from 'lucide-react';
import type { StudySession } from '@/domain/types';
import {
  generateHeatmapGrid,
  type HeatmapMetric,
  type HeatmapCell,
} from '@/domain/activityHeatmap';
import { cn } from '@/lib/utils';

const SUBJECT_NAME_MAP: Record<string, string> = {
  math: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  english: 'English',
  cse: 'CSE',
};

export type HeatmapTimeRange = '3months' | '6months' | '1year';

export interface ActivityHeatmapProps {
  sessions: StudySession[];
  className?: string;
  defaultTimeRange?: HeatmapTimeRange;
  defaultMetric?: HeatmapMetric;
}

const TIME_RANGE_WEEKS: Record<HeatmapTimeRange, number> = {
  '3months': 14,
  '6months': 26,
  '1year': 52,
};

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  sessions,
  className,
  defaultTimeRange = '6months',
  defaultMetric = 'duration',
}) => {
  const [metric, setMetric] = useState<HeatmapMetric>(defaultMetric);
  const [timeRange, setTimeRange] = useState<HeatmapTimeRange>(defaultTimeRange);
  const [hoveredCell, setHoveredCell] = useState<{
    cell: HeatmapCell;
    x: number;
    y: number;
  } | null>(null);

  const weeksCount = TIME_RANGE_WEEKS[timeRange];

  const { weeks, monthLabels, summary } = useMemo(() => {
    return generateHeatmapGrid(sessions, {
      weeksCount,
      metric,
      weekStartsOn: 0, // Sunday
    });
  }, [sessions, weeksCount, metric]);

  const getIntensityClass = (level: number, isFuture: boolean) => {
    if (isFuture) return 'bg-muted/20 border-transparent opacity-30 cursor-not-allowed';

    switch (level) {
      case 1:
        return 'bg-primary/25 border-primary/35';
      case 2:
        return 'bg-primary/50 border-primary/60';
      case 3:
        return 'bg-primary/75 border-primary/85';
      case 4:
        return 'bg-primary border-primary';
      case 0:
      default:
        return 'bg-muted/40 border-border/40 hover:border-border';
    }
  };

  return (
    <div
      className={cn('rounded-xl border bg-card p-6 shadow-sm space-y-6', className)}
      data-testid="activity-heatmap"
    >
      {/* Heatmap Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Study Activity Heatmap
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Visualizing consistency and volume of preparation sessions over time
          </p>
        </div>

        {/* Controls: Metric Switcher & Time Range Selector */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {/* Metric Switcher */}
          <div className="inline-flex rounded-lg border bg-muted/40 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setMetric('duration')}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors',
                metric === 'duration'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-label="Filter by study duration"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Time</span>
            </button>
            <button
              type="button"
              onClick={() => setMetric('questions')}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors',
                metric === 'questions'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-label="Filter by questions solved"
            >
              <BookCheck className="h-3.5 w-3.5" />
              <span>Questions</span>
            </button>
          </div>

          {/* Time Range Pills */}
          <div className="inline-flex rounded-lg border bg-muted/40 p-0.5 text-xs">
            {(
              [
                { id: '3months', label: '3M' },
                { id: '6months', label: '6M' },
                { id: '1year', label: '1Y' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeRange(t.id)}
                className={cn(
                  'px-2.5 py-1 rounded-md font-medium transition-colors',
                  timeRange === t.id
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                aria-label={`Show ${t.label} range`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Metrics Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border bg-muted/20 p-3">
          <span className="text-[11px] font-medium text-muted-foreground">Active Days</span>
          <div className="text-xl font-bold mt-0.5 text-foreground">
            {summary.totalActiveDays}
          </div>
          <span className="text-[10px] text-muted-foreground">Days with study logs</span>
        </div>

        <div className="rounded-lg border bg-muted/20 p-3">
          <span className="text-[11px] font-medium text-muted-foreground">Total Study Time</span>
          <div className="text-xl font-bold mt-0.5 text-foreground">
            {summary.totalHoursFormatted}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {summary.totalMinutes} total minutes
          </span>
        </div>

        <div className="rounded-lg border bg-muted/20 p-3">
          <span className="text-[11px] font-medium text-muted-foreground">Problems Solved</span>
          <div className="text-xl font-bold mt-0.5 text-foreground">
            {summary.totalQuestions}
          </div>
          <span className="text-[10px] text-muted-foreground">Practice questions</span>
        </div>

        <div className="rounded-lg border bg-muted/20 p-3">
          <span className="text-[11px] font-medium text-muted-foreground">Daily Average</span>
          <div className="text-xl font-bold mt-0.5 text-foreground">
            {summary.averageMinutesPerActiveDay}m
          </div>
          <span className="text-[10px] text-muted-foreground">Per active day</span>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="relative overflow-x-auto pb-2 pt-1">
        <div className="inline-block min-w-full">
          {/* Month Labels Header */}
          <div className="flex text-[11px] text-muted-foreground font-medium mb-1.5 pl-7 select-none">
            {weeks.map((_, weekIdx) => {
              const monthLabel = monthLabels.find((m) => m.weekIndex === weekIdx);
              return (
                <div
                  key={`month-${weekIdx}`}
                  className="w-3.5 mr-1 text-left whitespace-nowrap"
                >
                  {monthLabel ? <span>{monthLabel.label}</span> : null}
                </div>
              );
            })}
          </div>

          {/* Grid Rows (Days 0 to 6 with Weekday Labels on Left) */}
          <div className="flex">
            {/* Weekday labels */}
            <div className="flex flex-col justify-between text-[9px] text-muted-foreground font-mono pr-2 select-none h-[116px]">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-1" data-testid="heatmap-weeks-container">
              {weeks.map((week, weekIdx) => (
                <div key={`week-${weekIdx}`} className="flex flex-col gap-1">
                  {week.map((cell) => {
                    const intensityClass = getIntensityClass(cell.intensity, cell.isFuture);
                    return (
                      <div
                        key={cell.date}
                        tabIndex={cell.isFuture ? -1 : 0}
                        data-testid={`heatmap-cell-${cell.date}`}
                        className={cn(
                          'h-3.5 w-3.5 rounded-[2px] border transition-colors cursor-pointer',
                          intensityClass,
                          cell.isToday && 'ring-1 ring-primary ring-offset-1 ring-offset-background',
                        )}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCell({
                            cell,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        onFocus={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCell({
                            cell,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onBlur={() => setHoveredCell(null)}
                        aria-label={`${cell.date}: ${
                          cell.activity
                            ? `${cell.activity.totalMinutes} minutes, ${cell.activity.totalQuestions} questions`
                            : 'No activity'
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Tooltip Card */}
        {hoveredCell && (
          <div
            className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-popover text-popover-foreground border shadow-md rounded-lg p-2.5 text-xs max-w-xs transition-opacity"
            style={{
              left: `${hoveredCell.x}px`,
              top: `${hoveredCell.y - 8}px`,
            }}
            data-testid="heatmap-tooltip"
          >
            <div className="font-semibold text-foreground border-b pb-1 mb-1">
              {new Date(hoveredCell.cell.date + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              {hoveredCell.cell.isToday && ' (Today)'}
            </div>

            {hoveredCell.cell.activity && hoveredCell.cell.activity.sessionCount > 0 ? (
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-primary font-medium">
                  <Clock className="h-3 w-3" />
                  <span>
                    {hoveredCell.cell.activity.totalMinutes}m studied (
                    {hoveredCell.cell.activity.sessionCount}{' '}
                    {hoveredCell.cell.activity.sessionCount === 1 ? 'session' : 'sessions'})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <BookCheck className="h-3 w-3" />
                  <span>
                    {hoveredCell.cell.activity.totalQuestions} questions (
                    {hoveredCell.cell.activity.totalCorrect} correct)
                  </span>
                </div>

                {hoveredCell.cell.activity.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {hoveredCell.cell.activity.subjects.map((sub) => (
                      <span
                        key={sub}
                        className="px-1.5 py-0.2 rounded text-[9px] bg-muted font-medium text-foreground"
                      >
                        {SUBJECT_NAME_MAP[sub] || sub}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground text-[11px]">No study logged</div>
            )}
          </div>
        )}
      </div>

      {/* Heatmap Footer & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground pt-2 border-t border-border/40">
        <div className="flex items-center gap-1.5 text-[11px]">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span>
            Showing past {weeksCount} weeks • Consistency builds admission readiness
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5" data-testid="heatmap-legend">
          <span className="text-[11px]">Less</span>
          <div className="flex items-center gap-1">
            <div
              className="h-3 w-3 rounded-[2px] bg-muted/40 border border-border/40"
              title="Level 0: No activity"
            />
            <div
              className="h-3 w-3 rounded-[2px] bg-primary/25 border border-primary/35"
              title={metric === 'duration' ? 'Level 1: 1-30 mins' : 'Level 1: 1-15 questions'}
            />
            <div
              className="h-3 w-3 rounded-[2px] bg-primary/50 border border-primary/60"
              title={metric === 'duration' ? 'Level 2: 31-60 mins' : 'Level 2: 16-30 questions'}
            />
            <div
              className="h-3 w-3 rounded-[2px] bg-primary/75 border border-primary/85"
              title={metric === 'duration' ? 'Level 3: 61-120 mins' : 'Level 3: 31-60 questions'}
            />
            <div
              className="h-3 w-3 rounded-[2px] bg-primary border border-primary"
              title={metric === 'duration' ? 'Level 4: >120 mins' : 'Level 4: >60 questions'}
            />
          </div>
          <span className="text-[11px]">More</span>
        </div>
      </div>
    </div>
  );
};
