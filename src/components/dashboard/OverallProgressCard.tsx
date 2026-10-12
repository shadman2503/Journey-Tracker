import React from 'react';
import type { OverallProgressSummary } from '@/domain/types';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  BookOpen,
  AlertCircle,
  Circle,
  TrendingUp,
} from 'lucide-react';

interface OverallProgressCardProps {
  summary: OverallProgressSummary;
}

export const OverallProgressCard: React.FC<OverallProgressCardProps> = ({
  summary,
}) => {
  return (
    <div className='rounded-xl border bg-card p-4 sm:p-5 shadow-sm space-y-4'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <span className='p-1.5 rounded-lg bg-primary/10 text-primary shadow-xs'>
              <TrendingUp className='h-4 w-4' />
            </span>
            <h3 className='text-base font-semibold text-foreground'>
              Overall Syllabus Mastery
            </h3>
          </div>
          <p className='text-xs text-muted-foreground'>
            Weighted progress across all {summary.totalTopics} DUET admission
            topics
          </p>
        </div>
        <div className='flex items-baseline gap-1.5'>
          <span className='text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground'>
            {summary.percentage}%
          </span>
          <span className='text-xs font-medium text-muted-foreground'>
            completed
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className='space-y-1.5'>
        <Progress value={summary.percentage} className='h-2' />
        <div className='flex justify-between text-[11px] text-muted-foreground'>
          <span>0%</span>
          <span>Target: 100% Mastery</span>
        </div>
      </div>

      {/* Status Breakdown Grid */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-border/50'>
        <div className='flex items-center gap-2.5 p-2 rounded-lg bg-primary/5 border border-primary/15'>
          <CheckCircle2 className='h-4 w-4 text-primary flex-shrink-0' />
          <div className='min-w-0'>
            <div className='text-xs text-muted-foreground'>Mastered</div>
            <div className='text-sm font-semibold text-foreground'>
              {summary.completedTopics}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2.5 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10'>
          <BookOpen className='h-4 w-4 text-blue-500 flex-shrink-0' />
          <div className='min-w-0'>
            <div className='text-xs text-muted-foreground'>In Progress</div>
            <div className='text-sm font-semibold text-foreground'>
              {summary.inProgressTopics}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2.5 p-2 rounded-lg bg-rose-500/5 border border-rose-500/10'>
          <AlertCircle className='h-4 w-4 text-rose-500 flex-shrink-0' />
          <div className='min-w-0'>
            <div className='text-xs text-muted-foreground'>Needs Revision</div>
            <div className='text-sm font-semibold text-foreground'>
              {summary.needsRevisionTopics}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2.5 p-2 rounded-lg bg-slate-500/5 border border-slate-500/10'>
          <Circle className='h-4 w-4 text-slate-400 flex-shrink-0' />
          <div className='min-w-0'>
            <div className='text-xs text-muted-foreground'>Not Started</div>
            <div className='text-sm font-semibold text-foreground'>
              {summary.notStartedTopics}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
