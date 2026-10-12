import React from 'react';
import type { PreparationConsistencyMetrics } from '@/domain/longTermAnalytics';
import { CalendarCheck, Clock, Zap, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConsistencyMetricsCardsProps {
  metrics: PreparationConsistencyMetrics;
  className?: string;
}

export const ConsistencyMetricsCards: React.FC<
  ConsistencyMetricsCardsProps
> = ({ metrics, className }) => {
  return (
    <div
      data-testid='consistency-metrics-cards'
      className={cn('grid gap-4 grid-cols-2 lg:grid-cols-4', className)}
    >
      {/* Metric 1: Active Study Days */}
      <div className='rounded-xl border bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between'>
        <div className='flex items-center justify-between pb-2'>
          <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            Active Study Days
          </span>
          <CalendarCheck className='h-4 w-4 text-primary' />
        </div>
        <div className='space-y-0.5'>
          <div className='text-2xl font-black tracking-tight text-foreground'>
            {metrics.totalActiveDays}
          </div>
          <p className='text-xs text-muted-foreground'>
            {metrics.totalSessions} sessions logged
          </p>
        </div>
      </div>

      {/* Metric 2: Average Session Length */}
      <div className='rounded-xl border bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between'>
        <div className='flex items-center justify-between pb-2'>
          <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            Avg Session Length
          </span>
          <Clock className='h-4 w-4 text-blue-500' />
        </div>
        <div className='space-y-0.5'>
          <div className='text-2xl font-black tracking-tight text-foreground'>
            {metrics.averageSessionDurationMinutes} min
          </div>
          <p className='text-xs text-muted-foreground'>
            Total {metrics.formattedTotalHours} logged
          </p>
        </div>
      </div>

      {/* Metric 3: Question Velocity / Speed */}
      <div className='rounded-xl border bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between'>
        <div className='flex items-center justify-between pb-2'>
          <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            Solving Pace
          </span>
          <Zap className='h-4 w-4 text-amber-500' />
        </div>
        <div className='space-y-0.5'>
          <div className='text-2xl font-black tracking-tight text-foreground'>
            {metrics.questionsPerHour} q/hr
          </div>
          <p className='text-xs text-muted-foreground'>
            Question velocity in practice
          </p>
        </div>
      </div>

      {/* Metric 4: Daily Question Output */}
      <div className='rounded-xl border bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between'>
        <div className='flex items-center justify-between pb-2'>
          <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            Daily Output
          </span>
          <Target className='h-4 w-4 text-primary' />
        </div>
        <div className='space-y-0.5'>
          <div className='text-2xl font-black tracking-tight text-foreground'>
            {metrics.averageQuestionsPerDay} q/day
          </div>
          <p className='text-xs text-muted-foreground'>
            On active preparation days
          </p>
        </div>
      </div>
    </div>
  );
};
