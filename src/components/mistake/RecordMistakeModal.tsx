import React, { useState, useEffect, useId } from 'react';
import { X, AlertCircle, Save, Calendar } from 'lucide-react';
import { useMistakeStore } from '@/stores/useMistakeStore';
import { syllabusRepository } from '@/repositories/syllabusRepository';
import type { SubjectId, SyllabusTopic, MistakeType, MistakeStatus } from '@/domain/types';
import {
  createMistakeSchema,
  MISTAKE_TYPE_CONFIG,
  MISTAKE_STATUS_CONFIG,
  ALL_MISTAKE_TYPES,
  getSuggestedReviewDate,
} from '@/domain/mistake';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SUBJECT_OPTIONS: { id: SubjectId; label: string }[] = [
  { id: 'math', label: 'Mathematics (গণিত)' },
  { id: 'physics', label: 'Physics (পদার্থ বিজ্ঞান)' },
  { id: 'chemistry', label: 'Chemistry (রসায়ন)' },
  { id: 'english', label: 'English (ইংরেজি)' },
  { id: 'cse', label: 'Computer Science & Engineering' },
];

export interface RecordMistakeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSaved?: (id: number) => void;
}

export const RecordMistakeModal: React.FC<RecordMistakeModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onSaved,
}) => {
  const storeIsOpen = useMistakeStore((s) => s.isRecordModalOpen);
  const storeClose = useMistakeStore((s) => s.closeRecordModal);
  const recordMistake = useMistakeStore((s) => s.recordMistake);
  const prefilledSubjectId = useMistakeStore((s) => s.prefilledSubjectId);
  const prefilledTopicId = useMistakeStore((s) => s.prefilledTopicId);
  const prefilledQuestionRef = useMistakeStore((s) => s.prefilledQuestionRef);

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;
  const handleClose = propOnClose || storeClose;

  // Form states
  const [subjectId, setSubjectId] = useState<SubjectId>('math');
  const [topicId, setTopicId] = useState<string>('');
  const [questionRef, setQuestionRef] = useState<string>('');
  const [whatWentWrong, setWhatWentWrong] = useState<string>('');
  const [correctSolution, setCorrectSolution] = useState<string>('');
  const [type, setType] = useState<MistakeType>('conceptual');
  const [status, setStatus] = useState<MistakeStatus>('unresolved');
  const [reviewDate, setReviewDate] = useState<string>(() => getSuggestedReviewDate(3));

  // Dynamic topics state
  const [topics, setTopics] = useState<SyllabusTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleId = useId();

  // Reset / Populate on open
  useEffect(() => {
    if (isOpen) {
      const initialSub = prefilledSubjectId || 'math';
      setSubjectId(initialSub);
      setQuestionRef(prefilledQuestionRef || '');
      setWhatWentWrong('');
      setCorrectSolution('');
      setType('conceptual');
      setStatus('unresolved');
      setReviewDate(getSuggestedReviewDate(3));
      setFieldErrors({});

      setLoadingTopics(true);
      syllabusRepository.getTopicsBySubject(initialSub).then((data) => {
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
  }, [isOpen, prefilledSubjectId, prefilledTopicId, prefilledQuestionRef]);

  // Handle subject change
  const handleSubjectChange = (newSub: SubjectId) => {
    setSubjectId(newSub);
    setLoadingTopics(true);
    syllabusRepository.getTopicsBySubject(newSub).then((data) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const payload = {
      subjectId,
      topicId,
      questionRef: questionRef.trim(),
      whatWentWrong: whatWentWrong.trim(),
      correctSolution: correctSolution.trim(),
      type,
      status,
      reviewDate: reviewDate || undefined,
    };

    const validation = createMistakeSchema.safeParse(payload);
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
      const newId = await recordMistake(validation.data);
      if (onSaved) {
        onSaved(newId);
      }
      handleClose();
    } catch (err: unknown) {
      setFieldErrors({
        form: err instanceof Error ? err.message : 'Failed to save mistake entry',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-xl rounded-2xl border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
            </span>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-foreground">
                Log New Mistake
              </h2>
              <p className="text-xs text-muted-foreground">
                Record problem slips, analyze what went wrong, and set spaced review
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
              <label htmlFor="mistake-subject-select" className="text-xs font-semibold text-foreground">
                Subject
              </label>
              <select
                id="mistake-subject-select"
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
              <label htmlFor="mistake-topic-select" className="text-xs font-semibold text-foreground">
                Syllabus Topic
              </label>
              <select
                id="mistake-topic-select"
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

          {/* Question Reference */}
          <div className="space-y-1.5">
            <label htmlFor="mistake-question-ref" className="text-xs font-semibold text-foreground">
              Question Source / Reference
            </label>
            <input
              id="mistake-question-ref"
              type="text"
              placeholder="e.g. DUET 2024 Math Q-14, Model Test 3 Physics Problem 5..."
              value={questionRef}
              onChange={(e) => setQuestionRef(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {fieldErrors.questionRef && (
              <p className="text-xs text-destructive">{fieldErrors.questionRef}</p>
            )}
          </div>

          {/* Mistake Type Classification Chips */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Mistake Classification</span>
              <span className="text-[11px] text-muted-foreground font-normal">
                {MISTAKE_TYPE_CONFIG[type].description}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_MISTAKE_TYPES.map((typeKey) => {
                const config = MISTAKE_TYPE_CONFIG[typeKey];
                const isSelected = type === typeKey;
                return (
                  <button
                    key={typeKey}
                    type="button"
                    onClick={() => setType(typeKey)}
                    className={cn(
                      'p-2 rounded-lg text-xs font-medium border text-left transition-all',
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary'
                        : 'border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <div className="truncate">{config.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* What I Did Wrong */}
          <div className="space-y-1.5">
            <label htmlFor="mistake-wrong-input" className="text-xs font-semibold text-foreground">
              What I Did Wrong (My Error / Flawed Thinking)
            </label>
            <textarea
              id="mistake-wrong-input"
              rows={3}
              placeholder="e.g. Substituted direct value without noticing 0/0 form; forgot the minus sign in acceleration term..."
              value={whatWentWrong}
              onChange={(e) => setWhatWentWrong(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
            {fieldErrors.whatWentWrong && (
              <p className="text-xs text-destructive">{fieldErrors.whatWentWrong}</p>
            )}
          </div>

          {/* Correct Solution & Key Concept */}
          <div className="space-y-1.5">
            <label htmlFor="mistake-solution-input" className="text-xs font-semibold text-foreground">
              Correct Solution & Key Concept to Remember
            </label>
            <textarea
              id="mistake-solution-input"
              rows={3}
              placeholder="e.g. Always apply L'Hopital's rule or factor (x - a) first; formula on inclined plane is g*sin(theta)..."
              value={correctSolution}
              onChange={(e) => setCorrectSolution(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
            {fieldErrors.correctSolution && (
              <p className="text-xs text-destructive">{fieldErrors.correctSolution}</p>
            )}
          </div>

          {/* Status & Review Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Initial Status */}
            <div className="space-y-1.5">
              <label htmlFor="mistake-status-select" className="text-xs font-semibold text-foreground">
                Initial Status
              </label>
              <select
                id="mistake-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as MistakeStatus)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="unresolved">{MISTAKE_STATUS_CONFIG.unresolved.label}</option>
                <option value="reviewing">{MISTAKE_STATUS_CONFIG.reviewing.label}</option>
                <option value="fixed">{MISTAKE_STATUS_CONFIG.fixed.label}</option>
              </select>
            </div>

            {/* Scheduled Review Date */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="mistake-review-date" className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>Next Review Date</span>
                </label>
                <span className="text-[11px] text-muted-foreground">Spaced revision</span>
              </div>
              <input
                id="mistake-review-date"
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
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
              className="gap-1.5 shadow-xs"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving...' : 'Log Mistake'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

