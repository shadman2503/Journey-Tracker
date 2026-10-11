import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, BookCheck, Clock, Plus, Award, Target, X, Sparkles } from 'lucide-react';
import { useTopicProgressStore } from '@/stores/useTopicProgressStore';
import { useStudySessionStore } from '@/stores/useStudySessionStore';
import { useMockTestStore } from '@/stores/useMockTestStore';
import { useMistakeStore } from '@/stores/useMistakeStore';
import { syllabusRepository } from '@/repositories/syllabusRepository';
import type { SyllabusTopic, SubjectId } from '@/domain/types';
import { calculateOverallProgress } from '@/domain/calculations';
import { calculateStudyMetrics } from '@/domain/studySession';
import { calculateStreak } from '@/domain/streak';
import { detectWeakAreas } from '@/domain/weakArea';
import { generateRevisionRecommendations } from '@/domain/revisionRecommendations';
import { CountdownBanner } from '@/components/dashboard/CountdownBanner';
import { OverallProgressCard } from '@/components/dashboard/OverallProgressCard';
import { SubjectProgressGrid } from '@/components/dashboard/SubjectProgressGrid';
import { StudyStreakCard } from '@/components/dashboard/StudyStreakCard';
import { ActivityHeatmap } from '@/components/study/ActivityHeatmap';
import { RecordSessionModal } from '@/components/study/RecordSessionModal';
import { RecordMockTestModal } from '@/components/mock/RecordMockTestModal';
import { WeakAreaDashboardWidget } from '@/components/weakArea/WeakAreaDashboardWidget';
import { WeakAreaRadar } from '@/components/weakArea/WeakAreaRadar';
import { RevisionDashboardWidget } from '@/components/revision/RevisionDashboardWidget';
import { RevisionRecommendationsList } from '@/components/revision/RevisionRecommendationsList';
import { Button } from '@/components/ui/button';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<SyllabusTopic[]>([]);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState<boolean>(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState<boolean>(false);

  const loadProgress = useTopicProgressStore((state) => state.loadProgress);
  const progressMap = useTopicProgressStore((state) => state.progressMap);
  const loadSessions = useStudySessionStore((state) => state.loadSessions);
  const sessions = useStudySessionStore((state) => state.sessions);
  const openRecordModal = useStudySessionStore((state) => state.openRecordModal);
  const loadMockTests = useMockTestStore((state) => state.loadMockTests);
  const openMockModal = useMockTestStore((state) => state.openRecordModal);
  const loadMistakes = useMistakeStore((state) => state.loadMistakes);
  const mistakes = useMistakeStore((state) => state.mistakes);

  useEffect(() => {
    loadProgress();
    loadSessions();
    loadMockTests();
    loadMistakes();
    syllabusRepository.getAllTopics().then((data) => {
      setTopics(data);
    });
  }, [loadProgress, loadSessions, loadMockTests, loadMistakes]);

  const overallSummary = useMemo(() => {
    return calculateOverallProgress(topics, progressMap);
  }, [topics, progressMap]);

  const studyMetrics = useMemo(() => {
    return calculateStudyMetrics(sessions);
  }, [sessions]);

  const streakSummary = useMemo(() => {
    return calculateStreak(sessions.map((s) => s.date));
  }, [sessions]);

  const weakAreas = useMemo(() => {
    return detectWeakAreas(topics, progressMap, sessions, mistakes, new Date(), 20);
  }, [topics, progressMap, sessions, mistakes]);

  const revisionRecommendations = useMemo(() => {
    return generateRevisionRecommendations(
      topics,
      progressMap,
      sessions,
      mistakes,
      new Date(),
      { weakAreas }
    );
  }, [topics, progressMap, sessions, mistakes, weakAreas]);

  const handlePracticeTopic = (subjectId: SubjectId, topicId: string) => {
    setIsRadarModalOpen(false);
    openRecordModal({ subjectId, topicId });
  };

  const handleStartPracticeRevision = (
    subjectId: SubjectId,
    topicId: string,
    _suggestedDurationMinutes?: number
  ) => {
    setIsRevisionModalOpen(false);
    openRecordModal({ subjectId, topicId });
  };

  const handleViewMistakes = () => {
    setIsRadarModalOpen(false);
    setIsRevisionModalOpen(false);
    navigate('/mistakes');
  };

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

      {/* Weak Area Detection Radar Spotlight */}
      <WeakAreaDashboardWidget
        weakAreas={weakAreas}
        onViewRadar={() => setIsRadarModalOpen(true)}
        onPracticeTopic={handlePracticeTopic}
        onViewMistakes={handleViewMistakes}
      />

      {/* Revision Recommendations Planner Spotlight */}
      <RevisionDashboardWidget
        recommendations={revisionRecommendations}
        onViewPlan={() => setIsRevisionModalOpen(true)}
        onStartPractice={handleStartPracticeRevision}
        onViewMistakes={handleViewMistakes}
      />

      {/* Study Activity & Consistency Heatmap */}
      <ActivityHeatmap sessions={sessions} />

      {/* Full Weak Area Radar Dialog Modal */}
      {isRadarModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Weak Area Radar Dialog"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-4xl rounded-2xl border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <Target className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Weak Area Diagnostic Radar
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Multi-signal weakness analysis prioritizing topics by practice accuracy, mistakes, and revision decay
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRadarModalOpen(false)}
                aria-label="Close radar dialog"
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Radar Body */}
            <div className="py-4">
              <WeakAreaRadar
                weakAreas={weakAreas}
                onPracticeTopic={handlePracticeTopic}
                onViewMistakes={handleViewMistakes}
              />
            </div>
          </div>
        </div>
      )}

      {/* Full Revision Recommendations Dialog Modal */}
      {isRevisionModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Revision Recommendations Dialog"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-4xl rounded-2xl border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Smart Revision Recommendations
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Targeted study plan prioritized by memory decay intervals and weakness diagnoses
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(false)}
                aria-label="Close revision dialog"
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Plan Body */}
            <div className="py-4">
              <RevisionRecommendationsList
                recommendations={revisionRecommendations}
                onStartPractice={handleStartPracticeRevision}
                onViewMistakes={handleViewMistakes}
              />
            </div>
          </div>
        </div>
      )}

      {/* Record Study Session Modal */}
      <RecordSessionModal />

      {/* Record Mock Test Modal */}
      <RecordMockTestModal />
    </div>
  );
};
