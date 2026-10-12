import React, { useState, useEffect, useId, useMemo, useRef } from 'react';
import { X, Clock, CheckCircle2, Save } from 'lucide-react';
import { useStudySessionStore } from '@/stores/useStudySessionStore';
import { syllabusRepository } from '@/repositories/syllabusRepository';
import type { SubjectId, SyllabusTopic } from '@/domain/types';
import { calculateAccuracy, createStudySessionSchema } from '@/domain/studySession';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDialogAccessibility } from '@/hooks/useDialogAccessibility';
import { toast } from '@/stores/useToastStore';

const SUBJECT_OPTIONS: { id: SubjectId; label: string }[] = [
  { id: 'math', label: 'Mathematics (গণিত)' },
  { id: 'physics', label: 'Physics (পদার্থ বিজ্ঞান)' },
  { id: 'chemistry', label: 'Chemistry (রসায়ন)' },
  { id: 'english', label: 'English (ইংরেজি)' },
  { id: 'cse', label: 'Computer Science & Engineering' },
];

const DURATION_PRESETS = [15, 30, 45, 60, 90];

export interface RecordSessionModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSaved?: (id: number) => void;
}

export const RecordSessionModal: React.FC<RecordSessionModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onSaved,
}) => {
  const storeIsOpen = useStudySessionStore((s) => s.isRecordModalOpen);
  const storeClose = useStudySessionStore((s) => s.closeRecordModal);
  const recordSession = useStudySessionStore((s) => s.recordSession);
  const prefilledSubjectId = useStudySessionStore((s) => s.prefilledSubjectId);
  const prefilledTopicId = useStudySessionStore((s) => s.prefilledTopicId);

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;
  const handleClose = propOnClose || storeClose;
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogAccessibility({
    isOpen,
    onClose: handleClose,
    containerRef: dialogRef,
  });

  // Form State
  const today = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const [date, setDate] = useState(today);
  const [subjectId, setSubjectId] = useState<SubjectId>('math');
  const [topicId, setTopicId] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [questionsSolved, setQuestionsSolved] = useState<number>(10);
  const [correctAnswers, setCorrectAnswers] = useState<number>(8);
  const [notes, setNotes] = useState<string>('');

  // Topic loading & errors
  const [topics, setTopics] = useState<SyllabusTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const titleId = useId();

  // Reset form when modal opens or prefill changes
  useEffect(() => {
    if (isOpen) {
      setDate(today);
      const sub = prefilledSubjectId || 'math';
      setSubjectId(sub);
      setDurationMinutes(45);
      setQuestionsSolved(10);
      setCorrectAnswers(8);
      setNotes('');
      setFieldErrors({});

      // Load topics for current subject
      setLoadingTopics(true);
      syllabusRepository.getTopicsBySubject(sub).then((data) => {
        setTopics(data);
        setLoadingTopics(false);
        if (prefilledTopicId && data.some((t) => t.id === prefilledTopicId)) {
          setTopicId(prefilledTopicId);
        } else if (data.length > 0) {
          setTopicId(data[0].id);
        } else {
          setTopicId('');
        }
      });
    }
  }, [isOpen, prefilledSubjectId, prefilledTopicId, today]);

  // Handle subject change
  const handleSubjectChange = (newSubject: SubjectId) => {
    setSubjectId(newSubject);
    setLoadingTopics(true);
    syllabusRepository.getTopicsBySubject(newSubject).then((data) => {
      setTopics(data);
      setLoadingTopics(false);
      setTopicId(data.length > 0 ? data[0].id : '');
    });
  };

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Accuracy calculation
  const accuracy = useMemo(() => {
    return calculateAccuracy(correctAnswers, questionsSolved);
  }, [correctAnswers, questionsSolved]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const payload = {
      date,
      subjectId,
      topicId,
      durationMinutes: Number(durationMinutes),
      questionsSolved: Number(questionsSolved),
      correctAnswers: Number(correctAnswers),
      notes: notes.trim() || undefined,
    };

    const validation = createStudySessionSchema.safeParse(payload);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const path = issue.path[0] as string;
        if (path) {
          errors[path] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      const newId = await recordSession(validation.data);
      toast.success('Study session recorded successfully!');
      if (onSaved) {
        onSaved(newId);
      }
      handleClose();
    } catch (err: unknown) {
      setFieldErrors({
        form: err instanceof Error ? err.message : 'Failed to save study session',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-foreground">
                Record Study Session
              </h2>
              <p className="text-xs text-muted-foreground">
                Log practice duration, problems solved, and concept notes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {fieldErrors.form && (
            <div className="p-3 text-xs text-destructive rounded-lg bg-destructive/10 border border-destructive/20 font-medium">
              {fieldErrors.form}
            </div>
          )}

          {/* Subject & Topic Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Subject */}
            <div className="space-y-1.5">
              <label htmlFor="session-subject-select" className="text-xs font-semibold text-foreground">
                Subject
              </label>
              <select
                id="session-subject-select"
                value={subjectId}
                onChange={(e) => handleSubjectChange(e.target.value as SubjectId)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.label}
                  </option>
                ))}
              </select>
              {fieldErrors.subjectId && (
                <p className="text-xs text-destructive">{fieldErrors.subjectId}</p>
              )}
            </div>

            {/* Topic */}
            <div className="space-y-1.5">
              <label htmlFor="session-topic-select" className="text-xs font-semibold text-foreground">
                Topic
              </label>
              <select
                id="session-topic-select"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                disabled={loadingTopics || topics.length === 0}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              >
                {loadingTopics ? (
                  <option value="">Loading topics...</option>
                ) : topics.length === 0 ? (
                  <option value="">No topics found</option>
                ) : (
                  topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))
                )}
              </select>
              {fieldErrors.topicId && (
                <p className="text-xs text-destructive">{fieldErrors.topicId}</p>
              )}
            </div>
          </div>

          {/* Date & Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div className="space-y-1.5">
              <label htmlFor="session-date-input" className="text-xs font-semibold text-foreground">
                Date Studied
              </label>
              <input
                id="session-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              {fieldErrors.date && (
                <p className="text-xs text-destructive">{fieldErrors.date}</p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="session-duration-input" className="text-xs font-semibold text-foreground">
                  Duration (Minutes)
                </label>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {durationMinutes > 0 ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m` : '0m'}
                </span>
              </div>
              <input
                id="session-duration-input"
                type="number"
                min="1"
                max="1440"
                value={durationMinutes || ''}
                onChange={(e) => setDurationMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              {fieldErrors.durationMinutes && (
                <p className="text-xs text-destructive">{fieldErrors.durationMinutes}</p>
              )}
            </div>
          </div>

          {/* Quick Duration Preset Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] text-muted-foreground mr-1">Quick presets:</span>
            {DURATION_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setDurationMinutes(preset)}
                className={cn(
                  'px-2 py-0.5 rounded-md text-xs font-medium border transition-colors',
                  durationMinutes === preset
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {preset}m
              </button>
            ))}
          </div>

          {/* Questions Solved, Correct Answers, & Accuracy Preview */}
          <div className="rounded-xl border bg-muted/30 p-3.5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="session-questions-solved" className="text-xs font-semibold text-foreground">
                  Questions Solved
                </label>
                <input
                  id="session-questions-solved"
                  type="number"
                  min="0"
                  value={questionsSolved}
                  onChange={(e) => setQuestionsSolved(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                {fieldErrors.questionsSolved && (
                  <p className="text-xs text-destructive">{fieldErrors.questionsSolved}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="session-correct-answers" className="text-xs font-semibold text-foreground">
                  Correct Answers
                </label>
                <input
                  id="session-correct-answers"
                  type="number"
                  min="0"
                  value={correctAnswers}
                  onChange={(e) => setCorrectAnswers(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                {fieldErrors.correctAnswers && (
                  <p className="text-xs text-destructive">{fieldErrors.correctAnswers}</p>
                )}
              </div>
            </div>

            {/* Live Accuracy Badge */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>Practice Accuracy:</span>
              </span>
              <span
                className={cn(
                  'font-bold px-2 py-0.5 rounded-full text-xs border',
                  questionsSolved === 0
                    ? 'bg-muted text-muted-foreground border-transparent'
                    : accuracy >= 80
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : accuracy >= 60
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                )}
              >
                {questionsSolved === 0 ? 'No problems' : `${accuracy}%`}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label htmlFor="session-notes-input" className="text-xs font-semibold text-foreground">
              Study Notes & Key Formulas (Optional)
            </label>
            <textarea
              id="session-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Practiced 10 calculus limits problems, need to revise L'Hopital rule..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
            {fieldErrors.notes && (
              <p className="text-xs text-destructive">{fieldErrors.notes}</p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving...' : 'Record Session'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
