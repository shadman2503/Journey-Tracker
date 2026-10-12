import React, { useState, useMemo } from 'react';
import { Calendar, Clock, BookCheck, Trash2, AlertTriangle, FileText } from 'lucide-react';
import type { StudySession, SubjectId } from '@/domain/types';
import { calculateAccuracy, formatDuration } from '@/domain/studySession';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface StudySessionCardProps {
  session: StudySession;
  topicName?: string;
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
    badgeClass: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    borderClass: 'hover:border-teal-500/40',
  },
};

export const StudySessionCard: React.FC<StudySessionCardProps> = ({
  session,
  topicName,
  onDelete,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const subjectConfig = SUBJECT_STYLES[session.subjectId] || {
    label: session.subjectId,
    badgeClass: 'bg-muted text-muted-foreground border-transparent',
    borderClass: 'hover:border-border',
  };

  const formattedDate = useMemo(() => {
    try {
      const [year, month, day] = session.date.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return session.date;
    }
  }, [session.date]);

  const accuracy = useMemo(() => {
    return calculateAccuracy(session.correctAnswers, session.questionsSolved);
  }, [session.correctAnswers, session.questionsSolved]);

  const handleDelete = () => {
    if (session.id !== undefined && onDelete) {
      onDelete(session.id);
    }
    setShowConfirmDelete(false);
  };

  return (
    <div
      className={cn(
        'group relative rounded-xl border bg-card p-4 shadow-xs transition-all duration-200 hover:shadow-sm space-y-3',
        subjectConfig.borderClass
      )}
    >
      {/* Top row: Subject badge, date, duration, actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
              subjectConfig.badgeClass
            )}
          >
            {subjectConfig.label}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatDuration(session.durationMinutes)}</span>
          </span>
        </div>

        {/* Action: Delete */}
        {onDelete && session.id !== undefined && !showConfirmDelete && (
          <button
            type="button"
            onClick={() => setShowConfirmDelete(true)}
            aria-label="Delete study session"
            className="p-1 rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Delete Confirmation Banner */}
      {showConfirmDelete && (
        <div className="p-2.5 rounded-lg border border-destructive/20 bg-destructive/10 flex items-center justify-between gap-2 animate-in fade-in-0">
          <div className="flex items-center gap-1.5 text-xs text-destructive font-medium">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Delete this session record?</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmDelete(false)}
              className="h-6 px-2 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="h-6 px-2 text-xs font-medium"
            >
              Confirm
            </Button>
          </div>
        </div>
      )}

      {/* Topic Title */}
      <div>
        <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
          {topicName || session.topicId}
        </h3>
      </div>

      {/* Problems & Accuracy Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs">
        <div className="flex items-center gap-2">
          {session.questionsSolved > 0 ? (
            <>
              <span className="inline-flex items-center gap-1 text-muted-foreground font-medium">
                <BookCheck className="h-3.5 w-3.5 text-primary" />
                <span>
                  {session.correctAnswers} / {session.questionsSolved} questions solved
                </span>
              </span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[11px] font-bold border',
                  accuracy >= 80
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : accuracy >= 60
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                )}
              >
                {accuracy}% accuracy
              </span>
            </>
          ) : (
            <span className="text-muted-foreground italic text-xs">
              Concept study & theory review
            </span>
          )}
        </div>
      </div>

      {/* Notes */}
      {session.notes && (
        <div className="mt-2 p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs text-muted-foreground flex items-start gap-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="whitespace-pre-wrap">{session.notes}</p>
        </div>
      )}
    </div>
  );
};

