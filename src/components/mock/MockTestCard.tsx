import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import type { MockTest, SubjectId } from '@/domain/types';
import { getPreviousTestDelta } from '@/domain/mockTest';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface MockTestCardProps {
  test: MockTest;
  allTests?: MockTest[];
  isSelectedForCompare?: boolean;
  onToggleCompare?: (test: MockTest) => void;
  onDelete?: (id: number) => void;
}

const SUBJECT_STYLES: Record<
  SubjectId,
  { label: string; badgeClass: string; borderClass: string }
> = {
  math: {
    label: 'Mathematics',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    borderClass: 'hover:border-blue-500/40',
  },
  physics: {
    label: 'Physics',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    borderClass: 'hover:border-purple-500/40',
  },
  chemistry: {
    label: 'Chemistry',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    borderClass: 'hover:border-amber-500/40',
  },
  english: {
    label: 'English',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    borderClass: 'hover:border-rose-500/40',
  },
  cse: {
    label: 'Computer Science',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    borderClass: 'hover:border-emerald-500/40',
  },
};

export const MockTestCard: React.FC<MockTestCardProps> = ({
  test,
  allTests = [],
  isSelectedForCompare = false,
  onToggleCompare,
  onDelete,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const subjectConfig = test.subjectId
    ? SUBJECT_STYLES[test.subjectId]
    : {
        label: 'Full Syllabus',
        badgeClass: 'bg-primary/10 text-primary border-primary/20',
        borderClass: 'hover:border-primary/40',
      };

  const formattedDate = useMemo(() => {
    try {
      const [year, month, day] = test.date.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return test.date;
    }
  }, [test.date]);

  const penalty = Math.round(test.wrongAnswers * 0.25 * 100) / 100;
  const unanswered = Math.max(0, test.totalQuestions - (test.correctAnswers + test.wrongAnswers));
  const previousDelta = useMemo(() => {
    return getPreviousTestDelta(test, allTests);
  }, [test, allTests]);

  const handleDelete = () => {
    if (test.id !== undefined && onDelete) {
      onDelete(test.id);
    }
    setShowConfirmDelete(false);
  };

  return (
    <div
      className={cn(
        'group relative rounded-xl border bg-card p-5 shadow-xs transition-all duration-200 hover:shadow-sm space-y-4',
        subjectConfig.borderClass,
        isSelectedForCompare && 'ring-2 ring-primary border-primary bg-primary/5',
      )}
    >
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
              subjectConfig.badgeClass,
            )}
          >
            {subjectConfig.label}
          </span>

          <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {formattedDate}
          </span>
        </div>

        {/* Actions (Compare toggle & Delete) */}
        <div className="flex items-center gap-2">
          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(test)}
              className={cn(
                'inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border font-medium transition-colors',
                isSelectedForCompare
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border',
              )}
              aria-label={`Compare ${test.testName}`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{isSelectedForCompare ? 'Selected' : 'Compare'}</span>
            </button>
          )}

          {onDelete && test.id !== undefined && (
            <>
              {showConfirmDelete ? (
                <div className="flex items-center gap-1.5 animate-in fade-in-0">
                  <span className="text-xs text-destructive flex items-center gap-1 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Delete?
                  </span>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-6 px-2 text-xs"
                    onClick={handleDelete}
                  >
                    Yes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => setShowConfirmDelete(false)}
                  >
                    No
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  aria-label="Delete mock test"
                  className="opacity-60 group-hover:opacity-100 hover:text-destructive text-muted-foreground p-1 rounded-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Title & Score Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground tracking-tight">
            {test.testName}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            DUET marking: +{test.correctAnswers} - {penalty.toFixed(2)} deduction
          </p>
        </div>

        {/* Big Score & Delta Badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {previousDelta && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md border',
                previousDelta.scoreDelta > 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : previousDelta.scoreDelta < 0
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    : 'bg-muted text-muted-foreground border-border',
              )}
              title="Score change relative to previous test"
            >
              {previousDelta.scoreDelta > 0 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : previousDelta.scoreDelta < 0 ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <Minus className="h-3.5 w-3.5" />
              )}
              <span>
                {previousDelta.scoreDelta > 0 ? `+${previousDelta.scoreDelta}` : previousDelta.scoreDelta} pts
              </span>
            </div>
          )}

          <div className="text-right">
            <span className="text-xs text-muted-foreground block font-medium">Net Score</span>
            <span className={cn(
              'text-2xl font-black tracking-tight',
              test.score >= 0 ? 'text-primary' : 'text-destructive',
            )}>
              {test.score.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* Accuracy */}
        <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-center">
          <span className="text-[11px] text-muted-foreground block font-medium">Accuracy</span>
          <span className="text-sm font-bold text-foreground mt-0.5 block">
            {test.accuracy}%
          </span>
        </div>

        {/* Correct Answers */}
        <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block font-medium">Correct</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            +{test.correctAnswers}
          </span>
        </div>

        {/* Wrong Answers */}
        <div className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20 text-center">
          <span className="text-[11px] text-rose-700 dark:text-rose-300 block font-medium">Wrong</span>
          <span className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
            -{test.wrongAnswers}
          </span>
        </div>

        {/* Time Taken */}
        <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-center">
          <span className="text-[11px] text-muted-foreground block font-medium flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" />
            Time
          </span>
          <span className="text-sm font-bold text-foreground mt-0.5 block">
            {test.timeTakenMinutes}m
          </span>
        </div>
      </div>

      {/* Questions progress & unanswered footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>Attempted: <strong className="text-foreground">{test.correctAnswers + test.wrongAnswers}</strong> of {test.totalQuestions} questions</span>
        <span>Unanswered: <strong className="text-foreground">{unanswered}</strong></span>
      </div>

      {/* Notes (if any) */}
      {test.notes && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/40 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <span className="line-clamp-2 leading-relaxed">{test.notes}</span>
        </div>
      )}
    </div>
  );
};

