import { db } from '@/storage/dexie/db';
import {
  validateBackupPayload,
  generateBackupFilename,
  BACKUP_APP_NAME,
  CURRENT_BACKUP_VERSION,
  type BackupPayload,
  type ImportMode,
  type EntityCounts,
} from '@/domain/backup';
import type {
  StudySession,
  Mistake,
  MockTest,
  Milestone,
} from '@/domain/types';
import { useCountdownStore } from '@/stores/useCountdownStore';
import { useTopicProgressStore } from '@/stores/useTopicProgressStore';
import { useStudySessionStore } from '@/stores/useStudySessionStore';
import { useMistakeStore } from '@/stores/useMistakeStore';
import { useMockTestStore } from '@/stores/useMockTestStore';
import { useMilestoneStore } from '@/stores/useMilestoneStore';

export interface ImportResult {
  success: boolean;
  mode: ImportMode;
  restoredCounts: EntityCounts;
  error?: string;
}

/**
 * Retrieves counts for all local IndexedDB tables.
 */
export async function getCurrentEntityCounts(): Promise<EntityCounts> {
  const [topicProgress, studySessions, mistakes, mockTests, milestones] =
    await Promise.all([
      db.topicProgress.count(),
      db.studySessions.count(),
      db.mistakes.count(),
      db.mockTests.count(),
      db.milestones.count(),
    ]);

  return {
    topicProgress,
    studySessions,
    mistakes,
    mockTests,
    milestones,
  };
}

/**
 * Assembles and exports a full JSON backup payload containing all local records.
 */
