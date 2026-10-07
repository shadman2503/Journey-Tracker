import React from 'react';
import type { SyllabusTopic } from '@/domain/types';

interface TopicCardProps {
  topic: SyllabusTopic;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic }) => {
  return (
    <div className='flex items-start justify-between gap-3 p-3.5 rounded-lg border bg-card/60 hover:bg-card hover:border-primary/40 transition-colors'>
      <div className='flex items-start gap-3'>
        <span className='flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-[11px] font-semibold text-muted-foreground'>
          {topic.order}
        </span>
        <div className='space-y-1'>
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
    </div>
  );
};
