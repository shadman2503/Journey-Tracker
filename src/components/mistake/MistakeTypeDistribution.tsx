import React, { useState, useMemo } from 'react';
import { PieChart } from 'lucide-react';
import type { Mistake, SubjectId, MistakeType } from '@/domain/types';
import { ALL_MISTAKE_TYPES, MISTAKE_TYPE_CONFIG } from '@/domain/mistake';

interface MistakeTypeDistributionProps {
  mistakes: Mistake[];
}

const SUBJECT_OPTIONS: { id: SubjectId | 'all'; label: string }[] = [
  { id: 'all', label: 'All Subjects' },
  { id: 'math', label: 'Math' },
  { id: 'physics', label: 'Physics' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'english', label: 'English' },
  { id: 'cse', label: 'CSE' },
];

const TYPE_BAR_COLORS: Record<MistakeType, string> = {
  conceptual: 'bg-purple-500',
  calculation: 'bg-amber-500',
  formula: 'bg-rose-500',
  careless: 'bg-orange-500',
  misreading: 'bg-blue-500',
  time_management: 'bg-zinc-500',
};

export const MistakeTypeDistribution: React.FC<MistakeTypeDistributionProps> = ({
  mistakes,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');

  const filteredMistakes = useMemo(() => {
    if (selectedSubject === 'all') return mistakes;
    return mistakes.filter((m) => m.subjectId === selectedSubject);
  }, [mistakes, selectedSubject]);

  const distribution = useMemo(() => {
    const counts: Record<MistakeType, number> = {
      conceptual: 0,
      calculation: 0,
      formula: 0,
      careless: 0,
      misreading: 0,
      time_management: 0,
    };

    for (const m of filteredMistakes) {
      if (m.type && counts[m.type] !== undefined) {
        counts[m.type] += 1;
      }
    }

    const total = filteredMistakes.length;

    return ALL_MISTAKE_TYPES.map((type) => {
      const count = counts[type];
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        type,
        meta: MISTAKE_TYPE_CONFIG[type],
        count,
        percentage,
        barColor: TYPE_BAR_COLORS[type],
      };
    }).sort((a, b) => b.count - a.count);
  }, [filteredMistakes]);

  const totalFiltered = filteredMistakes.length;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
      {/* Header and Subject Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <PieChart className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-base font-bold text-foreground">
              Mistake Classification Breakdown
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Distribution across the 6 DUET error categories to diagnose recurring slip habits.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {SUBJECT_OPTIONS.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedSubject === sub.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      {/* Distribution Bars */}
      {totalFiltered === 0 ? (
        <div className="py-6 text-center text-xs text-muted-foreground border rounded-lg border-dashed">
          No mistakes recorded for {selectedSubject === 'all' ? 'the selected filter' : selectedSubject.toUpperCase()}.
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {distribution.map(({ type, meta, count, percentage, barColor }) => (
            <div key={type} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{meta.label}</span>
                  <span className="text-[11px] text-muted-foreground">
                    ({count} {count === 1 ? 'mistake' : 'mistakes'})
                  </span>
                </div>
                <span className="font-bold text-foreground">{percentage}%</span>
              </div>

              {/* Progress Track */}
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

