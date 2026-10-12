import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  RotateCcw,
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  Inbox,
} from 'lucide-react';
import type {
  RevisionRecommendation,
  RecommendationType,
  RecommendationPriority,
  RecommendationFilterOptions,
} from '@/domain/revisionRecommendations';
import {
  filterRevisionRecommendations,
  getRevisionRecommendationSummary,
} from '@/domain/revisionRecommendations';
import type { SubjectId } from '@/domain/types';
import { RecommendationCard } from './RecommendationCard';
import { Button } from '@/components/ui/button';

interface RevisionRecommendationsListProps {
  recommendations: RevisionRecommendation[];
  onStartPractice?: (
    subjectId: SubjectId,
    topicId: string,
    suggestedDurationMinutes?: number
  ) => void;
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

const TYPE_OPTIONS: { id: RecommendationType | 'all'; label: string }[] = [
  { id: 'all', label: 'All Types' },
  { id: 'critical_drill', label: 'Critical Drills' },
  { id: 'spaced_repetition', label: 'Spaced Refreshers' },
  { id: 'mistake_drill', label: 'Mistake Drills' },
  { id: 'stagnant_topic', label: 'Resume Stalled' },
];

const PRIORITY_OPTIONS: {
  id: RecommendationPriority | 'all';
  label: string;
}[] = [
  { id: 'all', label: 'All Priorities' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'high', label: 'High' },
  { id: 'normal', label: 'Normal' },
];

function formatEstimatedTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
}

export const RevisionRecommendationsList: React.FC<
  RevisionRecommendationsListProps
> = ({ recommendations, onStartPractice, onViewMistakes }) => {
  const [filters, setFilters] = useState<RecommendationFilterOptions>({
    subjectId: 'all',
    type: 'all',
    priority: 'all',
    searchQuery: '',
  });

  const summary = useMemo(() => {
    return getRevisionRecommendationSummary(recommendations);
  }, [recommendations]);

  const filteredRecommendations = useMemo(() => {
    return filterRevisionRecommendations(recommendations, filters);
  }, [recommendations, filters]);

  const handleResetFilters = () => {
    setFilters({
      subjectId: 'all',
      type: 'all',
      priority: 'all',
      searchQuery: '',
    });
  };

  const isFiltered =
    !!filters.searchQuery ||
    (filters.subjectId && filters.subjectId !== 'all') ||
    (filters.type && filters.type !== 'all') ||
    (filters.priority && filters.priority !== 'all');

  return (
    <div className="space-y-6">
      {/* Top Level Summary Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="text-xs font-semibold uppercase text-muted-foreground flex items-center justify-between">
            <span>Total Tasks</span>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground mt-1">
            {summary.totalRecommendations}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Recommended revisions
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="text-xs font-semibold uppercase text-muted-foreground flex items-center justify-between">
            <span>Est. Total Time</span>
            <Clock className="h-4 w-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
            {formatEstimatedTime(summary.estimatedTotalMinutes)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Suggested study investment
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="text-xs font-semibold uppercase text-muted-foreground flex items-center justify-between">
            <span>Urgent Drills</span>
            <Flame className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {summary.urgentCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Critical weakness & slips
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="text-xs font-semibold uppercase text-muted-foreground flex items-center justify-between">
            <span>Spaced Reviews</span>
            <RotateCcw className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {summary.byType.spaced_repetition}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Forgetting curve checkups
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
              placeholder="Search recommendations, topics, chapters, or reasons..."
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
              Showing{' '}
              <strong className="text-foreground">
                {filteredRecommendations.length}
              </strong>{' '}
              of{' '}
              <strong className="text-foreground">
                {recommendations.length}
              </strong>
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

        {/* Filter Pills and Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/40">
          {/* Subject Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {SUBJECT_OPTIONS.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setFilters({ ...filters, subjectId: sub.id })}
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

          {/* Selectors Dropdowns */}
          <div className="flex items-center gap-2">
            {/* Type selector */}
            <select
              value={filters.type || 'all'}
              aria-label="Filter by recommendation type"
              onChange={(e) =>
                setFilters({
                  ...filters,
                  type: e.target.value as RecommendationType | 'all',
                })
              }
              className="rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>

            {/* Priority selector */}
            <select
              value={filters.priority || 'all'}
              aria-label="Filter by priority"
              onChange={(e) =>
                setFilters({
                  ...filters,
                  priority: e.target.value as RecommendationPriority | 'all',
                })
              }
              className="rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid or Empty State */}
      {recommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-2xl bg-card border-dashed space-y-3">
          <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-base font-bold text-foreground">
              All Caught Up!
            </h3>
            <p className="text-xs text-muted-foreground">
              No pending revisions, weak topic drills, or overdue spaced repetition cycles. Excellent preparation pace!
            </p>
          </div>
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center border rounded-2xl bg-card border-dashed space-y-3">
          <div className="p-3 rounded-2xl bg-muted/50 text-muted-foreground">
            <Inbox className="h-6 w-6" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-sm font-bold text-foreground">
              No Recommendations Match Filters
            </h3>
            <p className="text-xs text-muted-foreground">
              Try choosing different subject pills or resetting your search filters.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecommendations.map((item) => (
            <RecommendationCard
              key={item.id}
              item={item}
              onStartPractice={onStartPractice}
              onViewMistakes={onViewMistakes}
            />
          ))}
        </div>
      )}
    </div>
  );
};

