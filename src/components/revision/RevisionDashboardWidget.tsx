import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import type { RevisionRecommendation } from '@/domain/revisionRecommendations';
import type { SubjectId } from '@/domain/types';
import { RecommendationCard } from './RecommendationCard';
import { Button } from '@/components/ui/button';

export interface RevisionDashboardWidgetProps {
  recommendations: RevisionRecommendation[];
  onViewPlan?: () => void;
  onViewAll?: () => void;
  onStartPractice?: (
    subjectId: SubjectId,
    topicId: string,
    suggestedDurationMinutes?: number,
  ) => void;
  onViewMistakes?: (topicId: string) => void;
  maxItems?: number;
}

function formatEstimatedTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
}

export const RevisionDashboardWidget: React.FC<
  RevisionDashboardWidgetProps
> = ({
  recommendations,
  onViewPlan,
  onViewAll,
  onStartPractice,
  onViewMistakes,
  maxItems = 3,
}) => {
  const handleOpenPlan = onViewPlan || onViewAll;
  const displayItems = recommendations.slice(0, maxItems);
  const remainingCount = Math.max(0, recommendations.length - maxItems);
  const totalMinutes = recommendations.reduce(
    (acc, r) => acc + (r.suggestedDurationMinutes || 0),
    0,
  );

  return (
    <div className='space-y-4'>
      {/* Widget Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3'>
        <div className='flex items-center gap-2.5'>
          <div className='p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400'>
            <Sparkles className='h-5 w-5' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h2 className='text-lg font-bold tracking-tight text-foreground'>
                Revision Recommendations
              </h2>
              {recommendations.length > 0 ? (
                <div className='flex items-center gap-1.5 flex-wrap'>
                  <span className='inline-flex items-center gap-1 rounded-full bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-xs font-semibold text-sky-600 dark:text-sky-400'>
                    <span>{recommendations.length} Due</span>
                  </span>
                  <span className='inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground border border-border/50 px-2 py-0.5 text-[11px] font-semibold'>
                    <Clock className='h-3 w-3 text-muted-foreground' />
                    <span>~{formatEstimatedTime(totalMinutes)}</span>
                  </span>
                </div>
              ) : (
                <span className='inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-semibold text-primary'>
                  <CheckCircle2 className='h-3 w-3' />
                  <span>Up to Date</span>
                </span>
              )}
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Targeted revision sessions prioritized by forgetting curve decay
              and topic weakness
            </p>
          </div>
        </div>

        {handleOpenPlan && recommendations.length > 0 && (
          <Button
            variant='ghost'
            size='sm'
            onClick={handleOpenPlan}
            className='text-xs gap-1.5 self-start sm:self-center h-8 text-primary hover:text-primary'
          >
            <span>View Full Plan ({recommendations.length})</span>
            <ArrowRight className='h-3.5 w-3.5' />
          </Button>
        )}
      </div>

      {/* Widget Content */}
      {recommendations.length === 0 ? (
        <div className='flex items-center gap-4 rounded-xl border bg-card p-5 shadow-xs'>
          <div className='p-3 rounded-full bg-primary/10 text-primary shrink-0'>
            <CheckCircle2 className='h-6 w-6' />
          </div>
          <div className='space-y-0.5'>
            <h3 className='text-sm font-semibold text-foreground'>
              No Revisions Due Today
            </h3>
            <p className='text-xs text-muted-foreground'>
              All practiced topics have been refreshed recently with solid
              retention. Ready to explore new topics!
            </p>
          </div>
        </div>
      ) : (
        <div className='space-y-3'>
          <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
            {displayItems.map((item) => (
              <RecommendationCard
                key={item.id}
                item={item}
                onStartPractice={onStartPractice}
                onViewMistakes={onViewMistakes}
              />
            ))}
          </div>

          {remainingCount > 0 && handleOpenPlan && (
            <div className='text-center pt-1'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleOpenPlan}
                className='text-xs gap-1.5 h-8 shadow-xs'
              >
                <span>
                  +{remainingCount} more revision recommendations &bull; Open
                  Full Plan
                </span>
                <ArrowRight className='h-3 w-3' />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
