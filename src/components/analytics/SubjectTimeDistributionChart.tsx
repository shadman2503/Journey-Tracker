import React from 'react';
import type { SubjectTimeAllocation } from '@/domain/longTermAnalytics';
import { PieChart, Clock, Target, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubjectId } from '@/domain/types';

export interface SubjectTimeDistributionChartProps {
  data: SubjectTimeAllocation[];
  className?: string;
}

const SUBJECT_COLOR_MAP: Record<
  SubjectId,
  { bg: string; text: string; bar: string }
> = {
  math: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    bar: 'bg-blue-500',
  },
  physics: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    bar: 'bg-indigo-500',
  },
  chemistry: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    bar: 'bg-amber-500',
  },
  english: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    bar: 'bg-rose-500',
  },
  cse: {
    bg: 'bg-teal-500/10',
    text: 'text-teal-600 dark:text-teal-400',
    bar: 'bg-teal-500',
  },
};

export const SubjectTimeDistributionChart: React.FC<
  SubjectTimeDistributionChartProps
> = ({ data, className }) => {
  const totalMinutes = data.reduce((acc, curr) => acc + curr.minutes, 0);

  if (!data || totalMinutes === 0) {
    return (
      <div
        data-testid='subject-time-distribution-empty'
        className={cn(
          'flex flex-col items-center justify-center h-[280px] rounded-xl border border-dashed bg-muted/20 text-center p-6 space-y-2',
          className,
        )}
      >
        <PieChart className='h-8 w-8 text-muted-foreground' />
        <h4 className='text-sm font-semibold text-foreground'>
          No Study Time Logged
        </h4>
        <p className='text-xs text-muted-foreground max-w-xs'>
          Record study sessions to monitor how your preparation hours are
          distributed across subjects against DUET exam targets.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid='subject-time-distribution-chart'
      className={cn('space-y-4', className)}
    >
      <div className='flex items-center justify-between pb-1'>
        <div className='flex items-center gap-2'>
          <div className='p-2 rounded-lg bg-primary/10 text-primary'>
            <Clock className='h-4 w-4' />
          </div>
          <div>
            <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Subject Time Balance
            </span>
            <div className='text-sm font-bold text-foreground'>
              Actual prep time vs DUET benchmark weighting
            </div>
          </div>
        </div>
        <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
          <Target className='h-3.5 w-3.5 text-primary' />
          <span>Benchmark targets shown as markers</span>
        </div>
      </div>

      {/* Subject rows */}
      <div className='space-y-3.5 pt-1'>
        {data.map((item) => {
          const colors = SUBJECT_COLOR_MAP[item.subjectId];
          const isUnderinvested =
            totalMinutes > 120 &&
            item.percentage < item.targetBenchmarkPercentage - 8;

          return (
            <div
              key={item.subjectId}
              data-testid={`subject-time-row-${item.subjectId}`}
              className='p-3 rounded-xl border bg-card/60 shadow-xs space-y-2'
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span
                    className={cn(
                      'text-xs font-bold px-2 py-0.5 rounded-md',
                      colors.bg,
                      colors.text,
                    )}
                  >
                    {item.subjectName}
                  </span>
                  {isUnderinvested && (
                    <span
                      title='Prep time is below target DUET allocation'
                      className='inline-flex items-center gap-1 text-[10px] text-amber-500 font-medium'
                    >
                      <AlertCircle className='h-3 w-3' />
                      Under target
                    </span>
                  )}
                </div>
                <div className='text-xs text-muted-foreground flex items-center gap-2'>
                  <span className='font-bold text-foreground'>
                    {item.formattedHours}
                  </span>
                  <span>({item.percentage}%)</span>
                  <span className='text-muted-foreground/60'>·</span>
                  <span className='text-[11px]'>
                    Target: {item.targetBenchmarkPercentage}%
                  </span>
                </div>
              </div>

              {/* Comparative Progress Bar with Target Benchmark Indicator */}
              <div className='relative w-full h-2.5 bg-muted rounded-full overflow-hidden'>
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    colors.bar,
                  )}
                  style={{ width: `${Math.min(100, item.percentage)}%` }}
                />
                {/* Target benchmark pin */}
                <div
                  className='absolute top-0 bottom-0 w-0.5 bg-foreground/60 z-10'
                  style={{ left: `${item.targetBenchmarkPercentage}%` }}
                  title={`Target: ${item.targetBenchmarkPercentage}%`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
