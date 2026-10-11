import React from 'react';
import { Search, X, RotateCcw, Filter, ArrowUpDown } from 'lucide-react';
import type {
  MistakeFilterOptions,
  MistakeUrgencyFilter,
  MistakeSortOption,
} from '@/domain/mistakeFilter';
import type { SubjectId, MistakeType, MistakeStatus } from '@/domain/types';
import { MISTAKE_TYPE_CONFIG, MISTAKE_STATUS_CONFIG } from '@/domain/mistake';
import { Button } from '@/components/ui/button';

export interface MistakeFilterBarProps {
  filters: MistakeFilterOptions;
  onFilterChange: (filters: MistakeFilterOptions) => void;
  onResetFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

const SUBJECT_OPTIONS: { id: SubjectId | 'all'; label: string }[] = [
  { id: 'all', label: 'All Subjects' },
  { id: 'math', label: 'Mathematics (গণিত)' },
  { id: 'physics', label: 'Physics (পদার্থ বিজ্ঞান)' },
  { id: 'chemistry', label: 'Chemistry (রসায়ন)' },
  { id: 'english', label: 'English (ইংরেজি)' },
  { id: 'cse', label: 'Computer Science & Engineering' },
];

const URGENCY_OPTIONS: { id: MistakeUrgencyFilter; label: string }[] = [
  { id: 'all', label: 'All Review Timelines' },
  { id: 'due', label: 'Due / Overdue for Review' },
  { id: 'scheduled', label: 'Scheduled Ahead' },
  { id: 'no_date', label: 'No Review Date Set' },
];

const SORT_OPTIONS: { id: MistakeSortOption; label: string }[] = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'review_date', label: 'Review Date (Soonest)' },
  { id: 'status', label: 'Status Priority (Unresolved)' },
];

export const MistakeFilterBar: React.FC<MistakeFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalCount,
  filteredCount,
}) => {
  const isFiltered =
    !!filters.searchQuery ||
    (filters.subjectId && filters.subjectId !== 'all') ||
    (filters.type && filters.type !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    (filters.urgency && filters.urgency !== 'all') ||
    (filters.sortBy && filters.sortBy !== 'newest');

  return (
    <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
      {/* Search Bar + Results Badge */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by topic, question reference, or reflection..."
            value={filters.searchQuery || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                searchQuery: e.target.value,
              })
            }
            className="w-full rounded-lg border border-input bg-background pl-9 pr-9 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              aria-label="Clear search query"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-md"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Results summary and Reset */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
          <span className="text-muted-foreground font-medium">
            Showing <strong className="text-foreground">{filteredCount}</strong> of{' '}
            <strong className="text-foreground">{totalCount}</strong>
          </span>

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Selects Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
        {/* Subject Select */}
        <div className="space-y-1">
          <label htmlFor="filter-subject" className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <Filter className="h-3 w-3" />
            <span>Subject</span>
          </label>
          <select
            id="filter-subject"
            value={filters.subjectId || 'all'}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                subjectId: e.target.value as SubjectId | 'all',
              })
            }
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {SUBJECT_OPTIONS.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.label}
              </option>
            ))}
          </select>
        </div>

        {/* Mistake Classification Select */}
        <div className="space-y-1">
          <label htmlFor="filter-type" className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <Filter className="h-3 w-3" />
            <span>Classification</span>
          </label>
          <select
            id="filter-type"
            value={filters.type || 'all'}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                type: e.target.value as MistakeType | 'all',
              })
            }
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Classifications</option>
            {Object.values(MISTAKE_TYPE_CONFIG).map((meta) => (
              <option key={meta.id} value={meta.id}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Select */}
        <div className="space-y-1">
          <label htmlFor="filter-status" className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <Filter className="h-3 w-3" />
            <span>Status</span>
          </label>
          <select
            id="filter-status"
            value={filters.status || 'all'}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                status: e.target.value as MistakeStatus | 'all',
              })
            }
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Statuses</option>
            {Object.values(MISTAKE_STATUS_CONFIG).map((meta) => (
              <option key={meta.id} value={meta.id}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>

        {/* Urgency / Review Timeline Select */}
        <div className="space-y-1">
          <label htmlFor="filter-urgency" className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <Filter className="h-3 w-3" />
            <span>Timeline</span>
          </label>
          <select
            id="filter-urgency"
            value={filters.urgency || 'all'}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                urgency: e.target.value as MistakeUrgencyFilter,
              })
            }
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {URGENCY_OPTIONS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Select */}
        <div className="space-y-1">
          <label htmlFor="filter-sort" className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3" />
            <span>Sort By</span>
          </label>
          <select
            id="filter-sort"
            value={filters.sortBy || 'newest'}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                sortBy: e.target.value as MistakeSortOption,
              })
            }
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

