import React, { useEffect, useMemo } from 'react';
import {
  AlertCircle,
  Plus,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useMistakeStore } from '@/stores/useMistakeStore';
import { MistakeCard } from '@/components/mistake/MistakeCard';
import { RecordMistakeModal } from '@/components/mistake/RecordMistakeModal';
import { Button } from '@/components/ui/button';

export const MistakesPage: React.FC = () => {
  const mistakes = useMistakeStore((state) => state.mistakes);
  const loadMistakes = useMistakeStore((state) => state.loadMistakes);
  const openRecordModal = useMistakeStore((state) => state.openRecordModal);
  const updateMistake = useMistakeStore((state) => state.updateMistake);
  const deleteMistake = useMistakeStore((state) => state.deleteMistake);
  const getMetrics = useMistakeStore((state) => state.getMetrics);

  useEffect(() => {
    loadMistakes();
  }, [loadMistakes]);

  const metrics = useMemo(() => {
    return getMetrics();
  }, [mistakes, getMetrics]);

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
        <Button
          onClick={() => openRecordModal()}
          className="self-start sm:self-center gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Log Mistake</span>
        </Button>
      </div>

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

      {/* Main Mistakes Grid / Empty State */}
      {mistakes.length === 0 ? (
        /* Empty State */
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
        /* Mistakes Grid */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Recent Mistakes</span>
            <span>{mistakes.length} total entries</span>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {mistakes.map((mistake) => (
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

      {/* Record Mistake Modal */}
      <RecordMistakeModal />
    </div>
  );
};

