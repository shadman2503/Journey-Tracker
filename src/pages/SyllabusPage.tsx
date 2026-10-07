import React, { useState, useEffect, useMemo } from 'react';
import { syllabusRepository } from '@/repositories/syllabusRepository';
import type { SubjectId, SubjectMeta, SyllabusTopic, TopicStatus } from '@/domain/types';
import type { SectionGroup } from '@/repositories/interfaces';
import { calculateStatusBreakdown, STATUS_CONFIG, STATUS_ORDER } from '@/domain/progress';
import { useTopicProgressStore } from '@/stores/useTopicProgressStore';
import { SubjectTabs } from '@/components/syllabus/SubjectTabs';
import { SyllabusSearchBar } from '@/components/syllabus/SyllabusSearchBar';
import { ChapterAccordion } from '@/components/syllabus/ChapterAccordion';
import { TopicCard } from '@/components/syllabus/TopicCard';
import { Button } from '@/components/ui/button';
import { BookOpen, SearchX, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SyllabusPage: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectMeta[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>('math');
  const [sections, setSections] = useState<SectionGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SyllabusTopic[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | TopicStatus>('all');
  const [loading, setLoading] = useState<boolean>(true);

  const loadProgress = useTopicProgressStore((state) => state.loadProgress);
  const progressMap = useTopicProgressStore((state) => state.progressMap);

  // Load subject metadata & topic progress on mount
  useEffect(() => {
    syllabusRepository.getSubjects().then((data) => {
      setSubjects(data);
    });
    loadProgress();
  }, [loadProgress]);

  // Load sections and topics when selected subject changes
  useEffect(() => {
    setLoading(true);
    syllabusRepository.getSectionsBySubject(selectedSubjectId).then((data) => {
      setSections(data);
      setLoading(false);
    });
  }, [selectedSubjectId]);

  // Handle search queries
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    syllabusRepository
      .searchTopics(searchQuery, selectedSubjectId)
      .then((results) => {
        setSearchResults(results);
      });
  }, [searchQuery, selectedSubjectId]);

  const currentSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId),
    [subjects, selectedSubjectId]
  );

  const totalSubjectTopics = useMemo(
    () => currentSubject?.totalTopics ?? 0,
    [currentSubject]
  );

  // Flatten all topics for current subject to compute breakdown
  const currentSubjectTopics = useMemo(() => {
    return sections.flatMap((sec) => sec.chapters.flatMap((ch) => ch.topics));
  }, [sections]);

  const statusBreakdown = useMemo(() => {
    return calculateStatusBreakdown(currentSubjectTopics, progressMap);
  }, [currentSubjectTopics, progressMap]);

  // Filter sections by selectedStatusFilter
  const filteredSections = useMemo(() => {
    if (selectedStatusFilter === 'all') return sections;
    return sections
      .map((sec) => ({
        ...sec,
        chapters: sec.chapters
          .map((ch) => ({
            ...ch,
            topics: ch.topics.filter(
              (t) => (progressMap[t.id]?.status ?? 'not_started') === selectedStatusFilter
            ),
          }))
          .filter((ch) => ch.topics.length > 0),
      }))
      .filter((sec) => sec.chapters.length > 0);
  }, [sections, selectedStatusFilter, progressMap]);

  // Filter search results by selectedStatusFilter
  const filteredSearchResults = useMemo(() => {
    if (selectedStatusFilter === 'all') return searchResults;
    return searchResults.filter(
      (t) => (progressMap[t.id]?.status ?? 'not_started') === selectedStatusFilter
    );
  }, [searchResults, selectedStatusFilter, progressMap]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-primary font-medium text-sm">
          <BookOpen className="h-4 w-4" />
          <span>DUET Admission Syllabus</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Syllabus Explorer</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Browse and track preparation mastery across all 5 subjects. Update status and take notes on individual topics.
        </p>
      </div>

      {/* Subject Tabs */}
      {subjects.length > 0 && (
        <SubjectTabs
          subjects={subjects}
          selectedSubjectId={selectedSubjectId}
          onSelectSubject={(id) => {
            setSelectedSubjectId(id);
            setSearchQuery('');
            setSelectedStatusFilter('all');
          }}
        />
      )}

      {/* Search Bar & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="max-w-md flex-1">
          <SyllabusSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            resultCount={searchQuery ? filteredSearchResults.length : undefined}
            totalCount={totalSubjectTopics}
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            type="button"
            onClick={() => setSelectedStatusFilter('all')}
            className={cn(
              'px-2.5 py-1 rounded-full font-medium transition-colors border flex items-center gap-1.5 flex-shrink-0',
              selectedStatusFilter === 'all'
                ? 'bg-foreground text-background border-foreground font-semibold'
                : 'bg-muted/60 text-muted-foreground border-transparent hover:bg-muted'
            )}
          >
            <Filter className="h-3 w-3" />
            <span>All ({statusBreakdown.total})</span>
          </button>

          {STATUS_ORDER.map((statusKey) => {
            const config = STATUS_CONFIG[statusKey];
            const count = statusBreakdown[statusKey];
            const isSelected = selectedStatusFilter === statusKey;

            return (
              <button
                key={statusKey}
                type="button"
                onClick={() =>
                  setSelectedStatusFilter(isSelected ? 'all' : statusKey)
                }
                className={cn(
                  'px-2.5 py-1 rounded-full font-medium transition-colors border flex items-center gap-1.5 flex-shrink-0',
                  isSelected
                    ? cn(config.badgeClass, 'font-semibold border-current shadow-sm')
                    : 'bg-muted/60 text-muted-foreground border-transparent hover:bg-muted'
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', config.dotColorClass)} />
                <span>{config.label}</span>
                <span className="opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subject Description & Mastery Breakdown Card */}
      {currentSubject && !searchQuery && (
        <div className="p-4 rounded-xl border bg-card/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-semibold text-foreground text-base">
              {currentSubject.name}{' '}
              {currentSubject.nameBn && (
                <span className="text-muted-foreground font-normal">
                  ({currentSubject.nameBn})
                </span>
              )}
            </h2>
            <p className="text-xs text-muted-foreground">
              {currentSubject.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {statusBreakdown.strong} Strong
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium border border-amber-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {statusBreakdown.practicing} Practicing
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium border border-blue-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {statusBreakdown.learning} Learning
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium border border-rose-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              {statusBreakdown.needs_revision} Needs Revision
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium border">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
              {statusBreakdown.not_started} Not Started
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="py-16 text-center text-muted-foreground text-sm">
          Loading syllabus...
        </div>
      ) : searchQuery.trim() ? (
        /* Search Results View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Search Results ({filteredSearchResults.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="text-xs h-7"
            >
              Clear search
            </Button>
          </div>

          {filteredSearchResults.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-xl border border-dashed bg-card/40 space-y-3">
              <SearchX className="h-8 w-8 text-muted-foreground mx-auto" />
              <div className="space-y-1">
                <p className="font-medium text-sm text-foreground">No matching topics found</p>
                <p className="text-xs text-muted-foreground">
                  No topics in {currentSubject?.name} match &ldquo;{searchQuery}&rdquo;
                  {selectedStatusFilter !== 'all' ? ` with status "${STATUS_CONFIG[selectedStatusFilter].label}"` : ''}.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatusFilter('all');
                }}
                className="text-xs"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-1 md:grid-cols-2">
              {filteredSearchResults.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          )}
        </div>
      ) : selectedStatusFilter !== 'all' && filteredSections.length === 0 ? (
        /* Empty Filter View */
        <div className="py-12 px-4 text-center rounded-xl border border-dashed bg-card/40 space-y-3">
          <Filter className="h-8 w-8 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <p className="font-medium text-sm text-foreground">
              No topics with status &ldquo;{STATUS_CONFIG[selectedStatusFilter].label}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground">
              None of the {currentSubject?.name} topics are currently marked as {STATUS_CONFIG[selectedStatusFilter].label}.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedStatusFilter('all')}
            className="text-xs"
          >
            Show All Topics
          </Button>
        </div>
      ) : (
        /* Default Hierarchy View */
        <ChapterAccordion sections={filteredSections} />
      )}
    </div>
  );
};

