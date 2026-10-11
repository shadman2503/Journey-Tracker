import React, { useEffect, useState, useMemo } from 'react';
import { Milestone as MilestoneIcon, Plus } from 'lucide-react';
import type { SyllabusTopic } from '@/domain/types';
import { syllabusRepository } from '@/repositories/syllabusRepository';
import { useTopicProgressStore } from '@/stores/useTopicProgressStore';
import { useStudySessionStore } from '@/stores/useStudySessionStore';
import { useMockTestStore } from '@/stores/useMockTestStore';
import { useMilestoneStore } from '@/stores/useMilestoneStore';
import { MilestoneList } from '@/components/milestones/MilestoneList';
import { AddMilestoneModal } from '@/components/milestones/AddMilestoneModal';
import { Button } from '@/components/ui/button';

export const JourneyPage: React.FC = () => {
  const [topics, setTopics] = useState<SyllabusTopic[]>([]);

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
              Celebrate key achievements, track unlocked benchmarks, and record personal targets
            </p>
          </div>
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

      {/* Main Milestones Deck */}
      <MilestoneList
        milestones={unifiedMilestones}
        onDeleteMilestone={deleteCustomMilestone}
        onOpenAddModal={openAddModal}
      />

      {/* Add Milestone Modal */}
      <AddMilestoneModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSubmit={addCustomMilestone}
      />
    </div>
  );
};

