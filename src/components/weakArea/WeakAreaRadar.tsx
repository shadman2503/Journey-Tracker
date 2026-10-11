import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  RotateCcw,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import type {
  WeakAreaTopic,
  WeakAreaUrgency,
  WeakAreaFilterOptions,
} from '@/domain/weakArea';
import { filterWeakAreas, getWeakAreaSummary } from '@/domain/weakArea';
import type { SubjectId } from '@/domain/types';
import { WeakAreaCard } from './WeakAreaCard';
import { Button } from '@/components/ui/button';

interface WeakAreaRadarProps {
  weakAreas: WeakAreaTopic[];
  onPracticeTopic?: (subjectId: SubjectId, topicId: string) => void;
  onViewMistakes?: (topicId: string) => void;
}

const SUBJECT_OPTIONS: { id: SubjectId | 'all'; label: string }[] = [
  { id: 'all', label: 'All Subjects' },
  { id: 'math', label: 'Math' },
  { id: 'physics', label: 'Physics' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'english', label: 'English' },
  { id: 'cse', label: 'CSE' },
];

const URGENCY_OPTIONS: { id: WeakAreaUrgency | 'all'; label: string }[] = [
  { id: 'all', label: 'All Urgencies' },
  { id: 'critical', label: 'Critical Only' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'minor', label: 'Minor Attention' },
];

export const WeakAreaRadar: React.FC<WeakAreaRadarProps> = ({
  weakAreas,
  onPracticeTopic,
  onViewMistakes,
}) => {
  const [filters, setFilters] = useState<WeakAreaFilterOptions>({
    subjectId: 'all',
    urgency: 'all',
    searchQuery: '',
  });

  const summary = useMemo(() => {
    return getWeakAreaSummary(weakAreas);
  }, [weakAreas]);

  const filteredWeakAreas = useMemo(() => {
    return filterWeakAreas(weakAreas, filters);
  }, [weakAreas, filters]);

  const handleResetFilters = () => {
    setFilters({
      subjectId: 'all',
      urgency: 'all',
      searchQuery: '',
    });
  };

  const isFiltered =
    !!filters.searchQuery ||
    (filters.subjectId && filters.subjectId !== 'all') ||
    (filters.urgency && filters.urgency !== 'all');

  return (
    <div className="space-y-6">
      {/* Overview Stat Badges */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            Total Flagged
          </div>
          <div className="text-2xl font-black text-foreground mt-1">
            {summary.totalWeakTopics}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Topics needing attention
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Critical
            </span>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {summary.criticalCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Severe accuracy or error leaks
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Moderate
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {summary.moderateCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Revision or practice slips
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            Minor Attention
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {summary.minorCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Routine checkups
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search weak topics, chapters, or diagnosis reasons..."
              value={filters.searchQuery || ''}
              onChange={(e) =>
                setFilters({ ...filters, searchQuery: e.target.value })
              }
              className="w-full rounded-lg border border-input bg-background pl-9 pr-9 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => setFilters({ ...filters, searchQuery: '' })}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-md"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Results count & reset */}
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
            <span className="text-muted-foreground font-medium">
              Showing <strong className="text-foreground">{filteredWeakAreas.length}</strong> of{' '}
              <strong className="text-foreground">{weakAreas.length}</strong>
            </span>
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/40">
          {/* Subject Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {SUBJECT_OPTIONS.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() =>
                  setFilters({ ...filters, subjectId: sub.id })
                }
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filters.subjectId === sub.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Urgency Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground font-medium">Urgency:</span>
            <select
              value={filters.urgency || 'all'}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  urgency: e.target.value as WeakAreaUrgency | 'all',
                })
              }
              className="rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {URGENCY_OPTIONS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Topics Grid or Empty State */}
      {weakAreas.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-2xl bg-card border-dashed space-y-3">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-base font-bold text-foreground">
              No Weak Areas Detected
            </h3>
            <p className="text-xs text-muted-foreground">
              Your practice accuracy is solid and you have no unresolved mistakes or overdue revisions. Keep up the consistent preparation!
            </p>
          </div>
        </div>
      ) : filteredWeakAreas.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center border rounded-2xl bg-card border-dashed space-y-3">
          <div className="p-3 rounded-2xl bg-muted/50 text-muted-foreground">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-sm font-bold text-foreground">
              No Weak Topics Match Your Filter
            </h3>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search query, subject filter, or urgency selector.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="gap-1.5 text-xs shadow-xs"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Filters</span>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredWeakAreas.map((item) => (
            <WeakAreaCard
              key={item.topicId}
              item={item}
              onPracticeTopic={onPracticeTopic}
              onViewMistakes={onViewMistakes}
            />
          ))}
        </div>
      )}
    </div>
  );
};

