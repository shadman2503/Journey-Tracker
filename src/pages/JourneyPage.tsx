import React, { useEffect, useState, useMemo } from 'react';
import {
  Milestone as MilestoneIcon,
  Plus,
  Clock,
  LayoutGrid,
} from 'lucide-react';
import type { SyllabusTopic } from '@/domain/types';
import { syllabusRepository } from '@/repositories/syllabusRepository';
import { useTopicProgressStore } from '@/stores/useTopicProgressStore';
import { useStudySessionStore } from '@/stores/useStudySessionStore';
import { useMockTestStore } from '@/stores/useMockTestStore';
import { useMilestoneStore } from '@/stores/useMilestoneStore';
import { useCountdownStore } from '@/stores/useCountdownStore';
import { MilestoneList } from '@/components/milestones/MilestoneList';
import { JourneyTimeline } from '@/components/timeline/JourneyTimeline';
import { AddMilestoneModal } from '@/components/milestones/AddMilestoneModal';
import { Button } from '@/components/ui/button';

export const JourneyPage: React.FC = () => {
  const [topics, setTopics] = useState<SyllabusTopic[]>([]);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');

  const loadProgress = useTopicProgressStore((state) => state.loadProgress);
  const progressMap = useTopicProgressStore((state) => state.progressMap);

  const loadSessions = useStudySessionStore((state) => state.loadSessions);
  const sessions = useStudySessionStore((state) => state.sessions);

  const loadMockTests = useMockTestStore((state) => state.loadMockTests);
  const mockTests = useMockTestStore((state) => state.tests);

  const loadCustomMilestones = useMilestoneStore((state) => state.loadCustomMilestones);
  const customMilestones = useMilestoneStore((state) => state.customMilestones);
  const addCustomMilestone = useMilestoneStore((state) => state.addCustomMilestone);
  const deleteCustomMilestone = useMilestoneStore((state) => state.deleteCustomMilestone);
  const isAddModalOpen = useMilestoneStore((state) => state.isAddModalOpen);
  const openAddModal = useMilestoneStore((state) => state.openAddModal);
  const closeAddModal = useMilestoneStore((state) => state.closeAddModal);
  const getUnifiedMilestones = useMilestoneStore((state) => state.getUnifiedMilestones);

  const targetDate = useCountdownStore((state) => state.targetDate);
  const examDateFormatted = (targetDate || '2027-06-20').slice(0, 10);

  useEffect(() => {
    syllabusRepository.getAllTopics().then(setTopics);
    loadProgress();
    loadSessions();
    loadMockTests();
    loadCustomMilestones();
  }, [loadProgress, loadSessions, loadMockTests, loadCustomMilestones]);

  const unifiedMilestones = useMemo(() => {
    return getUnifiedMilestones(topics, progressMap, sessions, mockTests);
  }, [getUnifiedMilestones, customMilestones, topics, progressMap, sessions, mockTests]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400">
            <MilestoneIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Preparation Journey & Milestones
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Celebrate key achievements, track unlocked benchmarks, and navigate your path to DUET 2027
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Segmented View Switcher: [ Timeline | Milestones Grid ] */}
          <div className="inline-flex items-center p-1 rounded-xl bg-muted/60 border">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              aria-label="Switch to Timeline view"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Switch to Grid view"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Milestones Grid</span>
            </button>
          </div>

          <Button
            onClick={openAddModal}
            size="sm"
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 self-start sm:self-center"
          >
            <Plus className="h-4 w-4" />
            <span>Add Personal Goal</span>
          </Button>
        </div>
      </div>

      {/* Main View: Timeline or Milestones Grid */}
      {viewMode === 'timeline' ? (
        <JourneyTimeline
          milestones={unifiedMilestones}
          targetExamDate={examDateFormatted}
          onOpenAddModal={openAddModal}
        />
      ) : (
        <MilestoneList
          milestones={unifiedMilestones}
          onDeleteMilestone={deleteCustomMilestone}
          onOpenAddModal={openAddModal}
        />
      )}

      {/* Add Milestone Modal */}
      <AddMilestoneModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSubmit={addCustomMilestone}
      />
    </div>
  );
};
