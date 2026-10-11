import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Plus,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  SearchX,
} from 'lucide-react';
import { useMistakeStore } from '@/stores/useMistakeStore';
import { MistakeCard } from '@/components/mistake/MistakeCard';
import { RecordMistakeModal } from '@/components/mistake/RecordMistakeModal';
import { MistakeFilterBar } from '@/components/mistake/MistakeFilterBar';
import { MistakeReviewModal } from '@/components/mistake/MistakeReviewModal';
import { syllabusRepository } from '@/repositories/syllabusRepository';
import {
  filterAndSortMistakes,
  isDueForReview,
  type MistakeFilterOptions,
} from '@/domain/mistakeFilter';
import { Button } from '@/components/ui/button';

const DEFAULT_FILTERS: MistakeFilterOptions = {
  searchQuery: '',
  subjectId: 'all',
  type: 'all',
  status: 'all',
  urgency: 'all',
  sortBy: 'newest',
};

export const MistakesPage: React.FC = () => {
  const mistakes = useMistakeStore((state) => state.mistakes);
  const loadMistakes = useMistakeStore((state) => state.loadMistakes);
  const openRecordModal = useMistakeStore((state) => state.openRecordModal);
  const openReviewSession = useMistakeStore((state) => state.openReviewSession);
  const updateMistake = useMistakeStore((state) => state.updateMistake);
  const deleteMistake = useMistakeStore((state) => state.deleteMistake);
  const getMetrics = useMistakeStore((state) => state.getMetrics);

  const [filters, setFilters] = useState<MistakeFilterOptions>(DEFAULT_FILTERS);
  const [topicMap, setTopicMap] = useState<Record<string, string>>({});

  useEffect(() => {
    loadMistakes();
  }, [loadMistakes]);

  useEffect(() => {
    syllabusRepository.getAllTopics().then((topics) => {
      const map: Record<string, string> = {};
      for (const t of topics) {
        map[t.id] = t.name;
      }
      setTopicMap(map);
    });
  }, []);

  const metrics = useMemo(() => {
    return getMetrics();
  }, [mistakes, getMetrics]);

  const dueCount = useMemo(() => {
    return mistakes.filter((m) => isDueForReview(m)).length;
  }, [mistakes]);

  const filteredMistakes = useMemo(() => {
    return filterAndSortMistakes(mistakes, filters, topicMap);
  }, [mistakes, filters, topicMap]);

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="space-y-8">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Mistake Tracking
          </h1>
          <p className="text-sm text-muted-foreground">
            Log problem slips, reflect on what went wrong, and eliminate repeat errors through spaced review
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          {mistakes.length > 0 && (
            <Button
              variant="outline"
              onClick={() => openReviewSession()}
              className="gap-1.5 shadow-xs"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Review Workout</span>
            </Button>
          )}
          <Button
            onClick={() => openRecordModal()}
            className="gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Log Mistake</span>
          </Button>
        </div>
      </div>

      {/* Spaced Review Callout Banner */}
      {dueCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 rounded-2xl border border-primary/20 bg-primary/5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <span className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-foreground">
                {dueCount} {dueCount === 1 ? 'Mistake' : 'Mistakes'} Due for Spaced Review
              </h3>
              <p className="text-xs text-muted-foreground">
                Reviewing problems just as you begin to forget cements mastery for the DUET exam.
              </p>
            </div>
          </div>
          <Button
            onClick={() => openReviewSession()}
            className="self-start sm:self-center gap-1.5 shadow-xs shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Start Review Session</span>
          </Button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Total Mistakes */}
        <div className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Logged
            </span>
            <AlertCircle className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black tracking-tight">{metrics.totalMistakes}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all subjects & tests
          </p>
        </div>

        {/* Unresolved Mistakes */}
        <div className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Unresolved
            </span>
            <Clock className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400">
            {metrics.unresolvedCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Need concept analysis
          </p>
        </div>

        {/* In Review */}
        <div className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              In Review
            </span>
            <RotateCcw className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">
            {metrics.reviewingCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Active spaced revision
          </p>
        </div>

        {/* Resolution Rate */}
        <div className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fixed & Mastered
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
            {metrics.fixedCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.resolutionRate}% resolution rate
          </p>
        </div>
      </div>

      {/* Main Mistakes Section */}
      {mistakes.length === 0 ? (
        /* Overall Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-2xl bg-card border-dashed space-y-4">
          <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-lg font-bold text-foreground">No Mistakes Logged Yet</h3>
            <p className="text-xs text-muted-foreground">
              When you get a problem wrong in practice or mock tests, log it here to reflect on the core concept and avoid repeat mistakes.
            </p>
          </div>
          <Button onClick={() => openRecordModal()} className="gap-1.5 shadow-xs">
            <Plus className="h-4 w-4" />
            <span>Log Your First Mistake</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Multi-facet Filter Bar */}
          <MistakeFilterBar
            filters={filters}
            onFilterChange={setFilters}
            onResetFilters={handleResetFilters}
            totalCount={mistakes.length}
            filteredCount={filteredMistakes.length}
          />

          {/* Filtered Empty State */}
          {filteredMistakes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-4 text-center border rounded-2xl bg-card border-dashed space-y-3">
              <div className="p-3 rounded-2xl bg-muted/50 text-muted-foreground">
                <SearchX className="h-8 w-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-foreground">No Mistakes Match Your Filters</h3>
                <p className="text-xs text-muted-foreground">
                  Try adjusting search keywords or clearing active filters to see your recorded mistakes.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="gap-1.5 text-xs shadow-xs"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset All Filters</span>
              </Button>
            </div>
          ) : (
            /* Filtered Mistakes Cards Grid */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>Mistake Entries</span>
                <span>
                  {filteredMistakes.length} {filteredMistakes.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {filteredMistakes.map((mistake) => (
                  <MistakeCard
                    key={mistake.id}
                    mistake={mistake}
                    onUpdateStatus={(id, status) => updateMistake(id, { status })}
                    onDelete={deleteMistake}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <RecordMistakeModal />
      <MistakeReviewModal />
    </div>
  );
};
