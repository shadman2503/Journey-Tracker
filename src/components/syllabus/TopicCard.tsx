import React, { useState } from 'react';
import type { SyllabusTopic } from '@/domain/types';
import { useTopicProgressStore } from '@/stores/useTopicProgressStore';
import { StatusSelector } from './StatusSelector';
import { TopicNotesModal } from './TopicNotesModal';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicCardProps {
  topic: SyllabusTopic;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic }) => {
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const status = useTopicProgressStore((state) => state.getStatus(topic.id));
  const notes = useTopicProgressStore((state) => state.getNotes(topic.id));
  const setStatus = useTopicProgressStore((state) => state.setStatus);
  const setNotes = useTopicProgressStore((state) => state.setNotes);

  const hasNotes = Boolean(notes && notes.trim().length > 0);

  return (
    <>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-lg border bg-card/60 hover:bg-card hover:border-primary/40 transition-colors'>
        <div className='flex items-start gap-3 min-w-0 flex-1'>
          <span className='flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-[11px] font-semibold text-muted-foreground mt-0.5'>
            {topic.order}
          </span>
          <div className='space-y-1 min-w-0'>
            <h4 className='text-sm font-medium text-foreground leading-snug'>
              {topic.name}
            </h4>
            <div className='flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground'>
              <span className='px-1.5 py-0.5 rounded bg-muted/80 text-[11px]'>
                {topic.section}
              </span>
              <span>&bull;</span>
              <span className='text-[11px]'>{topic.chapter}</span>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2 self-end sm:self-center flex-shrink-0'>
          <button
            type='button'
            onClick={() => setIsNotesOpen(true)}
            aria-label={
              hasNotes ? 'Edit topic notes (has notes)' : 'Add topic notes'
            }
            className={cn(
              'p-1.5 rounded-md transition-colors relative',
              hasNotes
                ? 'text-primary bg-primary/10 hover:bg-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
            title={hasNotes ? 'View/edit notes' : 'Add notes'}
          >
            <FileText className='h-4 w-4' />
            {hasNotes && (
              <span className='absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary' />
            )}
          </button>

          <StatusSelector
            status={status}
            onSelectStatus={(nextStatus) => setStatus(topic.id, nextStatus)}
          />
        </div>
      </div>

      <TopicNotesModal
        topic={topic}
        initialNotes={notes}
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        onSave={(newNotes) => setNotes(topic.id, newNotes)}
      />
    </>
  );
};
