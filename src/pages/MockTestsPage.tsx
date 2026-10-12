import React, { useEffect, useState, useMemo } from 'react';
import {
  Award,
  Plus,
  Search,
  SearchX,
  ArrowUpDown,
  BookCheck,
  CheckCircle2,
  FileCheck,
  X,
} from 'lucide-react';
import { useMockTestStore } from '@/stores/useMockTestStore';
import type { MockTest } from '@/domain/types';
import {
  filterMockTests,
  calculateMockTestMetrics,
  type MockTestScopeFilter,
  type MockTestSortOption,
} from '@/domain/mockTest';
import { MockTestCard } from '@/components/mock/MockTestCard';
import { RecordMockTestModal } from '@/components/mock/RecordMockTestModal';
import { MockTestComparisonModal } from '@/components/mock/MockTestComparisonModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ScopeTabOption {
  id: MockTestScopeFilter;
  label: string;
}

const SCOPE_TABS: ScopeTabOption[] = [
  { id: 'all', label: 'All Tests' },
  { id: 'full', label: 'Full Syllabus' },
  { id: 'math', label: 'Mathematics' },
  { id: 'physics', label: 'Physics' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'english', label: 'English' },
  { id: 'cse', label: 'CSE' },
];

export const MockTestsPage: React.FC = () => {
  const loadMockTests = useMockTestStore((state) => state.loadMockTests);
  const tests = useMockTestStore((state) => state.tests);
  const deleteMockTest = useMockTestStore((state) => state.deleteMockTest);
  const openRecordModal = useMockTestStore((state) => state.openRecordModal);

  const [selectedScope, setSelectedScope] = useState<MockTestScopeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<MockTestSortOption>('date-desc');
  const [selectedForCompare, setSelectedForCompare] = useState<MockTest[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    loadMockTests();
  }, [loadMockTests]);

  // Overall metrics across all recorded tests
  const metrics = useMemo(() => {
    return calculateMockTestMetrics(tests);
  }, [tests]);

  // Filtered and sorted tests list
  const filteredTests = useMemo(() => {
    return filterMockTests(tests, {
      scope: selectedScope,
      searchQuery,
      sortBy,
    });
  }, [tests, selectedScope, searchQuery, sortBy]);

  // Scope counts for tab badges
  const scopeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: tests.length,
      full: 0,
      math: 0,
      physics: 0,
      chemistry: 0,
      english: 0,
      cse: 0,
    };

    for (const t of tests) {
      if (t.subjectId === undefined) {
        counts.full = (counts.full || 0) + 1;
      } else {
        counts[t.subjectId] = (counts[t.subjectId] || 0) + 1;
      }
    }

    return counts;
  }, [tests]);

  // Handle toggling test comparison selection
  const handleToggleCompare = (test: MockTest) => {
    setSelectedForCompare((prev) => {
      const exists = prev.some((t) => t.id === test.id);
      if (exists) {
        return prev.filter((t) => t.id !== test.id);
      }
      if (prev.length >= 2) {
        // Replace second test if already 2 selected
        return [prev[0], test];
      }
      return [...prev, test];
    });
  };

  const handleClearCompare = () => {
    setSelectedForCompare([]);
  };

  const handleResetFilters = () => {
    setSelectedScope('all');
    setSearchQuery('');
    setSortBy('date-desc');
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Mock Test History
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse previous model tests, track DUET negative marking scores, and compare performance
          </p>
        </div>
        <Button
          onClick={() => openRecordModal()}
          className="self-start sm:self-center gap-1.5 shadow-xs w-full sm:w-auto min-h-[40px]"
        >
          <Plus className="h-4 w-4" />
          <span>Record Mock Test</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {/* Total Tests */}
        <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tests Taken
            </span>
            <FileCheck className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight">{metrics.totalTests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalQuestionsAttempted} questions attempted
            </p>
          </div>
        </div>

        {/* Average Score */}
        <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Average Score
            </span>
            <Award className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight">{metrics.averageScore.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              DUET negative weighted
            </p>
          </div>
        </div>

        {/* Average Accuracy */}
        <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Average Accuracy
            </span>
            <BookCheck className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight">{metrics.averageAccuracy}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across attempted questions
            </p>
          </div>
        </div>

        {/* Highest Score */}
        <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Highest Score
            </span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight">{metrics.highestScore.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Personal best score
            </p>
          </div>
        </div>
      </div>

      {/* Comparison floating/sticky notification bar */}
      {selectedForCompare.length > 0 && (
        <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/10 flex flex-wrap items-center justify-between gap-3 animate-in fade-in-0">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            <span>
              {selectedForCompare.length === 1 ? (
                <>
                  Selected: <strong>{selectedForCompare[0].testName}</strong>. Select 1 more test to compare.
                </>
              ) : (
                <>
                  Ready to compare <strong>{selectedForCompare[0].testName}</strong> and <strong>{selectedForCompare[1].testName}</strong>.
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedForCompare.length === 2 && (
              <Button
                size="sm"
                onClick={() => setIsCompareModalOpen(true)}
                className="gap-1.5 h-8 text-xs font-semibold"
              >
                <Award className="h-3.5 w-3.5" />
                <span>Compare Tests</span>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearCompare}
              className="h-8 text-xs gap-1"
            >
              <X className="h-3 w-3" />
              <span>Cancel</span>
            </Button>
          </div>
        </div>
      )}

      {/* Search, Scope Tabs, and Sorting Controls */}
      <div className="space-y-4">
        {/* Scope Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-border/60">
          {SCOPE_TABS.map((tab) => {
            const count = scopeCounts[tab.id] || 0;
            const isActive = selectedScope === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedScope(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search tests by title or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-input bg-background pl-9 pr-8 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={sortBy}
              aria-label="Sort tests by"
              onChange={(e) => setSortBy(e.target.value as MockTestSortOption)}
              className="rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="score-desc">Highest Score</option>
              <option value="score-asc">Lowest Score</option>
              <option value="accuracy-desc">Highest Accuracy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tests Grid / Empty States */}
      {tests.length === 0 ? (
        /* Empty State 1: Zero mock tests recorded */
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-2xl bg-card border-dashed space-y-4">
          <div className="p-4 rounded-2xl bg-primary/10 text-primary">
            <Award className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-lg font-bold text-foreground">No Mock Tests Recorded Yet</h3>
            <p className="text-xs text-muted-foreground">
              Log your DUET full model tests and subject sectional exams with automatic -0.25 negative marking breakdown.
            </p>
          </div>
          <Button onClick={() => openRecordModal()} className="gap-1.5 shadow-xs">
            <Plus className="h-4 w-4" />
            <span>Record Your First Mock Test</span>
          </Button>
        </div>
      ) : filteredTests.length === 0 ? (
        /* Empty State 2: Filters returned 0 tests */
        <div className="flex flex-col items-center justify-center py-14 px-4 text-center border rounded-2xl bg-card space-y-3">
          <div className="p-3 rounded-xl bg-muted text-muted-foreground">
            <SearchX className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">No Tests Match Your Filter</h3>
            <p className="text-xs text-muted-foreground">
              No recorded mock tests found matching &quot;{searchQuery || selectedScope}&quot;.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        /* Test Cards Grid */
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {filteredTests.map((test) => (
            <MockTestCard
              key={test.id}
              test={test}
              allTests={tests}
              isSelectedForCompare={selectedForCompare.some((t) => t.id === test.id)}
              onToggleCompare={handleToggleCompare}
              onDelete={deleteMockTest}
            />
          ))}
        </div>
      )}

      {/* Record Mock Test Modal */}
      <RecordMockTestModal />

      {/* Mock Test Comparison Modal */}
      <MockTestComparisonModal
        isOpen={isCompareModalOpen}
        testA={selectedForCompare[0] || null}
        testB={selectedForCompare[1] || null}
        onClose={() => setIsCompareModalOpen(false)}
      />
    </div>
  );
};

