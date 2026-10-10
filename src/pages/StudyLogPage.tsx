import React, { useEffect, useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  BookCheck,
  Award,
  Search,
  SearchX,
  Plus,
  ArrowUpDown,
  BookOpen,
  Flame,
} from 'lucide-react';
import { useStudySessionStore } from '@/stores/useStudySessionStore';
import { syllabusRepository } from '@/repositories/syllabusRepository';
import type { SubjectId, SyllabusTopic } from '@/domain/types';
import {
  calculateStudyMetrics,
  filterStudySessions,
  type StudySessionSortOption,
} from '@/domain/studySession';
import { calculateStreak } from '@/domain/streak';
import { StudySessionCard } from '@/components/study/StudySessionCard';
import { ActivityHeatmap } from '@/components/study/ActivityHeatmap';
import { RecordSessionModal } from '@/components/study/RecordSessionModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SUBJECT_FILTER_TABS: { id: SubjectId | 'all'; label: string }[] = [
  { id: 'all', label: 'All Subjects' },
  { id: 'math', label: 'Mathematics' },
  { id: 'physics', label: 'Physics' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'english', label: 'English' },
  { id: 'cse', label: 'CSE' },
];

export const StudyLogPage: React.FC = () => {
  const loadSessions = useStudySessionStore((state) => state.loadSessions);
  const sessions = useStudySessionStore((state) => state.sessions);
  const deleteSession = useStudySessionStore((state) => state.deleteSession);
  const openRecordModal = useStudySessionStore((state) => state.openRecordModal);

  const [topicsMap, setTopicsMap] = useState<Record<string, SyllabusTopic>>({});
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<StudySessionSortOption>('date-desc');

  useEffect(() => {
    loadSessions();
    syllabusRepository.getAllTopics().then((topics) => {
      const map: Record<string, SyllabusTopic> = {};
      for (const t of topics) {
        map[t.id] = t;
      }
      setTopicsMap(map);
    });
  }, [loadSessions]);

  // Overall metrics across all recorded sessions
  const overallMetrics = useMemo(() => {
    return calculateStudyMetrics(sessions);
  }, [sessions]);

  // Filtered & sorted session list
  const filteredSessions = useMemo(() => {
    return filterStudySessions(sessions, {
      subjectId: selectedSubject,
      searchQuery,
      topicsMap,
      sortBy,
    });
  }, [sessions, selectedSubject, searchQuery, topicsMap, sortBy]);

  // Streak summary across recorded sessions
  const streakSummary = useMemo(() => {
    return calculateStreak(sessions.map((s) => s.date));
  }, [sessions]);

  // Counts per subject
  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = { all: sessions.length };
    for (const s of sessions) {
      counts[s.subjectId] = (counts[s.subjectId] || 0) + 1;
    }
    return counts;
  }, [sessions]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Study Session History
            </h1>
            {streakSummary.currentStreak > 0 && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                  streakSummary.status === 'active'
                    ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                )}
                title={streakSummary.message}
              >
                <Flame className="h-3 w-3 fill-orange-500 text-orange-500" />
                <span>{streakSummary.currentStreak}d Streak</span>
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            Review your logged practice duration, problems solved, and concept notes
          </p>
        </div>

        <Button
          onClick={() => openRecordModal()}
          className="self-start sm:self-center gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Record Study Session</span>
        </Button>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Total Sessions */}
        <div className="rounded-xl border bg-card p-4.5 shadow-xs">
          <div className="flex items-center justify-between pb-1.5 text-muted-foreground">
            <span className="text-xs font-medium">Logged Sessions</span>
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {overallMetrics.sessionCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Total recorded study entries
          </p>
        </div>

        {/* Total Study Time */}
        <div className="rounded-xl border bg-card p-4.5 shadow-xs">
          <div className="flex items-center justify-between pb-1.5 text-muted-foreground">
            <span className="text-xs font-medium">Total Study Time</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {overallMetrics.totalHoursFormatted}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {overallMetrics.totalMinutes} minutes invested
          </p>
        </div>

        {/* Questions Solved */}
        <div className="rounded-xl border bg-card p-4.5 shadow-xs">
          <div className="flex items-center justify-between pb-1.5 text-muted-foreground">
            <span className="text-xs font-medium">Questions Solved</span>
            <BookCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {overallMetrics.totalQuestionsSolved}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {overallMetrics.totalCorrectAnswers} correct answers
          </p>
        </div>

        {/* Average Accuracy */}
        <div className="rounded-xl border bg-card p-4.5 shadow-xs">
          <div className="flex items-center justify-between pb-1.5 text-muted-foreground">
            <span className="text-xs font-medium">Practice Accuracy</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {overallMetrics.totalQuestionsSolved > 0
              ? `${overallMetrics.overallAccuracy}%`
              : 'N/A'}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Across all practice sets
          </p>
        </div>
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap sessions={sessions} />

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        {/* Subject Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {SUBJECT_FILTER_TABS.map((tab) => {
            const count = subjectCounts[tab.id] || 0;
            const isSelected = selectedSubject === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedSubject(tab.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full text-[10px] font-semibold',
                    isSelected
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, chapters, or notes..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as StudySessionSortOption)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="date-desc">Newest Date First</option>
              <option value="date-asc">Oldest Date First</option>
              <option value="duration-desc">Longest Duration</option>
              <option value="questions-desc">Most Questions Solved</option>
              <option value="accuracy-desc">Highest Accuracy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Session Cards List */}
      <div className="space-y-3">
        {sessions.length === 0 ? (
          /* Empty state: No sessions at all */
          <div className="py-16 px-4 text-center rounded-2xl border border-dashed bg-card/50 space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-bold text-base text-foreground">
                No study sessions recorded yet
              </h3>
              <p className="text-xs text-muted-foreground">
                Log your first practice session to start tracking your time, problem accuracy, and syllabus progress.
              </p>
            </div>
            <Button
              onClick={() => openRecordModal()}
              className="gap-1.5 text-xs shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Record Your First Session</span>
            </Button>
          </div>
        ) : filteredSessions.length === 0 ? (
          /* Empty state: Filter returned 0 */
          <div className="py-16 px-4 text-center rounded-2xl border border-dashed bg-card/50 space-y-3">
            <SearchX className="mx-auto h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-foreground">
                No sessions match your filter
              </h3>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search query or subject filter to find logged sessions.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedSubject('all');
                setSearchQuery('');
              }}
              className="text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          /* Populated List */
          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredSessions.map((session) => (
              <StudySessionCard
                key={session.id ?? `${session.date}-${session.topicId}`}
                session={session}
                topicName={topicsMap[session.topicId]?.name}
                onDelete={deleteSession}
              />
            ))}
          </div>
        )}
      </div>

      {/* Record Study Session Modal */}
      <RecordSessionModal />
    </div>
  );
};

