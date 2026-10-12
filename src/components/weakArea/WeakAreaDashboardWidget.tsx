import React from 'react';
import { Target, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import type { WeakAreaTopic } from '@/domain/weakArea';
import type { SubjectId } from '@/domain/types';
import { WeakAreaCard } from './WeakAreaCard';
import { Button } from '@/components/ui/button';

export interface WeakAreaDashboardWidgetProps {
  weakAreas: WeakAreaTopic[];
  onViewRadar?: () => void;
  onViewAll?: () => void;
  onPracticeTopic?: (subjectId: SubjectId, topicId: string) => void;
  onViewMistakes?: (topicId: string) => void;
  maxItems?: number;
}

export const WeakAreaDashboardWidget: React.FC<WeakAreaDashboardWidgetProps> = ({
  weakAreas,
  onViewRadar,
  onViewAll,
  onPracticeTopic,
  onViewMistakes,
  maxItems = 3,
}) => {
  const handleOpenRadar = onViewRadar || onViewAll;
  const criticalCount = weakAreas.filter((w) => w.urgency === 'critical').length;
  const displayItems = weakAreas.slice(0, maxItems);
  const remainingCount = Math.max(0, weakAreas.length - maxItems);

  return (
    <div className="space-y-4">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Weak Area Radar
              </h2>
              {weakAreas.length > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  <AlertCircle className="h-3 w-3" />
                  <span>
                    {criticalCount > 0
                      ? `${criticalCount} Critical`
                      : `${weakAreas.length} Flagged`}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>All Clear</span>
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Multi-signal diagnostic flagging low accuracy, recurring errors, or overdue revisions
            </p>
          </div>
        </div>

        {handleOpenRadar && weakAreas.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenRadar}
            className="text-xs gap-1.5 self-start sm:self-center h-8 text-primary hover:text-primary"
          >
            <span>View Full Radar ({weakAreas.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Widget Content */}
      {weakAreas.length === 0 ? (
        <div className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-xs">
          <div className="p-3 rounded-full bg-primary/10 text-primary shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-foreground">
              No Weak Areas Detected
            </h3>
            <p className="text-xs text-muted-foreground">
              Great job! Your practiced topics show solid accuracy without recurring errors or overdue revisions.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {displayItems.map((item) => (
              <WeakAreaCard
                key={item.topicId}
                item={item}
                onPracticeTopic={onPracticeTopic}
                onViewMistakes={onViewMistakes}
              />
            ))}
          </div>

          {remainingCount > 0 && handleOpenRadar && (
            <div className="text-center pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenRadar}
                className="text-xs gap-1.5 h-8 shadow-xs"
              >
                <span>+{remainingCount} more topics need attention &bull; Open Radar</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

