import React, { useMemo } from 'react';
import {
  Trophy,
  Sparkles,
  ChevronRight,
  Plus,
  Calendar,
  Award,
} from 'lucide-react';
import type { Milestone } from '@/domain/types';
import { getMilestoneSummary } from '@/domain/milestones';
import { Button } from '@/components/ui/button';

interface MilestoneDashboardWidgetProps {
  milestones: Milestone[];
  onViewAll?: () => void;
  onAddGoal?: () => void;
}

export const MilestoneDashboardWidget: React.FC<MilestoneDashboardWidgetProps> = ({
  milestones,
  onViewAll,
  onAddGoal,
}) => {
  const summary = useMemo(() => getMilestoneSummary(milestones), [milestones]);

  const latestMilestone = summary.recentMilestones[0];
  const secondaryMilestones = summary.recentMilestones.slice(1, 3);

  return (
    <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
              Journey Milestones
              {summary.totalMilestones > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Sparkles className="h-3 w-3" />
                  {summary.totalMilestones} Unlocked
                </span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              Celebrated achievements and key preparation checkpoints
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onAddGoal && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddGoal}
              className="h-8 px-2.5 text-xs gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add Goal</span>
            </Button>
          )}

          {onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="h-8 px-2 text-xs gap-1 text-primary hover:text-primary"
            >
              <span>View Journey</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {summary.totalMilestones === 0 ? (
        <div className="p-6 text-center rounded-lg border border-dashed bg-muted/20">
          <Award className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <h4 className="text-sm font-semibold text-foreground mb-1">
            No Milestones Unlocked Yet
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-3">
            Start logging your study sessions and mock tests to automatically unlock preparation milestones, or add personal goals.
          </p>
          {onAddGoal && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddGoal}
              className="h-8 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add First Milestone
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Latest Milestone Spotlight */}
          {latestMilestone && (
            <div className="p-3.5 rounded-lg border bg-amber-500/5 border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 rounded-md bg-amber-500/10 text-amber-500 shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">
                      {latestMilestone.title}
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground">
                      Latest Achievement
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {latestMilestone.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 self-end sm:self-center">
                <Calendar className="h-3 w-3" />
                <span>{latestMilestone.date}</span>
              </div>
            </div>
          )}

          {/* Secondary mini milestones */}
          {secondaryMilestones.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {secondaryMilestones.map((milestone) => (
                <div
                  key={`${milestone.id}-${milestone.title}`}
                  className="p-2.5 rounded-lg border bg-muted/20 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {milestone.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {milestone.category}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {milestone.date}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

