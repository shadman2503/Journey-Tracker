import React, { useEffect, useState, useMemo } from 'react';
import { Compass, BookCheck, Clock, Plus, Award } from 'lucide-react';
import { useTopicProgressStore } from '@/stores/useTopicProgressStore';
import { useStudySessionStore } from '@/stores/useStudySessionStore';
import { useMockTestStore } from '@/stores/useMockTestStore';
import { syllabusRepository } from '@/repositories/syllabusRepository';
import type { SyllabusTopic } from '@/domain/types';
import { calculateOverallProgress } from '@/domain/calculations';
import { calculateStudyMetrics } from '@/domain/studySession';
import { calculateStreak } from '@/domain/streak';
import { CountdownBanner } from '@/components/dashboard/CountdownBanner';
import { OverallProgressCard } from '@/components/dashboard/OverallProgressCard';
import { SubjectProgressGrid } from '@/components/dashboard/SubjectProgressGrid';
import { StudyStreakCard } from '@/components/dashboard/StudyStreakCard';
import { ActivityHeatmap } from '@/components/study/ActivityHeatmap';
import { RecordSessionModal } from '@/components/study/RecordSessionModal';
import { RecordMockTestModal } from '@/components/mock/RecordMockTestModal';
import { Button } from '@/components/ui/button';

export const DashboardPage: React.FC = () => {
  const [topics, setTopics] = useState<SyllabusTopic[]>([]);
  const loadProgress = useTopicProgressStore((state) => state.loadProgress);
  const progressMap = useTopicProgressStore((state) => state.progressMap);
  const loadSessions = useStudySessionStore((state) => state.loadSessions);
  const sessions = useStudySessionStore((state) => state.sessions);
  const openRecordModal = useStudySessionStore((state) => state.openRecordModal);
  const loadMockTests = useMockTestStore((state) => state.loadMockTests);
  const openMockModal = useMockTestStore((state) => state.openRecordModal);

  useEffect(() => {
    loadProgress();
    loadSessions();
    loadMockTests();
    syllabusRepository.getAllTopics().then((data) => {
      setTopics(data);
    });
  }, [loadProgress, loadSessions, loadMockTests]);

  const overallSummary = useMemo(() => {
    return calculateOverallProgress(topics, progressMap);
  }, [topics, progressMap]);

  const studyMetrics = useMemo(() => {
    return calculateStudyMetrics(sessions);
  }, [sessions]);

  const streakSummary = useMemo(() => {
    return calculateStreak(sessions.map((s) => s.date));
  }, [sessions]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight">
            DUET 2027 Journey Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Turn a huge syllabus into a visible journey. Every completed topic brings you closer.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
          <Button
            variant="outline"
            onClick={() => openMockModal()}
            className="gap-1.5 shadow-xs"
          >
            <Award className="h-4 w-4 text-primary" />
            <span>Record Mock Test</span>
          </Button>
          <Button
            onClick={() => openRecordModal()}
            className="gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Record Study Session</span>
          </Button>
        </div>
      </div>

      {/* Countdown Hero Banner */}
      <CountdownBanner />

      {/* Top Level Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Overall Completion
            </span>
            <Compass className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold">{overallSummary.percentage}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {overallSummary.completedTopics} of {overallSummary.totalTopics} topics mastered
          </p>
        </div>

        <StudyStreakCard summary={streakSummary} />

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Questions Solved
            </span>
            <BookCheck className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{studyMetrics.totalQuestionsSolved}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {studyMetrics.totalQuestionsSolved > 0
              ? `${studyMetrics.overallAccuracy}% practice accuracy`
              : 'Practice problem count'}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Study Time
            </span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{studyMetrics.totalHoursFormatted}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {studyMetrics.sessionCount > 0
              ? `${studyMetrics.sessionCount} recorded ${studyMetrics.sessionCount === 1 ? 'session' : 'sessions'}`
              : 'Total recorded sessions'}
          </p>
        </div>
      </div>

      {/* Syllabus Progress Overview Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Syllabus Progress Overview
            </h2>
            <p className="text-xs text-muted-foreground">
              Track mastery weights and subject readiness for the DUET admission test
            </p>
          </div>
        </div>

        <OverallProgressCard summary={overallSummary} />

        <SubjectProgressGrid subjects={overallSummary.subjects} />
      </div>

      {/* Study Activity & Consistency Heatmap */}
      <ActivityHeatmap sessions={sessions} />

      {/* Record Study Session Modal */}
      <RecordSessionModal />

      {/* Record Mock Test Modal */}
      <RecordMockTestModal />
    </div>
  );
};
