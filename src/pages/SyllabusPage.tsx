import React, { useState, useEffect, useMemo } from 'react';
import { syllabusRepository } from '@/repositories/syllabusRepository';
import type { SubjectId, SubjectMeta, SyllabusTopic } from '@/domain/types';
import type { SectionGroup } from '@/repositories/interfaces';
import { SubjectTabs } from '@/components/syllabus/SubjectTabs';
import { SyllabusSearchBar } from '@/components/syllabus/SyllabusSearchBar';
import { ChapterAccordion } from '@/components/syllabus/ChapterAccordion';
import { TopicCard } from '@/components/syllabus/TopicCard';
import { Button } from '@/components/ui/button';
import { BookOpen, SearchX } from 'lucide-react';

export const SyllabusPage: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectMeta[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>('math');
  const [sections, setSections] = useState<SectionGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SyllabusTopic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load subject metadata on mount
  useEffect(() => {
    syllabusRepository.getSubjects().then((data) => {
      setSubjects(data);
    });
  }, []);

  // Load sections and topics when selected subject changes
  useEffect(() => {
    setLoading(true);
    syllabusRepository.getSectionsBySubject(selectedSubjectId).then((data) => {
      setSections(data);
      setLoading(false);
    });
  }, [selectedSubjectId]);

  // Handle search queries
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    syllabusRepository
      .searchTopics(searchQuery, selectedSubjectId)
      .then((results) => {
        setSearchResults(results);
      });
  }, [searchQuery, selectedSubjectId]);

  const currentSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId),
    [subjects, selectedSubjectId],
  );

  const totalSubjectTopics = useMemo(
    () => currentSubject?.totalTopics ?? 0,
    [currentSubject],
  );

  return (
    <div className='space-y-6 max-w-5xl mx-auto'>
      {/* Header */}
      <div className='flex flex-col gap-1.5'>
        <div className='flex items-center gap-2 text-primary font-medium text-sm'>
          <BookOpen className='h-4 w-4' />
          <span>DUET Admission Syllabus</span>
        </div>
        <h1 className='text-3xl font-extrabold tracking-tight'>
          Syllabus Explorer
        </h1>
        <p className='text-muted-foreground text-sm max-w-2xl'>
          Browse and search the verified DUET syllabus across all 5 subjects.
          Organized by sections, chapters, and topics.
        </p>
      </div>

      {/* Subject Tabs */}
      {subjects.length > 0 && (
        <SubjectTabs
          subjects={subjects}
          selectedSubjectId={selectedSubjectId}
          onSelectSubject={(id) => {
            setSelectedSubjectId(id);
            setSearchQuery('');
          }}
        />
      )}

      {/* Search Bar */}
      <div className='max-w-xl'>
        <SyllabusSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          resultCount={searchQuery ? searchResults.length : undefined}
          totalCount={totalSubjectTopics}
        />
      </div>

      {/* Subject Description Card */}
      {currentSubject && !searchQuery && (
        <div className='p-4 rounded-xl border bg-muted/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
          <div>
            <h2 className='font-semibold text-foreground text-base'>
              {currentSubject.name}{' '}
              {currentSubject.nameBn && (
                <span className='text-muted-foreground font-normal'>
                  ({currentSubject.nameBn})
                </span>
              )}
            </h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {currentSubject.description}
            </p>
          </div>
          <div className='flex items-center gap-3 text-xs font-medium text-muted-foreground'>
            <span className='px-2.5 py-1 rounded-md bg-background border'>
              {currentSubject.totalTopics} Topics
            </span>
            <span className='px-2.5 py-1 rounded-md bg-background border'>
              {sections.reduce((acc, s) => acc + s.chapters.length, 0)} Chapters
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className='py-16 text-center text-muted-foreground text-sm'>
          Loading syllabus...
        </div>
      ) : searchQuery.trim() ? (
        /* Search Results View */
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-semibold text-foreground'>
              Search Results ({searchResults.length})
            </h3>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setSearchQuery('')}
              className='text-xs h-7'
            >
              Clear search
            </Button>
          </div>

          {searchResults.length === 0 ? (
            <div className='py-12 px-4 text-center rounded-xl border border-dashed bg-card/40 space-y-3'>
              <SearchX className='h-8 w-8 text-muted-foreground mx-auto' />
              <div className='space-y-1'>
                <p className='font-medium text-sm text-foreground'>
                  No matching topics found
                </p>
                <p className='text-xs text-muted-foreground'>
                  No topics in {currentSubject?.name} match &ldquo;{searchQuery}
                  &rdquo;. Try another term or search all subjects.
                </p>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setSearchQuery('')}
                className='text-xs'
              >
                Reset Search
              </Button>
            </div>
          ) : (
            <div className='grid gap-2.5 sm:grid-cols-1 md:grid-cols-2'>
              {searchResults.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Default Hierarchy View */
        <ChapterAccordion sections={sections} />
      )}
    </div>
  );
};
