import React from 'react';
import { Link } from 'react-router-dom';
import type { SubjectId, SubjectProgressSummary } from '@/domain/types';
import { Progress } from '@/components/ui/progress';
import {
  Calculator,
  Atom,
  FlaskConical,
  BookA,
  Laptop,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubjectProgressGridProps {
  subjects: Record<SubjectId, SubjectProgressSummary>;
}

const SUBJECT_CONFIG: Record<
  SubjectId,
  {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    borderColor: string;
    indicatorColor: string;
    nameBn: string;
  }
> = {
  math: {
    icon: Calculator,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'hover:border-blue-500/40',
    indicatorColor: 'bg-blue-600 dark:bg-blue-500',
    nameBn: 'গণিত',
  },
  physics: {
    icon: Atom,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'hover:border-purple-500/40',
    indicatorColor: 'bg-purple-600 dark:bg-purple-500',
    nameBn: 'পদার্থ বিজ্ঞান',
  },
  chemistry: {
    icon: FlaskConical,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'hover:border-amber-500/40',
    indicatorColor: 'bg-amber-600 dark:bg-amber-500',
    nameBn: 'রসায়ন',
  },
  english: {
    icon: BookA,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'hover:border-rose-500/40',
    indicatorColor: 'bg-rose-600 dark:bg-rose-500',
    nameBn: 'ইংরেজি',
  },
  cse: {
    icon: Laptop,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'hover:border-emerald-500/40',
    indicatorColor: 'bg-emerald-600 dark:bg-emerald-500',
    nameBn: 'কম্পিউটার সায়েন্স',
  },
};

const SUBJECT_ORDER: SubjectId[] = [
  'math',
  'physics',
  'chemistry',
  'english',
  'cse',
];

export const SubjectProgressGrid: React.FC<SubjectProgressGridProps> = ({
  subjects,
}) => {
  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h3 className='text-base font-semibold text-foreground'>
          Subject-wise Mastery
        </h3>
        <span className='text-xs text-muted-foreground'>5 Core Subjects</span>
      </div>

      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
        {SUBJECT_ORDER.map((subjectId) => {
          const summary = subjects[subjectId];
          const config = SUBJECT_CONFIG[subjectId];
          const Icon = config.icon;

          if (!summary) return null;

          return (
            <Link
              key={subjectId}
              to={`/syllabus?subject=${subjectId}`}
              className={cn(
                'group relative rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between gap-3',
                config.borderColor,
              )}
            >
              <div className='space-y-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-2.5'>
                    <span
                      className={cn(
                        'p-2 rounded-lg',
                        config.bgColor,
                        config.color,
                      )}
                    >
                      <Icon className='h-4 w-4' />
                    </span>
                    <div>
                      <h4 className='text-sm font-semibold text-foreground group-hover:text-primary transition-colors'>
                        {summary.subjectName}
                      </h4>
                      <p className='text-[11px] text-muted-foreground'>
                        {config.nameBn}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className='h-4 w-4 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all' />
                </div>

                <div className='space-y-1.5'>
                  <div className='flex items-baseline justify-between text-xs'>
                    <span className='text-muted-foreground font-medium'>
                      Completion
                    </span>
                    <span className='font-bold text-foreground'>
                      {summary.percentage}%
                    </span>
                  </div>
                  <Progress
                    value={summary.percentage}
                    className='h-2'
                    indicatorClassName={config.indicatorColor}
                  />
                </div>
              </div>

              <div className='pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground'>
                <span className='inline-flex items-center gap-1'>
                  <CheckCircle2 className='h-3 w-3 text-emerald-500' />
                  <span>
                    {summary.completedTopics}/{summary.totalTopics} mastered
                  </span>
                </span>
                <span>{summary.inProgressTopics} learning</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
