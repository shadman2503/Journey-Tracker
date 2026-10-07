import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Layers } from 'lucide-react';
import type { SectionGroup } from '@/repositories/interfaces';
import { TopicCard } from './TopicCard';
import { Button } from '@/components/ui/button';

interface ChapterAccordionProps {
  sections: SectionGroup[];
  isSearching?: boolean;
}

export const ChapterAccordion: React.FC<ChapterAccordionProps> = ({
  sections,
  isSearching = false,
}) => {
  // Store expanded state per chapter key (section:chapter)
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // When searching, expand all chapters containing matches
  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    for (const sec of sections) {
      for (const ch of sec.chapters) {
        // Expand everything if searching or expand the first few by default
        initialState[`${sec.section}:${ch.chapter}`] = isSearching || true;
      }
    }
    setExpandedChapters(initialState);
  }, [sections, isSearching]);

  const toggleChapter = (key: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    for (const sec of sections) {
      for (const ch of sec.chapters) {
        allExpanded[`${sec.section}:${ch.chapter}`] = true;
      }
    }
    setExpandedChapters(allExpanded);
  };

  const collapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    for (const sec of sections) {
      for (const ch of sec.chapters) {
        allCollapsed[`${sec.section}:${ch.chapter}`] = false;
      }
    }
    setExpandedChapters(allCollapsed);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Layers className="h-4 w-4" />
          <span>
            {sections.reduce((acc, s) => acc + s.chapters.length, 0)} Chapters &bull;{' '}
            {sections.reduce((acc, s) => acc + s.totalTopics, 0)} Topics
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={expandAll} className="h-7 text-xs">
            Expand All
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll} className="h-7 text-xs">
            Collapse All
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.section} className="space-y-3">
            <div className="flex items-center gap-2 border-b pb-2">
              <span className="font-semibold text-base tracking-tight text-foreground">
                {section.section}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                {section.totalTopics} {section.totalTopics === 1 ? 'topic' : 'topics'}
              </span>
            </div>

            <div className="space-y-2.5 pl-1 sm:pl-2">
              {section.chapters.map((chapter) => {
                const key = `${section.section}:${chapter.chapter}`;
                const isExpanded = expandedChapters[key] ?? true;

                return (
                  <div
                    key={key}
                    className="rounded-lg border bg-card/40 transition-colors overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleChapter(key)}
                      className="w-full flex items-center justify-between p-3.5 text-left hover:bg-accent/40 transition-colors"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-2.5">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">
                          {chapter.chapter}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {chapter.topics.length} {chapter.topics.length === 1 ? 'topic' : 'topics'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="p-3 pt-0 grid gap-2 sm:grid-cols-1 md:grid-cols-2">
                        {chapter.topics.map((topic) => (
                          <TopicCard key={topic.id} topic={topic} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

