import React from 'react';
import type { MistakeResolutionAnalytics } from '@/domain/longTermAnalytics';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MistakeResolutionOverviewProps {
  data: MistakeResolutionAnalytics;
  className?: string;
  onViewMistakes?: () => void;
}

const TYPE_LABEL_MAP: Record<string, string> = {
  conceptual: 'Conceptual',
  calculation: 'Calculation',
  formula: 'Formula',
  careless: 'Careless',
  misreading: 'Misreading',
  time_management: 'Time Mgt',
};

export const MistakeResolutionOverview: React.FC<
  MistakeResolutionOverviewProps
> = ({ data, className, onViewMistakes }) => {
  if (!data || data.totalMistakes === 0) {
    return (
      <div
        data-testid='mistake-resolution-empty'
        className={cn(
          'flex flex-col items-center justify-center h-[240px] rounded-xl border border-dashed bg-muted/20 text-center p-6 space-y-2',
          className,
        )}
      >
        <CheckCircle2 className='h-8 w-8 text-emerald-500/60' />
        <h4 className='text-sm font-semibold text-foreground'>
          No Mistakes Logged
        </h4>
        <p className='text-xs text-muted-foreground max-w-xs'>
          Logging mistakes during practice and mock exams will enable resolution
          efficiency tracking and error categorization.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid='mistake-resolution-overview'
      className={cn('space-y-4', className)}
    >
      <div className='flex items-center justify-between pb-1'>
        <div className='flex items-center gap-2'>
          <div className='p-2 rounded-lg bg-rose-500/10 text-rose-500'>
            <AlertTriangle className='h-4 w-4' />
          </div>
          <div>
            <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Mistake Resolution Efficiency
            </span>
            <div className='text-sm font-bold text-foreground'>
              {data.resolutionRate}% Resolved ({data.resolvedCount} of{' '}
              {data.totalMistakes})
            </div>
          </div>
        </div>

        {onViewMistakes && (
          <button
            type='button'
            onClick={onViewMistakes}
            className='text-xs font-semibold text-primary hover:underline'
          >
            Review Notebook →
          </button>
        )}
      </div>

      {/* Resolution Progress Bar */}
      <div className='space-y-1.5'>
        <div className='h-2.5 w-full bg-muted rounded-full overflow-hidden flex'>
          <div
            className='bg-emerald-500 h-full transition-all duration-500'
            style={{
              width: `${(data.resolvedCount / data.totalMistakes) * 100}%`,
            }}
            title={`Resolved: ${data.resolvedCount}`}
          />
          <div
            className='bg-amber-500 h-full transition-all duration-500'
            style={{
              width: `${(data.reviewingCount / data.totalMistakes) * 100}%`,
            }}
            title={`Reviewing: ${data.reviewingCount}`}
          />
          <div
            className='bg-rose-500 h-full transition-all duration-500'
            style={{
              width: `${(data.unresolvedCount / data.totalMistakes) * 100}%`,
            }}
            title={`Unresolved: ${data.unresolvedCount}`}
          />
        </div>
        <div className='flex items-center justify-between text-[11px] text-muted-foreground pt-1'>
          <span className='flex items-center gap-1'>
            <span className='h-2 w-2 rounded-full bg-emerald-500' />
            Fixed ({data.resolvedCount})
          </span>
          <span className='flex items-center gap-1'>
            <span className='h-2 w-2 rounded-full bg-amber-500' />
            Reviewing ({data.reviewingCount})
          </span>
          <span className='flex items-center gap-1'>
            <span className='h-2 w-2 rounded-full bg-rose-500' />
            Unresolved ({data.unresolvedCount})
          </span>
        </div>
      </div>

      {/* Error Type Breakdown Badges */}
      <div className='space-y-2 pt-2 border-t'>
        <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
          Error Categories
        </span>
        <div className='flex flex-wrap gap-1.5'>
          {Object.entries(data.byType).map(([typeKey, count]) => {
            const label = TYPE_LABEL_MAP[typeKey] || typeKey;
            return (
              <span
                key={typeKey}
                className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted border text-foreground'
              >
                <span>{label}</span>
                <span className='px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-bold text-[10px]'>
                  {count}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
