import React, { useRef, useId, useMemo } from 'react';
import { X, Clock, Award, CheckCircle2 } from 'lucide-react';
import type { MockTest } from '@/domain/types';
import { compareMockTests, calculateMockPercentage } from '@/domain/mockTest';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDialogAccessibility } from '@/hooks/useDialogAccessibility';

export interface MockTestComparisonModalProps {
  isOpen: boolean;
  testA: MockTest | null;
  testB: MockTest | null;
  onClose: () => void;
}

export const MockTestComparisonModal: React.FC<MockTestComparisonModalProps> = ({
  isOpen,
  testA,
  testB,
  onClose,
}) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogAccessibility({
    isOpen,
    onClose,
    containerRef: dialogRef,
  });

  const comparison = useMemo(() => {
    if (!testA || !testB) return null;
    return compareMockTests(testA, testB);
  }, [testA, testB]);

  if (!isOpen || !testA || !testB || !comparison) return null;

  const pctA = calculateMockPercentage(testA.score, testA.totalQuestions);
  const pctB = calculateMockPercentage(testB.score, testB.totalQuestions);
  const pctDelta = Math.round((pctA - pctB) * 10) / 10;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border bg-card p-4 sm:p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-foreground">
                Mock Test Comparison
              </h2>
              <p className="text-xs text-muted-foreground">
                Comparing {testA.testName} with {testB.testName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison dialog"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tests Header Banner */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border bg-primary/5 border-primary/20 space-y-1">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Test A</span>
            <h3 className="font-bold text-sm text-foreground line-clamp-1">{testA.testName}</h3>
            <p className="text-xs text-muted-foreground">{testA.date} • {testA.subjectId || 'Full Syllabus'}</p>
          </div>

          <div className="p-3.5 rounded-xl border bg-muted/30 border-border/60 space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Test B</span>
            <h3 className="font-bold text-sm text-foreground line-clamp-1">{testB.testName}</h3>
            <p className="text-xs text-muted-foreground">{testB.date} • {testB.subjectId || 'Full Syllabus'}</p>
          </div>
        </div>

        {/* Comparison Table / Matrix */}
        <div className="border rounded-xl overflow-hidden divide-y text-xs sm:text-sm">
          {/* Net Score Row */}
          <div className="grid grid-cols-3 p-2.5 sm:p-3 items-center bg-card">
            <div className="font-semibold text-foreground">Net Score</div>
            <div className="text-center font-bold text-sm sm:text-base text-primary">
              {testA.score.toFixed(2)}
            </div>
            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
              <span className="text-muted-foreground font-semibold">{testB.score.toFixed(2)}</span>
              <span
                className={cn(
                  'text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-md border inline-flex items-center gap-0.5',
                  comparison.scoreDelta > 0
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : comparison.scoreDelta < 0
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      : 'bg-muted text-muted-foreground border-border',
                )}
              >
                {comparison.scoreDelta > 0 ? `+${comparison.scoreDelta}` : comparison.scoreDelta}
              </span>
            </div>
          </div>

          {/* Accuracy Row */}
          <div className="grid grid-cols-3 p-2.5 sm:p-3 items-center bg-muted/20">
            <div className="font-semibold text-foreground">Accuracy</div>
            <div className="text-center font-bold text-foreground">
              {testA.accuracy}%
            </div>
            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
              <span className="text-muted-foreground font-medium">{testB.accuracy}%</span>
              <span
                className={cn(
                  'text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-md border inline-flex items-center gap-0.5',
                  comparison.accuracyDelta > 0
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : comparison.accuracyDelta < 0
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      : 'bg-muted text-muted-foreground border-border',
                )}
              >
                {comparison.accuracyDelta > 0 ? `+${comparison.accuracyDelta}%` : `${comparison.accuracyDelta}%`}
              </span>
            </div>
          </div>

          {/* Max Marks % */}
          <div className="grid grid-cols-3 p-2.5 sm:p-3 items-center bg-card">
            <div className="font-semibold text-foreground">Total Score %</div>
            <div className="text-center font-bold text-foreground">
              {pctA}%
            </div>
            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
              <span className="text-muted-foreground font-medium">{pctB}%</span>
              <span
                className={cn(
                  'text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-md border inline-flex items-center gap-0.5',
                  pctDelta > 0
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : pctDelta < 0
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      : 'bg-muted text-muted-foreground border-border',
                )}
              >
                {pctDelta > 0 ? `+${pctDelta}%` : `${pctDelta}%`}
              </span>
            </div>
          </div>

          {/* Correct Answers */}
          <div className="grid grid-cols-3 p-2.5 sm:p-3 items-center bg-muted/20">
            <div className="font-semibold text-foreground">Correct Answers</div>
            <div className="text-center font-bold text-emerald-600 dark:text-emerald-400">
              +{testA.correctAnswers}
            </div>
            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
              <span className="text-muted-foreground font-medium">+{testB.correctAnswers}</span>
              <span
                className={cn(
                  'text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-md border inline-flex items-center gap-0.5',
                  comparison.correctDelta > 0
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : comparison.correctDelta < 0
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      : 'bg-muted text-muted-foreground border-border',
                )}
              >
                {comparison.correctDelta > 0 ? `+${comparison.correctDelta}` : comparison.correctDelta}
              </span>
            </div>
          </div>

          {/* Wrong Answers */}
          <div className="grid grid-cols-3 p-2.5 sm:p-3 items-center bg-card">
            <div className="font-semibold text-foreground">Wrong Answers</div>
            <div className="text-center font-bold text-rose-600 dark:text-rose-400">
              -{testA.wrongAnswers}
            </div>
            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
              <span className="text-muted-foreground font-medium">-{testB.wrongAnswers}</span>
              <span
                className={cn(
                  'text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-md border inline-flex items-center gap-0.5',
                  comparison.wrongDelta < 0
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' // fewer mistakes is positive
                    : comparison.wrongDelta > 0
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      : 'bg-muted text-muted-foreground border-border',
                )}
              >
                {comparison.wrongDelta < 0 ? `${comparison.wrongDelta} (fewer)` : `+${comparison.wrongDelta}`}
              </span>
            </div>
          </div>

          {/* Time Taken */}
          <div className="grid grid-cols-3 p-2.5 sm:p-3 items-center bg-muted/20">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Time Taken
            </div>
            <div className="text-center font-bold text-foreground">
              {testA.timeTakenMinutes}m
            </div>
            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
              <span className="text-muted-foreground font-medium">{testB.timeTakenMinutes}m</span>
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground px-1.5 sm:px-2 py-0.5 rounded-md border bg-muted">
                {comparison.timeDeltaMinutes > 0 ? `+${comparison.timeDeltaMinutes}m` : `${comparison.timeDeltaMinutes}m`}
              </span>
            </div>
          </div>
        </div>

        {/* Takeaway Insight Banner */}
        <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-xs text-foreground flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
          <span>
            {comparison.scoreDelta > 0
              ? `${testA.testName} outperformed ${testB.testName} by ${comparison.scoreDelta} marks with ${comparison.accuracyDelta > 0 ? `+${comparison.accuracyDelta}%` : `${comparison.accuracyDelta}%`} accuracy.`
              : comparison.scoreDelta < 0
                ? `${testA.testName} scored ${Math.abs(comparison.scoreDelta)} marks lower than ${testB.testName}.`
                : `${testA.testName} and ${testB.testName} achieved identical scores.`}
          </span>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Comparison
          </Button>
        </div>
      </div>
    </div>
  );
};

