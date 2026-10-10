import React, { useState, useEffect, useId, useMemo } from 'react';
import { X, Award, Save, AlertCircle } from 'lucide-react';
import { useMockTestStore } from '@/stores/useMockTestStore';
import type { SubjectId } from '@/domain/types';
import {
  calculateMockScore,
  calculateMockAccuracy,
  calculateMockPercentage,
  createMockTestSchema,
} from '@/domain/mockTest';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SCOPE_OPTIONS: { id: SubjectId | ''; label: string }[] = [
  { id: '', label: 'Full Syllabus (সকল বিষয়)' },
  { id: 'math', label: 'Mathematics (গণিত)' },
  { id: 'physics', label: 'Physics (পদার্থ বিজ্ঞান)' },
  { id: 'chemistry', label: 'Chemistry (রসায়ন)' },
  { id: 'english', label: 'English (ইংরেজি)' },
  { id: 'cse', label: 'Computer Science & Engineering' },
];

const TIME_PRESETS = [45, 60, 90, 120, 150];

const NAME_PRESETS = [
  'DUET Full Model Test',
  'Math Sectional Test',
  'Physics Sectional Test',
  'CSE Sectional Test',
];

export interface RecordMockTestModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSaved?: (id: number) => void;
}

export const RecordMockTestModal: React.FC<RecordMockTestModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onSaved,
}) => {
  const storeIsOpen = useMockTestStore((s) => s.isRecordModalOpen);
  const storeClose = useMockTestStore((s) => s.closeRecordModal);
  const recordMockTest = useMockTestStore((s) => s.recordMockTest);

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;
  const handleClose = propOnClose || storeClose;

  const today = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  // Form State
  const [testName, setTestName] = useState<string>('DUET Full Model Test 1');
  const [date, setDate] = useState<string>(today);
  const [scope, setScope] = useState<SubjectId | ''>('');
  const [totalQuestions, setTotalQuestions] = useState<number>(100);
  const [correctAnswers, setCorrectAnswers] = useState<number>(70);
  const [wrongAnswers, setWrongAnswers] = useState<number>(20);
  const [timeTakenMinutes, setTimeTakenMinutes] = useState<number>(120);
  const [notes, setNotes] = useState<string>('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const titleId = useId();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTestName('DUET Full Model Test 1');
      setDate(today);
      setScope('');
      setTotalQuestions(100);
      setCorrectAnswers(70);
      setWrongAnswers(20);
      setTimeTakenMinutes(120);
      setNotes('');
      setFieldErrors({});
    }
  }, [isOpen, today]);

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

  // Derived metrics for live preview
  const unanswered = Math.max(0, totalQuestions - (correctAnswers + wrongAnswers));
  const score = calculateMockScore(correctAnswers, wrongAnswers);
  const penalty = Math.round(wrongAnswers * 0.25 * 100) / 100;
  const accuracy = calculateMockAccuracy(correctAnswers, wrongAnswers);
  const percentage = calculateMockPercentage(score, totalQuestions);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const payload = {
      testName: testName.trim(),
      date,
      subjectId: scope ? scope : undefined,
      totalQuestions: Number(totalQuestions),
      correctAnswers: Number(correctAnswers),
      wrongAnswers: Number(wrongAnswers),
      timeTakenMinutes: Number(timeTakenMinutes),
      notes: notes.trim() || undefined,
    };

    const validation = createMockTestSchema.safeParse(payload);
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
      const newId = await recordMockTest(validation.data);
      if (onSaved) {
        onSaved(newId);
      }
      handleClose();
    } catch (err: unknown) {
      setFieldErrors({
        form: err instanceof Error ? err.message : 'Failed to record mock test',
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
      <div className="relative w-full max-w-xl rounded-2xl border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-foreground">
                Record Mock Test
              </h2>
              <p className="text-xs text-muted-foreground">
                Track your DUET model test results with negative marking breakdown
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
            <div className="p-3 text-xs text-destructive rounded-lg bg-destructive/10 border border-destructive/20 font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{fieldErrors.form}</span>
            </div>
          )}

          {/* Test Name */}
          <div className="space-y-1.5">
            <label htmlFor="mock-test-name" className="text-xs font-semibold text-foreground">
              Test Name / Model Test Title
            </label>
            <input
              id="mock-test-name"
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="e.g. DUET Full Model Test 1"
              className={cn(
                'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                fieldErrors.testName && 'border-destructive focus-visible:ring-destructive',
              )}
            />
            {fieldErrors.testName && (
              <p className="text-xs text-destructive">{fieldErrors.testName}</p>
            )}

            {/* Quick Title Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {NAME_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTestName(preset)}
                  className={cn(
                    'text-[11px] px-2 py-0.5 rounded-md border transition-colors',
                    testName.startsWith(preset)
                      ? 'border-primary/50 bg-primary/10 text-primary font-medium'
                      : 'border-border/60 hover:bg-muted text-muted-foreground',
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Scope */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div className="space-y-1.5">
              <label htmlFor="mock-test-date" className="text-xs font-semibold text-foreground">
                Test Date
              </label>
              <input
                id="mock-test-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={cn(
                  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                  fieldErrors.date && 'border-destructive focus-visible:ring-destructive',
                )}
              />
              {fieldErrors.date && (
                <p className="text-xs text-destructive">{fieldErrors.date}</p>
              )}
            </div>

            {/* Scope */}
            <div className="space-y-1.5">
              <label htmlFor="mock-test-scope" className="text-xs font-semibold text-foreground">
                Test Scope / Subject
              </label>
              <select
                id="mock-test-scope"
                value={scope}
                onChange={(e) => setScope(e.target.value as SubjectId | '')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {SCOPE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Questions Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Total Questions */}
            <div className="space-y-1.5">
              <label htmlFor="mock-total-questions" className="text-xs font-semibold text-foreground">
                Total Questions
              </label>
              <input
                id="mock-total-questions"
                type="number"
                min="1"
                max="500"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Math.max(0, parseInt(e.target.value) || 0))}
                className={cn(
                  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                  fieldErrors.totalQuestions && 'border-destructive focus-visible:ring-destructive',
                )}
              />
              {fieldErrors.totalQuestions && (
                <p className="text-xs text-destructive">{fieldErrors.totalQuestions}</p>
              )}
            </div>

            {/* Correct Answers */}
            <div className="space-y-1.5">
              <label htmlFor="mock-correct-answers" className="text-xs font-semibold text-foreground text-emerald-600 dark:text-emerald-400">
                Correct (+1 mark)
              </label>
              <input
                id="mock-correct-answers"
                type="number"
                min="0"
                max={totalQuestions}
                value={correctAnswers}
                onChange={(e) => setCorrectAnswers(Math.max(0, parseInt(e.target.value) || 0))}
                className={cn(
                  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                  fieldErrors.correctAnswers && 'border-destructive focus-visible:ring-destructive',
                )}
              />
              {fieldErrors.correctAnswers && (
                <p className="text-xs text-destructive">{fieldErrors.correctAnswers}</p>
              )}
            </div>

            {/* Wrong Answers */}
            <div className="space-y-1.5">
              <label htmlFor="mock-wrong-answers" className="text-xs font-semibold text-foreground text-rose-600 dark:text-rose-400">
                Wrong (-0.25 mark)
              </label>
              <input
                id="mock-wrong-answers"
                type="number"
                min="0"
                max={totalQuestions}
                value={wrongAnswers}
                onChange={(e) => setWrongAnswers(Math.max(0, parseInt(e.target.value) || 0))}
                className={cn(
                  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                  fieldErrors.wrongAnswers && 'border-destructive focus-visible:ring-destructive',
                )}
              />
              {fieldErrors.wrongAnswers && (
                <p className="text-xs text-destructive">{fieldErrors.wrongAnswers}</p>
              )}
            </div>
          </div>

          {/* Unanswered count badge */}
          <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground border border-border/40">
            <span>Attempted: <strong className="text-foreground">{correctAnswers + wrongAnswers}</strong> / {totalQuestions}</span>
            <span>Unanswered: <strong className="text-foreground">{unanswered}</strong></span>
          </div>

          {/* Time Taken */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="mock-time-taken" className="text-xs font-semibold text-foreground">
                Time Taken (Minutes)
              </label>
              <span className="text-xs text-muted-foreground">
                {Math.floor(timeTakenMinutes / 60)}h {timeTakenMinutes % 60}m
              </span>
            </div>
            <div className="flex gap-2">
              <input
                id="mock-time-taken"
                type="number"
                min="1"
                max="1440"
                value={timeTakenMinutes}
                onChange={(e) => setTimeTakenMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className={cn(
                  'w-32 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                  fieldErrors.timeTakenMinutes && 'border-destructive focus-visible:ring-destructive',
                )}
              />
              <div className="flex flex-wrap gap-1.5 items-center flex-1">
                {TIME_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTimeTakenMinutes(preset)}
                    className={cn(
                      'text-xs px-2.5 py-1.5 rounded-md border transition-colors',
                      timeTakenMinutes === preset
                        ? 'border-primary/50 bg-primary/10 text-primary font-medium'
                        : 'border-border/60 hover:bg-muted text-muted-foreground',
                    )}
                  >
                    {preset}m
                  </button>
                ))}
              </div>
            </div>
            {fieldErrors.timeTakenMinutes && (
              <p className="text-xs text-destructive">{fieldErrors.timeTakenMinutes}</p>
            )}
          </div>

          {/* Live Score & Accuracy Preview Card */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Scoring Preview
              </span>
              <span className="text-[11px] text-muted-foreground">
                DUET marking: +1.00 / -0.25
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Net Score */}
              <div className="p-2.5 rounded-lg bg-card border shadow-xs">
                <p className="text-[11px] text-muted-foreground">Net Score</p>
                <p className={cn(
                  'text-xl font-black mt-0.5',
                  score >= 0 ? 'text-primary' : 'text-destructive',
                )}>
                  {score.toFixed(2)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  +{correctAnswers} - {penalty.toFixed(2)}
                </p>
              </div>

              {/* Accuracy */}
              <div className="p-2.5 rounded-lg bg-card border shadow-xs">
                <p className="text-[11px] text-muted-foreground">Accuracy</p>
                <p className="text-xl font-black text-foreground mt-0.5">
                  {accuracy}%
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  of attempted
                </p>
              </div>

              {/* Percentage */}
              <div className="p-2.5 rounded-lg bg-card border shadow-xs">
                <p className="text-[11px] text-muted-foreground">Total Pct</p>
                <p className="text-xl font-black text-foreground mt-0.5">
                  {percentage}%
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  of max marks
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label htmlFor="mock-test-notes" className="text-xs font-semibold text-foreground">
              Notes & Reflections (Optional)
            </label>
            <textarea
              id="mock-test-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record weak topics noticed, careless mistakes made, or time pressure issues..."
              className={cn(
                'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none',
                fieldErrors.notes && 'border-destructive focus-visible:ring-destructive',
              )}
            />
            {fieldErrors.notes && (
              <p className="text-xs text-destructive">{fieldErrors.notes}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
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
              className="gap-1.5 font-medium"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Mock Test'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

