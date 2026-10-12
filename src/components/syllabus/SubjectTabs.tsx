import React from 'react';
import { Calculator, Atom, FlaskConical, BookA, Cpu } from 'lucide-react';
import type { SubjectId, SubjectMeta } from '@/domain/types';
import { cn } from '@/lib/utils';

interface SubjectTabsProps {
  subjects: SubjectMeta[];
  selectedSubjectId: SubjectId;
  onSelectSubject: (id: SubjectId) => void;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Calculator,
  Atom,
  FlaskConical,
  BookA,
  Cpu,
};

export const SubjectTabs: React.FC<SubjectTabsProps> = ({
  subjects,
  selectedSubjectId,
  onSelectSubject,
}) => {
  return (
    <div
      role='tablist'
      aria-label='Syllabus Subjects'
      className='flex items-center gap-2 border-b pb-3 overflow-x-auto no-scrollbar scroll-smooth sm:flex-wrap'
    >
      {subjects.map((subject) => {
        const isSelected = subject.id === selectedSubjectId;
        const Icon = iconMap[subject.iconName] || Calculator;

        return (
          <button
            key={subject.id}
            role='tab'
            aria-selected={isSelected}
            onClick={() => onSelectSubject(subject.id)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all shrink-0 min-h-[40px]',
              isSelected
                ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary hover:text-foreground',
            )}
          >
            <Icon className='h-4 w-4' />
            <span>{subject.name}</span>
            {subject.nameBn && (
              <span
                className={cn(
                  'text-xs opacity-75 hidden sm:inline',
                  isSelected
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground',
                )}
              >
                ({subject.nameBn})
              </span>
            )}
            <span
              className={cn(
                'ml-1 px-1.5 py-0.2 rounded-full text-xs font-semibold',
                isSelected
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {subject.totalTopics}
            </span>
          </button>
        );
      })}
    </div>
  );
};
