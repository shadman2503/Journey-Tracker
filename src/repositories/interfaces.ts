import type {
  TopicProgress,
  StudySession,
  Mistake,
  MockTest,
  Milestone,
  SubjectId,
} from '@/domain/types';

export interface ITopicProgressRepository {
  get(topicId: string): Promise<TopicProgress | undefined>;
  getAll(): Promise<TopicProgress[]>;
  save(progress: TopicProgress): Promise<void>;
  saveBatch(progressList: TopicProgress[]): Promise<void>;
}

export interface IStudySessionRepository {
  getAll(): Promise<StudySession[]>;
  getByDateRange(startDate: string, endDate: string): Promise<StudySession[]>;
  getBySubject(subjectId: SubjectId): Promise<StudySession[]>;
  add(session: Omit<StudySession, 'id'>): Promise<number>;
  delete(id: number): Promise<void>;
}

export interface IMistakeRepository {
  getAll(): Promise<Mistake[]>;
  getBySubject(subjectId: SubjectId): Promise<Mistake[]>;
  add(mistake: Omit<Mistake, 'id'>): Promise<number>;
  update(id: number, mistake: Partial<Mistake>): Promise<void>;
  delete(id: number): Promise<void>;
}

export interface IMockTestRepository {
  getAll(): Promise<MockTest[]>;
  add(test: Omit<MockTest, 'id'>): Promise<number>;
  delete(id: number): Promise<void>;
}

export interface IMilestoneRepository {
  getAll(): Promise<Milestone[]>;
  add(milestone: Omit<Milestone, 'id'>): Promise<number>;
  delete(id: number): Promise<void>;
}
