import { db } from '@/storage/dexie/db';
import type {
  ITopicProgressRepository,
  IStudySessionRepository,
  IMistakeRepository,
  IMockTestRepository,
  IMilestoneRepository,
} from '@/repositories/interfaces';
import type {
  TopicProgress,
  StudySession,
  Mistake,
  MockTest,
  Milestone,
  SubjectId,
} from '@/domain/types';

export class DexieTopicProgressRepository implements ITopicProgressRepository {
  async get(topicId: string): Promise<TopicProgress | undefined> {
    return db.topicProgress.get(topicId);
  }

  async getAll(): Promise<TopicProgress[]> {
    return db.topicProgress.toArray();
  }

  async save(progress: TopicProgress): Promise<void> {
    await db.topicProgress.put(progress);
  }

  async saveBatch(progressList: TopicProgress[]): Promise<void> {
    await db.topicProgress.bulkPut(progressList);
  }
}

export class DexieStudySessionRepository implements IStudySessionRepository {
  async getAll(): Promise<StudySession[]> {
    return db.studySessions.toArray();
  }

  async getByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<StudySession[]> {
    return db.studySessions
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  }

  async getBySubject(subjectId: SubjectId): Promise<StudySession[]> {
    return db.studySessions.where('subjectId').equals(subjectId).toArray();
  }

  async add(session: Omit<StudySession, 'id'>): Promise<number> {
    return (await db.studySessions.add(session as StudySession)) as number;
  }

  async delete(id: number): Promise<void> {
    await db.studySessions.delete(id);
  }
}

export class DexieMistakeRepository implements IMistakeRepository {
  async getAll(): Promise<Mistake[]> {
    return db.mistakes.toArray();
  }

  async getBySubject(subjectId: SubjectId): Promise<Mistake[]> {
    return db.mistakes.where('subjectId').equals(subjectId).toArray();
  }

  async add(mistake: Omit<Mistake, 'id'>): Promise<number> {
    return (await db.mistakes.add(mistake as Mistake)) as number;
  }

  async update(id: number, mistake: Partial<Mistake>): Promise<void> {
    await db.mistakes.update(id, mistake);
  }

  async delete(id: number): Promise<void> {
    await db.mistakes.delete(id);
  }
}

export class DexieMockTestRepository implements IMockTestRepository {
  async getAll(): Promise<MockTest[]> {
    return db.mockTests.toArray();
  }

  async add(test: Omit<MockTest, 'id'>): Promise<number> {
    return (await db.mockTests.add(test as MockTest)) as number;
  }

  async delete(id: number): Promise<void> {
    await db.mockTests.delete(id);
  }
}

export class DexieMilestoneRepository implements IMilestoneRepository {
  async getAll(): Promise<Milestone[]> {
    return db.milestones.toArray();
  }

  async add(milestone: Omit<Milestone, 'id'>): Promise<number> {
    return (await db.milestones.add(milestone as Milestone)) as number;
  }

  async delete(id: number): Promise<void> {
    await db.milestones.delete(id);
  }
}

export const topicProgressRepo = new DexieTopicProgressRepository();
export const studySessionRepo = new DexieStudySessionRepository();
export const mistakeRepo = new DexieMistakeRepository();
export const mockTestRepo = new DexieMockTestRepository();
export const milestoneRepo = new DexieMilestoneRepository();
