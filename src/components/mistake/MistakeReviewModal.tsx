import React, { useState, useEffect, useId, useRef } from 'react';
import {
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Eye,
  RotateCcw,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useMistakeStore } from '@/stores/useMistakeStore';
import { syllabusRepository } from '@/repositories/syllabusRepository';
import type { Mistake, SyllabusTopic } from '@/domain/types';
import {
  isDueForReview,
  calculateAssessment,
  type ReviewOutcome,
} from '@/domain/mistakeFilter';
import { MISTAKE_TYPE_CONFIG, MISTAKE_STATUS_CONFIG } from '@/domain/mistake';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDialogAccessibility } from '@/hooks/useDialogAccessibility';

export interface MistakeReviewModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const MistakeReviewModal: React.FC<MistakeReviewModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const storeIsOpen = useMistakeStore((s) => s.isReviewSessionOpen);
  const storeClose = useMistakeStore((s) => s.closeReviewSession);
  const mistakes = useMistakeStore((s) => s.mistakes);
  const updateMistake = useMistakeStore((s) => s.updateMistake);

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;
  const handleClose = propOnClose || storeClose;
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogAccessibility({
    isOpen,
    onClose: handleClose,
    containerRef: dialogRef,
  });

  const [topics, setTopics] = useState<SyllabusTopic[]>([]);
  const [includeAllActive, setIncludeAllActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [results, setResults] = useState<{
    unclear: number;
    progressing: number;
    mastered: number;
  }>({ unclear: 0, progressing: 0, mastered: 0 });

  const titleId = useId();

  // Load syllabus topics for names
  useEffect(() => {
    syllabusRepository.getAllTopics().then((data) => {
      setTopics(data);
    });
  }, []);

  const [deck, setDeck] = useState<Mistake[]>([]);

  // Reset session on modal open or when toggling includeAllActive
  useEffect(() => {
    if (isOpen) {
      const initialDeck = includeAllActive
        ? mistakes.filter((m) => m.status !== 'fixed')
        : mistakes.filter((m) => isDueForReview(m));
      setDeck(initialDeck);
      setCurrentIndex(0);
      setIsRevealed(false);
      setResults({ unclear: 0, progressing: 0, mastered: 0 });
    }
  }, [isOpen, includeAllActive]);

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

  if (!isOpen) return null;

  const isCompleted = deck.length > 0 && currentIndex >= deck.length;
  const currentCard = deck[currentIndex];
  const topicName = currentCard
    ? topics.find((t) => t.id === currentCard.topicId)?.name || currentCard.topicId
    : '';

  const handleAssessment = async (outcome: ReviewOutcome) => {
    if (!currentCard || currentCard.id === undefined) return;

    const assessment = calculateAssessment(currentCard, outcome);
    await updateMistake(currentCard.id, {
      status: assessment.newStatus,
      reviewDate: assessment.newReviewDate || '',
    });

    setResults((prev) => ({
      ...prev,
      unclear: outcome === 'unclear' ? prev.unclear + 1 : prev.unclear,
      progressing: outcome === 'progressing' ? prev.progressing + 1 : prev.progressing,
      mastered: outcome === 'fixed' ? prev.mastered + 1 : prev.mastered,
    }));

    setIsRevealed(false);
    setCurrentIndex((prev) => prev + 1);
  };

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
      <div className="relative w-full max-w-xl rounded-2xl border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* Empty Deck View */}
        {deck.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-10 w-10" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h3 id={titleId} className="text-xl font-bold text-foreground">
                All Caught Up!
              </h3>
              <p className="text-xs text-muted-foreground">
                You have no mistakes scheduled or overdue for spaced review today. Keep practicing to maintain your edge.
              </p>
            </div>

            {mistakes.filter((m) => m.status !== 'fixed').length > 0 && !includeAllActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIncludeAllActive(true);
                  setCurrentIndex(0);
                }}
                className="gap-1.5 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>
                  Practice All Unresolved Mistakes ({mistakes.filter((m) => m.status !== 'fixed').length})
                </span>
              </Button>
            )}

            <Button onClick={handleClose} size="sm" className="px-6 text-xs shadow-xs">
              Close
            </Button>
          </div>
        )}

        {/* Completion Summary View */}
        {isCompleted && (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-5 animate-in fade-in-0">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h3 id={titleId} className="text-xl font-black text-foreground">
                Review Workout Complete!
              </h3>
              <p className="text-xs text-muted-foreground">
                Great job reviewing your problem slips. Consistent reflection prevents recurring mistakes.
              </p>
            </div>

            {/* Results Counters */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-sm pt-2">
              <div className="p-3 rounded-xl border bg-muted/30 text-center">
                <span className="text-xs text-muted-foreground font-semibold">Mastered</span>
                <div className="text-xl font-extrabold text-primary mt-0.5">
                  {results.mastered}
                </div>
              </div>
              <div className="p-3 rounded-xl border bg-muted/30 text-center">
                <span className="text-xs text-muted-foreground font-semibold">In Review</span>
                <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                  {results.progressing}
                </div>
              </div>
              <div className="p-3 rounded-xl border bg-muted/30 text-center">
                <span className="text-xs text-muted-foreground font-semibold">Needs Work</span>
                <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                  {results.unclear}
                </div>
              </div>
            </div>

            <Button onClick={handleClose} size="sm" className="w-full max-w-xs gap-1.5 shadow-xs">
              <span>Finish Session</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Active Flashcard View */}
        {!isCompleted && currentCard && (
          <div className="space-y-5">
            {/* Modal Header & Progress */}
            <div className="space-y-2 border-b pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span className="text-primary font-bold">
                    Card {currentIndex + 1} of {deck.length}
                  </span>
                  <span>•</span>
                  <span className="uppercase tracking-wider text-[11px]">{currentCard.subjectId}</span>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Exit review session"
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Card Body */}
            <div className="space-y-4">
              {/* Question Reference & Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h4 className="text-base font-extrabold text-foreground">
                    {currentCard.questionRef}
                  </h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span>{topicName}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[11px] font-semibold border',
                      MISTAKE_TYPE_CONFIG[currentCard.type].badgeClass,
                    )}
                  >
                    {MISTAKE_TYPE_CONFIG[currentCard.type].label}
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[11px] font-semibold border',
                      MISTAKE_STATUS_CONFIG[currentCard.status].badgeClass,
                    )}
                  >
                    {MISTAKE_STATUS_CONFIG[currentCard.status].label}
                  </span>
                </div>
              </div>

              {/* What went wrong section */}
              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/15 space-y-1.5">
                <span className="font-bold text-xs text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  <span>What I Did Wrong:</span>
                </span>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {currentCard.whatWentWrong}
                </p>
              </div>

              {/* Reveal Solution Button or Revealed Content */}
              {!isRevealed ? (
                <div className="py-4 text-center">
                  <Button
                    onClick={() => setIsRevealed(true)}
                    variant="outline"
                    className="gap-2 shadow-xs text-xs font-semibold px-5"
                  >
                    <Eye className="h-4 w-4 text-primary" />
                    <span>Reveal Correct Concept & Solution</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in-0 duration-200">
                  {/* Correct Solution Section */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 space-y-1.5">
                    <span className="font-bold text-xs text-primary flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Correct Concept & Solution:</span>
                    </span>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {currentCard.correctSolution}
                    </p>
                  </div>

                  {/* Grading Assessment Buttons */}
                  <div className="space-y-2 pt-2 border-t">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block text-center">
                      How well do you know this now?
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssessment('unclear')}
                        className="text-xs h-9 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex-col py-1"
                      >
                        <span className="font-bold">Still Unclear</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Review tomorrow (+1d)</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssessment('progressing')}
                        className="text-xs h-9 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 flex-col py-1"
                      >
                        <span className="font-bold">Making Progress</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Review in 3 days (+3d)</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAssessment('fixed')}
                        className="text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/90 flex-col py-1 shadow-xs"
                      >
                        <span className="font-bold">Fixed & Mastered</span>
                        <span className="text-[10px] opacity-80 font-normal">Resolved! Mark Fixed</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
