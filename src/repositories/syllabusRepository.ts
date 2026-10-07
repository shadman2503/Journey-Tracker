import { SUBJECTS_META, SYLLABUS_TOPICS } from '@/domain/syllabusData';
import type { SubjectId, SubjectMeta, SyllabusTopic } from '@/domain/types';
import type {
  ISyllabusRepository,
  SectionGroup,
  ChapterGroup,
} from '@/repositories/interfaces';

export class StaticSyllabusRepository implements ISyllabusRepository {
  private subjects: SubjectMeta[] = SUBJECTS_META;
  private topics: SyllabusTopic[] = SYLLABUS_TOPICS;

  async getSubjects(): Promise<SubjectMeta[]> {
    return [...this.subjects];
  }

  async getSubjectById(id: SubjectId): Promise<SubjectMeta | undefined> {
    return this.subjects.find((s) => s.id === id);
  }

  async getTopicsBySubject(subjectId: SubjectId): Promise<SyllabusTopic[]> {
    return this.topics
      .filter((t) => t.subjectId === subjectId)
      .sort((a, b) => a.order - b.order);
  }

  async getSectionsBySubject(subjectId: SubjectId): Promise<SectionGroup[]> {
    const subjectTopics = await this.getTopicsBySubject(subjectId);
    const sectionMap = new Map<string, Map<string, SyllabusTopic[]>>();

    for (const topic of subjectTopics) {
      if (!sectionMap.has(topic.section)) {
        sectionMap.set(topic.section, new Map());
      }
      const chapterMap = sectionMap.get(topic.section)!;
      if (!chapterMap.has(topic.chapter)) {
        chapterMap.set(topic.chapter, []);
      }
      chapterMap.get(topic.chapter)!.push(topic);
    }

    const sections: SectionGroup[] = [];
    for (const [sectionName, chapterMap] of sectionMap.entries()) {
      const chapters: ChapterGroup[] = [];
      let totalTopics = 0;

      for (const [chapterName, chapterTopics] of chapterMap.entries()) {
        totalTopics += chapterTopics.length;
        chapters.push({
          chapter: chapterName,
          section: sectionName,
          topics: chapterTopics,
        });
      }

      sections.push({
        section: sectionName,
        chapters,
        totalTopics,
      });
    }

    return sections;
  }

  async searchTopics(
    query: string,
    subjectId?: SubjectId,
  ): Promise<SyllabusTopic[]> {
    const trimmed = query.trim().toLowerCase();
    let candidates = this.topics;

    if (subjectId) {
      candidates = candidates.filter((t) => t.subjectId === subjectId);
    }

    if (!trimmed) {
      return candidates;
    }

    return candidates.filter((topic) => {
      return (
        topic.name.toLowerCase().includes(trimmed) ||
        topic.chapter.toLowerCase().includes(trimmed) ||
        topic.section.toLowerCase().includes(trimmed)
      );
    });
  }
}

export const syllabusRepository = new StaticSyllabusRepository();