export async function exportBackupData(): Promise<{
  payload: BackupPayload;
  jsonString: string;
  filename: string;
}> {
  const [
    topicProgressList,
    studySessionsList,
    mistakesList,
    mockTestsList,
    milestonesList,
  ] = await Promise.all([
    db.topicProgress.toArray(),
    db.studySessions.toArray(),
    db.mistakes.toArray(),
    db.mockTests.toArray(),
    db.milestones.toArray(),
  ]);

  const countdownState = useCountdownStore.getState();
  const exportedAt = new Date().toISOString();

  const payload: BackupPayload = {
    version: CURRENT_BACKUP_VERSION,
    appName: BACKUP_APP_NAME,
    exportedAt,
    data: {
      topicProgress: topicProgressList,
      studySessions: studySessionsList,
      mistakes: mistakesList,
      mockTests: mockTestsList,
      milestones: milestonesList,
      countdown: {
        targetDate: countdownState.targetDate,
        examTitle: countdownState.examTitle,
      },
    },
    summary: {
      totalTopicsTracked: topicProgressList.length,
      totalSessions: studySessionsList.length,
      totalMistakes: mistakesList.length,
      totalMockTests: mockTestsList.length,
      totalMilestones: milestonesList.length,
    },
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const filename = generateBackupFilename();

  return { payload, jsonString, filename };
}

/**
 * Initiates a browser file download of the full JSON backup.
 */
export async function triggerDownloadBackup(): Promise<string> {
  const { jsonString, filename } = await exportBackupData();

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return filename;
}

/**
 * Imports and restores backup data into IndexedDB with atomic transaction guarantee.
 */
export async function importBackupData(
  jsonString: string,
  mode: ImportMode = 'overwrite',
): Promise<ImportResult> {
  const validation = validateBackupPayload(jsonString);

  if (!validation.success) {
    return {
      success: false,
      mode,
      restoredCounts: {
        topicProgress: 0,
        studySessions: 0,
        mistakes: 0,
        mockTests: 0,
        milestones: 0,
      },
      error: validation.errors.join('; '),
    };
  }

  const { data } = validation.payload;

  try {
    // Atomic multi-table write transaction
    await db.transaction(
      'rw',
      [
        db.topicProgress,
        db.studySessions,
        db.mistakes,
        db.mockTests,
        db.milestones,
      ],
      async () => {
        if (mode === 'overwrite') {
          // Clear all existing data
          await Promise.all([
            db.topicProgress.clear(),
            db.studySessions.clear(),
            db.mistakes.clear(),
            db.mockTests.clear(),
            db.milestones.clear(),
          ]);

          // Restore exact records
          if (data.topicProgress?.length) {
            await db.topicProgress.bulkPut(data.topicProgress);
          }
          if (data.studySessions?.length) {
            await db.studySessions.bulkAdd(data.studySessions);
          }
          if (data.mistakes?.length) {
            await db.mistakes.bulkAdd(data.mistakes);
          }
          if (data.mockTests?.length) {
            await db.mockTests.bulkAdd(data.mockTests);
          }
          if (data.milestones?.length) {
            await db.milestones.bulkAdd(data.milestones);
          }
        } else {
          // Merge mode: Preserve existing records and add new ones without ID collisions
          if (data.topicProgress?.length) {
            // Topic progress is keyed by unique topicId string; bulkPut updates or adds
            await db.topicProgress.bulkPut(data.topicProgress);
          }

          // Strip incoming numeric IDs for auto-increment tables so Dexie allocates fresh IDs
          if (data.studySessions?.length) {
            const sessionsToMerge = data.studySessions.map((s) => {
              const { id, ...rest } = s;
              return rest as StudySession;
            });
            await db.studySessions.bulkAdd(sessionsToMerge);
          }

          if (data.mistakes?.length) {
            const mistakesToMerge = data.mistakes.map((m) => {
              const { id, ...rest } = m;
              return rest as Mistake;
            });
            await db.mistakes.bulkAdd(mistakesToMerge);
          }

          if (data.mockTests?.length) {
            const testsToMerge = data.mockTests.map((t) => {
              const { id, ...rest } = t;
              return rest as MockTest;
            });
            await db.mockTests.bulkAdd(testsToMerge);
          }

          if (data.milestones?.length) {
            const milestonesToMerge = data.milestones.map((ms) => {
              const { id, ...rest } = ms;
              return rest as Milestone;
            });
            await db.milestones.bulkAdd(milestonesToMerge);
          }
        }
      },
    );

    // Restore countdown settings if provided
    if (data.countdown && (mode === 'overwrite' || mode === 'merge')) {
      useCountdownStore.getState().setTargetDate(data.countdown.targetDate);
      useCountdownStore.getState().setExamTitle(data.countdown.examTitle);
    }

    // Refresh active stores from the newly updated database
    await reloadAllStores();

    return {
      success: true,
      mode,
      restoredCounts: {
        topicProgress: data.topicProgress?.length || 0,
        studySessions: data.studySessions?.length || 0,
        mistakes: data.mistakes?.length || 0,
        mockTests: data.mockTests?.length || 0,
        milestones: data.milestones?.length || 0,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Database transaction failed';
    return {
      success: false,
      mode,
      restoredCounts: {
        topicProgress: 0,
        studySessions: 0,
        mistakes: 0,
        mockTests: 0,
        milestones: 0,
      },
      error: errorMsg,
    };
  }
}

/**
 * Resets all IndexedDB preparation tables and countdown settings.
 */
export async function clearAllLocalData(): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.topicProgress,
      db.studySessions,
      db.mistakes,
      db.mockTests,
      db.milestones,
    ],
    async () => {
      await Promise.all([
        db.topicProgress.clear(),
        db.studySessions.clear(),
        db.mistakes.clear(),
        db.mockTests.clear(),
        db.milestones.clear(),
      ]);
    },
  );

  useCountdownStore.getState().resetToDefault();
  await reloadAllStores();
}

/**
 * Internal helper to force-refresh active client stores after database modifications.
 */
async function reloadAllStores(): Promise<void> {
  try {
    useTopicProgressStore.setState({ loaded: false, progressMap: {} });
    await useTopicProgressStore.getState().loadProgress();

    useStudySessionStore.setState({ loaded: false, sessions: [] });
    await useStudySessionStore.getState().loadSessions();

    useMistakeStore.setState({ loaded: false, mistakes: [] });
    await useMistakeStore.getState().loadMistakes();

    useMockTestStore.setState({ loaded: false, tests: [] });
    await useMockTestStore.getState().loadMockTests();

    useMilestoneStore.setState({ loaded: false, customMilestones: [] });
    await useMilestoneStore.getState().loadCustomMilestones();
  } catch (e) {
    console.error('Failed to reload all stores after import:', e);
  }
}
