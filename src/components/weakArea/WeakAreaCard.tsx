import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  Target,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import type { WeakAreaTopic, WeakAreaUrgency } from '@/domain/weakArea';
import type { SubjectId } from '@/domain/types';
import { Button } from '@/components/ui/button';

interface WeakAreaCardProps {
  item: WeakAreaTopic;
  onPracticeTopic?: (subjectId: SubjectId, topicId: string) => void;
  onViewMistakes?: (topicId: string) => void;
}

const URGENCY_STYLES: Record<
  WeakAreaUrgency,
  { label: string; badge: string; bar: string; icon: typeof AlertCircle }
> = {
  critical: {
    label: 'Critical Weakness',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    bar: 'bg-rose-500',
    icon: AlertCircle,
  },
  moderate: {
    label: 'Moderate Weakness',
    badge:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    bar: 'bg-amber-500',
    icon: AlertTriangle,
  },
  minor: {
    label: 'Needs Attention',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    bar: 'bg-blue-500',
    icon: Info,
  },
  healthy: {
    label: 'Solid',
    badge: 'bg-primary/10 text-primary border-primary/20',
    bar: 'bg-primary',
    icon: Info,
  },
};

export const WeakAreaCard: React.FC<WeakAreaCardProps> = ({
  item,
  onPracticeTopic,
  onViewMistakes,
}) => {
  const urgencyConfig = URGENCY_STYLES[item.urgency] || URGENCY_STYLES.minor;
  const UrgencyIcon = urgencyConfig.icon;

  return (
    <div className='group flex flex-col justify-between rounded-xl border bg-card p-4 sm:p-4.5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md space-y-3'>
      <div className='space-y-3'>
        {/* Top Meta Badges */}
        <div className='flex items-center justify-between gap-2'>
          <span className='text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border/50'>
            {item.subjectId}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${urgencyConfig.badge}`}
          >
            <UrgencyIcon className='h-3 w-3' />
            <span>{urgencyConfig.label}</span>
          </span>
        </div>

        {/* Topic Title & Hierarchy */}
        <div>
          <h4
            className='text-base font-bold text-foreground tracking-tight line-clamp-1'
            title={item.topicName}
          >
            {item.topicName}
          </h4>
          <p className='text-xs text-muted-foreground line-clamp-1 mt-0.5'>
            {item.section} &bull; {item.chapter}
          </p>
        </div>

        {/* Weakness Severity Score Bar */}
        <div className='space-y-1.5 pt-1'>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-muted-foreground font-medium'>
              Weakness Severity
            </span>
            <span className='font-bold text-foreground'>{item.score}/100</span>
          </div>
          <div className='h-2 w-full rounded-full bg-secondary overflow-hidden'>
            <div
              className={`h-full rounded-full transition-all duration-300 ${urgencyConfig.bar}`}
              style={{ width: `${item.score}%` }}
            />
          </div>
        </div>

        {/* Diagnostic Reason */}
        <div className='p-2.5 rounded-lg bg-secondary/40 border border-border/40 text-xs text-foreground/90 font-medium'>
          <span className='text-muted-foreground font-normal'>Diagnosis: </span>
          {item.primaryReason}
        </div>

        {/* Key Metrics Grid */}
        <div className='grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-secondary/30 text-center text-xs'>
          <div>
            <div className='text-[11px] text-muted-foreground flex items-center justify-center gap-1'>
              <Target className='h-3 w-3' />
              <span>Accuracy</span>
            </div>
            <div className='text-sm font-bold text-foreground mt-0.5'>
              {item.accuracy !== null ? `${item.accuracy}%` : '—'}
            </div>
          </div>
          <div>
            <div className='text-[11px] text-muted-foreground flex items-center justify-center gap-1'>
              <AlertCircle className='h-3 w-3 text-rose-500' />
              <span>Errors</span>
            </div>
            <div className='text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5'>
              {item.unresolvedMistakes}
            </div>
          </div>
          <div>
            <div className='text-[11px] text-muted-foreground flex items-center justify-center gap-1'>
              <Clock className='h-3 w-3' />
              <span>Inactive</span>
            </div>
            <div className='text-sm font-bold text-foreground mt-0.5'>
              {item.daysSinceLastStudied !== null
                ? `${item.daysSinceLastStudied}d`
                : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='pt-2 border-t border-border/40 flex items-center gap-2'>
        {onPracticeTopic && (
          <Button
            size='sm'
            onClick={() => onPracticeTopic(item.subjectId, item.topicId)}
            className='flex-1 text-xs gap-1.5 shadow-xs h-8'
          >
            <BookOpen className='h-3.5 w-3.5' />
            <span>Practice Topic</span>
          </Button>
        )}
        {onViewMistakes && item.totalMistakes > 0 && (
          <Button
            variant='outline'
            size='sm'
            onClick={() => onViewMistakes(item.topicId)}
            className='text-xs gap-1 shadow-xs h-8 px-2.5'
            title='Inspect mistakes in this topic'
          >
            <span>Mistakes ({item.totalMistakes})</span>
            <ArrowRight className='h-3 w-3' />
          </Button>
        )}
      </div>
    </div>
  );
};
