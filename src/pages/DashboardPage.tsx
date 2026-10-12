import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  BookCheck,
  Clock,
  Plus,
  Award,
  Target,
  X,
  Sparkles,
  AlertTriangle,
  Database,
} from 'lucide-react';
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
import { useMilestoneStore } from '@/stores/useMilestoneStore';
import { MilestoneDashboardWidget } from '@/components/milestones/MilestoneDashboardWidget';
import { AddMilestoneModal } from '@/components/milestones/AddMilestoneModal';
import { MockPerformanceDashboardWidget } from '@/components/dashboard/MockPerformanceDashboardWidget';
import { MistakesDashboardWidget } from '@/components/dashboard/MistakesDashboardWidget';
import { RecordMistakeModal } from '@/components/mistake/RecordMistakeModal';
import { MistakeReviewModal } from '@/components/mistake/MistakeReviewModal';
import { DataBackupModal } from '@/components/backup/DataBackupModal';
import { Button } from '@/components/ui/button';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<SyllabusTopic[]>([]);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState<boolean>(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] =
    useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);

  const loadProgress = useTopicProgressStore((state) => state.loadProgress);
  const progressMap = useTopicProgressStore((state) => state.progressMap);
  const loadSessions = useStudySessionStore((state) => state.loadSessions);
  const sessions = useStudySessionStore((state) => state.sessions);
  const openRecordModal = useStudySessionStore(
    (state) => state.openRecordModal,
  );
  const loadMockTests = useMockTestStore((state) => state.loadMockTests);
  const openMockModal = useMockTestStore((state) => state.openRecordModal);
  const loadMistakes = useMistakeStore((state) => state.loadMistakes);
  const mistakes = useMistakeStore((state) => state.mistakes);
  const openMistakeRecordModal = useMistakeStore(
    (state) => state.openRecordModal,
  );
  const openReviewSession = useMistakeStore((state) => state.openReviewSession);
  const mockTests = useMockTestStore((state) => state.tests);

  const loadCustomMilestones = useMilestoneStore(
    (state) => state.loadCustomMilestones,
  );
  const customMilestones = useMilestoneStore((state) => state.customMilestones);
  const getUnifiedMilestones = useMilestoneStore(
    (state) => state.getUnifiedMilestones,
  );
  const addCustomMilestone = useMilestoneStore(
    (state) => state.addCustomMilestone,
  );
  const isMilestoneModalOpen = useMilestoneStore(
    (state) => state.isAddModalOpen,
  );
  const openMilestoneModal = useMilestoneStore((state) => state.openAddModal);
  const closeMilestoneModal = useMilestoneStore((state) => state.closeAddModal);

  useEffect(() => {
    loadProgress();
    loadSessions();
    loadMockTests();
    loadMistakes();
    loadCustomMilestones();
    syllabusRepository.getAllTopics().then((data) => {
      setTopics(data);
    });
  }, [
    loadProgress,
    loadSessions,
    loadMockTests,
    loadMistakes,
    loadCustomMilestones,
  ]);

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
    return detectWeakAreas(
      topics,
      progressMap,
      sessions,
      mistakes,
      new Date(),
      20,
    );
  }, [topics, progressMap, sessions, mistakes]);

  const revisionRecommendations = useMemo(() => {
    return generateRevisionRecommendations(
      topics,
      progressMap,
      sessions,
      mistakes,
      new Date(),
      { weakAreas },
    );
  }, [topics, progressMap, sessions, mistakes, weakAreas]);

  const unifiedMilestones = useMemo(() => {
    return getUnifiedMilestones(topics, progressMap, sessions, mockTests);
  }, [
    getUnifiedMilestones,
    customMilestones,
    topics,
    progressMap,
    sessions,
    mockTests,
  ]);

  const handlePracticeTopic = (subjectId: SubjectId, topicId: string) => {
    setIsRadarModalOpen(false);
    openRecordModal({ subjectId, topicId });
  };

  const handleStartPracticeRevision = (
    subjectId: SubjectId,
    topicId: string,
    _suggestedDurationMinutes?: number,
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
    <div className='space-y-8'>
      {/* Page Header & Command Center Actions Toolbar */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-3xl font-extrabold tracking-tight text-foreground'>
            It is Now or <span className='text-primary'>Never.</span>
          </h1>
          <div className='h-1 w-16 rounded-full bg-primary shadow-[0_0_8px_rgba(246,192,122,0.4)]' />
        </div>
        <div className='grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto'>
          <Button
            variant='outline'
            onClick={() => openMockModal()}
            className='gap-1.5 shadow-xs w-full sm:w-auto text-xs sm:text-sm min-h-[40px] px-2.5 sm:px-3'
          >
            <Award className='h-4 w-4 text-sky-500 shrink-0' />
            <span className='truncate'>Record Mock Test</span>
          </Button>
          <Button
            variant='outline'
            onClick={() => openMistakeRecordModal()}
            className='gap-1.5 shadow-xs w-full sm:w-auto text-xs sm:text-sm min-h-[40px] px-2.5 sm:px-3'
          >
            <AlertTriangle className='h-4 w-4 text-rose-500 shrink-0' />
            <span className='truncate'>Log Mistake</span>
          </Button>
          <Button
            variant='outline'
            onClick={() => setIsBackupModalOpen(true)}
            className='gap-1.5 shadow-xs w-full sm:w-auto text-xs sm:text-sm min-h-[40px] px-2.5 sm:px-3'
            aria-label='Backup and restore data'
          >
            <Database className='h-4 w-4 text-primary shrink-0' />
            <span className='truncate'>Backup</span>
          </Button>
          <Button
            onClick={() => openRecordModal()}
            className='gap-1.5 shadow-xs w-full sm:w-auto text-xs sm:text-sm min-h-[40px] px-2.5 sm:px-3'
          >
            <Plus className='h-4 w-4 shrink-0' />
            <span className='truncate'>Record Study Session</span>
          </Button>
        </div>
      </div>

      {/* Countdown Hero Banner */}
      <CountdownBanner />

      {/* Top Level Metric Cards */}
      <div className='grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-xl border bg-card p-6 shadow-sm'>
          <div className='flex items-center justify-between pb-2'>
            <span className='text-sm font-medium text-muted-foreground'>
              Overall Completion
            </span>
            <Compass className='h-4 w-4 text-primary' />
          </div>
          <div className='text-2xl font-bold'>{overallSummary.percentage}%</div>
          <p className='text-xs text-muted-foreground mt-1'>
            {overallSummary.completedTopics} of {overallSummary.totalTopics}{' '}
            topics mastered
          </p>
        </div>

        <StudyStreakCard summary={streakSummary} />

        <div className='rounded-xl border bg-card p-6 shadow-sm'>
          <div className='flex items-center justify-between pb-2'>
            <span className='text-sm font-medium text-muted-foreground'>
              Questions Solved
            </span>
            <BookCheck className='h-4 w-4 text-green-500' />
          </div>
          <div className='text-2xl font-bold'>
            {studyMetrics.totalQuestionsSolved}
          </div>
          <p className='text-xs text-muted-foreground mt-1'>
            {studyMetrics.totalQuestionsSolved > 0
              ? `${studyMetrics.overallAccuracy}% practice accuracy`
              : 'Practice problem count'}
          </p>
        </div>

        <div className='rounded-xl border bg-card p-6 shadow-sm'>
          <div className='flex items-center justify-between pb-2'>
            <span className='text-sm font-medium text-muted-foreground'>
              Study Time
            </span>
            <Clock className='h-4 w-4 text-blue-500' />
          </div>
          <div className='text-2xl font-bold'>
            {studyMetrics.totalHoursFormatted}
          </div>
          <p className='text-xs text-muted-foreground mt-1'>
            {studyMetrics.sessionCount > 0
              ? `${studyMetrics.sessionCount} recorded ${studyMetrics.sessionCount === 1 ? 'session' : 'sessions'}`
              : 'Total recorded sessions'}
          </p>
        </div>
      </div>

      {/* Syllabus Progress Overview Section */}
      <div className='space-y-6'>
        <div className='flex items-center justify-between border-b pb-3'>
          <div>
            <h2 className='text-lg font-bold tracking-tight text-foreground'>
              Syllabus Progress Overview
            </h2>
            <p className='text-xs text-muted-foreground'>
              Track mastery weights and subject readiness for the DUET admission
              test
            </p>
          </div>
        </div>

        <OverallProgressCard summary={overallSummary} />

        <SubjectProgressGrid subjects={overallSummary.subjects} />
      </div>

      {/* Diagnostic & Performance Intelligence Command Center */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Column 1: Diagnostic Radar & Revision Planner */}
        <div className='space-y-6'>
          <WeakAreaDashboardWidget
            weakAreas={weakAreas}
            onViewRadar={() => setIsRadarModalOpen(true)}
            onPracticeTopic={handlePracticeTopic}
            onViewMistakes={handleViewMistakes}
          />

          <RevisionDashboardWidget
            recommendations={revisionRecommendations}
            onViewPlan={() => setIsRevisionModalOpen(true)}
            onStartPractice={handleStartPracticeRevision}
            onViewMistakes={handleViewMistakes}
          />
        </div>

        {/* Column 2: Mock Performance & Mistake Journal */}
        <div className='space-y-6'>
          <MockPerformanceDashboardWidget
            tests={mockTests}
            onRecordMockTest={() => openMockModal()}
            onViewAll={() => navigate('/mock-tests')}
          />

          <MistakesDashboardWidget
            mistakes={mistakes}
            topics={topics}
            onLogMistake={() => openMistakeRecordModal()}
            onReviewMistakes={() => openReviewSession()}
            onViewAll={() => navigate('/mistakes')}
          />
        </div>
      </div>

      {/* Journey Milestones Spotlight */}
      <MilestoneDashboardWidget
        milestones={unifiedMilestones}
        onViewAll={() => navigate('/journey')}
        onAddGoal={openMilestoneModal}
      />

      {/* Study Activity & Consistency Heatmap */}
      <ActivityHeatmap sessions={sessions} />

      {/* Full Weak Area Radar Dialog Modal */}
      {isRadarModalOpen && (
        <div
          role='dialog'
          aria-modal='true'
          aria-label='Weak Area Radar Dialog'
          className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs'
        >
          <div className='relative w-full max-w-4xl rounded-2xl border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto'>
            {/* Header */}
            <div className='flex items-center justify-between pb-4 border-b'>
              <div className='flex items-center gap-2.5'>
                <span className='p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400'>
                  <Target className='h-5 w-5' />
                </span>
                <div>
                  <h2 className='text-lg font-bold text-foreground'>
                    Weak Area Diagnostic Radar
                  </h2>
                  <p className='text-xs text-muted-foreground'>
                    Multi-signal weakness analysis prioritizing topics by
                    practice accuracy, mistakes, and revision decay
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setIsRadarModalOpen(false)}
                aria-label='Close radar dialog'
                className='p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Radar Body */}
            <div className='py-4'>
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
          role='dialog'
          aria-modal='true'
          aria-label='Revision Recommendations Dialog'
          className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs'
        >
          <div className='relative w-full max-w-4xl rounded-2xl border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto'>
            {/* Header */}
            <div className='flex items-center justify-between pb-4 border-b'>
              <div className='flex items-center gap-2.5'>
                <span className='p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400'>
                  <Sparkles className='h-5 w-5' />
                </span>
                <div>
                  <h2 className='text-lg font-bold text-foreground'>
                    Smart Revision Recommendations
                  </h2>
                  <p className='text-xs text-muted-foreground'>
                    Targeted study plan prioritized by memory decay intervals
                    and weakness diagnoses
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setIsRevisionModalOpen(false)}
                aria-label='Close revision dialog'
                className='p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Plan Body */}
            <div className='py-4'>
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

      {/* Record Mistake Modal */}
      <RecordMistakeModal />

      {/* Spaced Mistake Review Session Modal */}
      <MistakeReviewModal />

      {/* Add Custom Milestone Modal */}
      <AddMilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={closeMilestoneModal}
        onSubmit={addCustomMilestone}
      />

      {/* Data Backup & Portability Modal */}
      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </div>
  );
};
