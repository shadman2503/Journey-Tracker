import React, { useEffect, useState, useMemo } from 'react';
import { Compass, Flame, BookCheck, Clock } from 'lucide-react';
import { useTopicProgressStore } from '@/stores/useTopicProgressStore';
import { syllabusRepository } from '@/repositories/syllabusRepository';
import type { SyllabusTopic } from '@/domain/types';
import { calculateOverallProgress } from '@/domain/calculations';
import { CountdownBanner } from '@/components/dashboard/CountdownBanner';
import { OverallProgressCard } from '@/components/dashboard/OverallProgressCard';
import { SubjectProgressGrid } from '@/components/dashboard/SubjectProgressGrid';

export const DashboardPage: React.FC = () => {
  const [topics, setTopics] = useState<SyllabusTopic[]>([]);
  const loadProgress = useTopicProgressStore((state) => state.loadProgress);
  const progressMap = useTopicProgressStore((state) => state.progressMap);

  useEffect(() => {
    loadProgress();
    syllabusRepository.getAllTopics().then((data) => {
      setTopics(data);
    });
  }, [loadProgress]);

  const overallSummary = useMemo(() => {
    return calculateOverallProgress(topics, progressMap);
  }, [topics, progressMap]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">
          DUET 2027 Journey Dashboard
        </h1>
        <p className="text-muted-foreground text-sm">
          Turn a huge syllabus into a visible journey. Every completed topic brings you closer.
        </p>
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

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Current Streak
            </span>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold">0 days</div>
          <p className="text-xs text-muted-foreground mt-1">Consistency is key</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Questions Solved
            </span>
            <BookCheck className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground mt-1">Practice problem count</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Study Time
            </span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">0 hrs</div>
          <p className="text-xs text-muted-foreground mt-1">Total recorded sessions</p>
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
    </div>
  );
};
