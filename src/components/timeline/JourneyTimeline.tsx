import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Calendar,
  Compass,
  Trophy,
  Clock,
  Target,
  X,
  Layers,
  Plus,
} from 'lucide-react';
import type { Milestone, MilestoneCategory } from '@/domain/types';
import {
  buildTimelineItems,
  groupTimelineByMonth,
  calculateTimelineStats,
} from '@/domain/timeline';
import { ALL_MILESTONE_CATEGORIES } from '@/domain/milestones';
import { TimelineNode } from './TimelineNode';
import { TimelineDestinationNode } from './TimelineDestinationNode';
import { Button } from '@/components/ui/button';

interface JourneyTimelineProps {
  milestones: Milestone[];
  targetExamDate: string;
  onOpenAddModal?: () => void;
  className?: string;
}

const CATEGORY_LABELS: Record<MilestoneCategory | 'destination', string> = {
  syllabus: 'Syllabus',
  streak: 'Streaks',
  mock: 'Mock Tests',
  question_count: 'Questions',
  study_time: 'Study Hours',
  custom: 'Personal Goals',
  destination: 'Exam Horizon',
};

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
  milestones,
  targetExamDate,
  onOpenAddModal,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    MilestoneCategory | 'destination' | 'all'
  >('all');
  const [sortOrder, setSortOrder] = useState<
    'oldest_to_newest' | 'newest_to_oldest'
  >('oldest_to_newest');

  // Stats calculation
  const stats = useMemo(
    () => calculateTimelineStats(milestones, targetExamDate),
    [milestones, targetExamDate],
  );

  // Build timeline items with filtering and sorting
  const timelineItems = useMemo(() => {
    return buildTimelineItems(milestones, targetExamDate, {
      category: selectedCategory,
      sortOrder,
      searchQuery,
    });
  }, [milestones, targetExamDate, selectedCategory, sortOrder, searchQuery]);

  // Group by month
  const monthGroups = useMemo(() => {
    return groupTimelineByMonth(timelineItems);
  }, [timelineItems]);

  const toggleSortOrder = () => {
    setSortOrder((prev) =>
      prev === 'oldest_to_newest' ? 'newest_to_oldest' : 'oldest_to_newest',
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortOrder('oldest_to_newest');
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 || selectedCategory !== 'all';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Journey Stats Overview Bar */}
      <div className="p-5 rounded-2xl border bg-card text-card-foreground shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground tracking-tight">
                Preparation Journey Progress
              </h3>
              <p className="text-xs text-muted-foreground">
                From your first step to the DUET 2027 Admission Test
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="px-2.5 py-1 rounded-lg bg-muted text-foreground border">
              {stats.journeyProgressPercent}% Traversed
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden border">
          <div
            className="bg-primary h-full transition-all duration-500 rounded-full"
            style={{ width: `${Math.max(2, stats.journeyProgressPercent)}%` }}
            role="progressbar"
            aria-valuenow={stats.journeyProgressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-background/80 border flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">
                {stats.totalEvents}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Milestones Recorded
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-background/80 border flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 dark:text-sky-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">
                {stats.daysElapsed}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Days Elapsed
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-background/80 border flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">
                {stats.daysRemaining}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Days to DUET Exam
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Filter & Search Bar */}
      <div className="p-4 rounded-xl border bg-card text-card-foreground space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search timeline events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear timeline search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Toggle */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="h-9 gap-1.5 text-xs shrink-0"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>
                {sortOrder === 'oldest_to_newest'
                  ? 'Chronological (Exam ahead)'
                  : 'Latest First'}
              </span>
            </Button>

            {/* Add Goal */}
            {onOpenAddModal && (
              <Button
                type="button"
                size="sm"
                onClick={onOpenAddModal}
                className="h-9 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Add Goal</span>
              </Button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none border-t pt-3">
          <span className="text-xs font-semibold text-muted-foreground mr-1 shrink-0">
            Category:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-foreground text-background border-foreground font-semibold'
                : 'bg-muted/40 text-muted-foreground hover:bg-muted border-border/40'
            }`}
          >
            All Events
          </button>
          {ALL_MILESTONE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-foreground text-background border-foreground font-semibold'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted border-border/40'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedCategory('destination')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors shrink-0 ${
              selectedCategory === 'destination'
                ? 'bg-foreground text-background border-foreground font-semibold'
                : 'bg-muted/40 text-muted-foreground hover:bg-muted border-border/40'
            }`}
          >
            Exam Horizon
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      {timelineItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed bg-card/50">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            No Events on Timeline
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
            {hasActiveFilters
              ? 'No timeline events match your active search or category filter.'
              : 'Start logging study sessions, syllabus topics, and mock tests to build your journey timeline.'}
          </p>
          <div className="flex items-center justify-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs"
              >
                Reset Filters
              </Button>
            )}
            {onOpenAddModal && (
              <Button
                size="sm"
                onClick={onOpenAddModal}
                className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Goal
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="relative pl-1 sm:pl-2">
          {monthGroups.map((group, groupIdx) => {
            const isLastGroup = groupIdx === monthGroups.length - 1;

            return (
              <div key={group.monthKey} className="relative">
                {/* Month Group Header */}
                <div className="relative flex items-center gap-4 my-6 first:mt-2">
                  <div className="flex items-center justify-center w-8 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary/40 border border-primary/60" />
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border shadow-2xs">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>{group.monthLabel}</span>
                    <span className="text-[11px] font-normal text-muted-foreground">
                      ({group.items.length}{' '}
                      {group.items.length === 1 ? 'event' : 'events'})
                    </span>
                  </div>
                </div>

                {/* Items in Month Group */}
                <div className="space-y-0">
                  {group.items.map((item, itemIdx) => {
                    const isLastInGroup = itemIdx === group.items.length - 1;
                    const isLastOverall = isLastGroup && isLastInGroup;

                    if (item.type === 'exam_destination') {
                      return (
                        <TimelineDestinationNode
                          key={item.id}
                          item={item}
                          daysRemaining={stats.daysRemaining}
                        />
                      );
                    }

                    return (
                      <TimelineNode
                        key={item.id}
                        item={item}
                        isLast={isLastOverall}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

