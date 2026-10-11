import React from 'react';
import { Star, Calendar, Clock, Trophy } from 'lucide-react';
import type { TimelineItem } from '@/domain/timeline';

interface TimelineDestinationNodeProps {
  item: TimelineItem;
  daysRemaining?: number;
}

export const TimelineDestinationNode: React.FC<TimelineDestinationNodeProps> = ({
  item,
  daysRemaining,
}) => {
  return (
    <div className="relative flex items-start gap-4 sm:gap-6 group">
      {/* Spine Pin */}
      <div className="relative flex flex-col items-center self-stretch shrink-0">
        <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-amber-500 bg-amber-500/20 text-amber-500 shadow-md shadow-amber-500/20 animate-pulse">
          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
        </div>
      </div>

      {/* Target Destination Card */}
      <div className="flex-1 mb-6 p-5 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-card to-card text-card-foreground shadow-md">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Trophy className="h-3.5 w-3.5" />
              Ultimate Destination
            </span>

            {daysRemaining !== undefined && daysRemaining > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Clock className="h-3 w-3" />
                {daysRemaining} Days Remaining
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <Calendar className="h-3.5 w-3.5" />
            <span>Target: {item.date}</span>
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            {item.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Ambition motto */}
        <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between text-xs text-muted-foreground">
          <span className="italic">
            &quot;Every practice question and review brings you closer to the merit list.&quot;
          </span>
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            DUET 2027
          </span>
        </div>
      </div>
    </div>
  );
};

