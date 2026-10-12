import React, { useMemo } from 'react';
import {
  AlertTriangle,
  ChevronRight,
  Plus,
  BookOpenCheck,
  RotateCw,
  Flame,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import type { Mistake, SyllabusTopic } from '@/domain/types';
import { calculateMistakeMetrics, MISTAKE_TYPE_CONFIG } from '@/domain/mistake';
import { detectTopicHotspots } from '@/domain/recurringMistakes';
import { Button } from '@/components/ui/button';

interface MistakesDashboardWidgetProps {
  mistakes: Mistake[];
  topics?: SyllabusTopic[];
  onLogMistake?: () => void;
  onReviewMistakes?: () => void;
  onViewAll?: () => void;
}

export const MistakesDashboardWidget: React.FC<
  MistakesDashboardWidgetProps
> = ({
  mistakes,
  topics = [],
  onLogMistake,
  onReviewMistakes,
  onViewAll,
}) => {
  const metrics = useMemo(() => calculateMistakeMetrics(mistakes), [mistakes]);

  const topicMap = useMemo(() => {
    const map: Record<string, SyllabusTopic> = {};
    for (const t of topics) {
      map[t.id] = t;
    }
    return map;
  }, [topics]);

  const hotspots = useMemo(() => {
    return detectTopicHotspots(mistakes, topicMap, 1);
  }, [mistakes, topicMap]);

  const topHotspot = hotspots[0];

  return (
    <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
              Mistake Journal & Hotspots
              {metrics.unresolvedCount > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  {metrics.unresolvedCount} Active
                </span>
              ) : metrics.totalMistakes > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                  All Fixed
                </span>
              ) : null}
            </h3>
            <p className="text-xs text-muted-foreground">
              Error tracking, spaced recall & chronic blunder patterns
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onLogMistake && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLogMistake}
              className="h-8 px-2.5 text-xs gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Log Mistake</span>
            </Button>
          )}

          {onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="h-8 px-2 text-xs gap-1 text-primary hover:text-primary"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {metrics.totalMistakes === 0 ? (
        <div className="p-6 text-center rounded-lg border border-dashed bg-muted/20">
          <ShieldCheck className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <h4 className="text-sm font-semibold text-foreground mb-1">
            Zero Mistakes Logged
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-3">
            Capture calculation slips, formula slips, and conceptual errors during practice to systematically eliminate them.
          </p>
          {onLogMistake && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLogMistake}
              className="h-8 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Log First Mistake
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {/* Summary Metric Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-lg bg-background border">
              <span className="text-[11px] text-muted-foreground block font-medium">
                Unresolved
              </span>
              <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                {metrics.unresolvedCount}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-background border">
              <span className="text-[11px] text-muted-foreground block font-medium">
                In Review
              </span>
              <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                {metrics.reviewingCount}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-background border">
              <span className="text-[11px] text-muted-foreground block font-medium">
                Mastered & Fixed
              </span>
              <span className="text-base font-bold text-primary">
                {metrics.fixedCount}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-background border">
              <span className="text-[11px] text-muted-foreground block font-medium">
                Resolution Rate
              </span>
              <span className="text-base font-bold text-foreground">
                {metrics.resolutionRate}%
              </span>
            </div>
          </div>

          {/* Spaced Review Due Alert Banner */}
          {metrics.pendingReviewCount > 0 && (
            <div className="p-3 rounded-lg border bg-amber-500/10 border-amber-500/30 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                  <RotateCw className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    {metrics.pendingReviewCount}{' '}
                    {metrics.pendingReviewCount === 1 ? 'Mistake' : 'Mistakes'} Due
                    for Review
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Reinforce corrections through spaced repetition
                  </span>
                </div>
              </div>

              {onReviewMistakes && (
                <Button
                  size="sm"
                  onClick={onReviewMistakes}
                  className="h-7 px-2.5 text-xs bg-amber-600 text-white hover:bg-amber-700 shadow-xs"
                >
                  <RotateCw className="h-3 w-3 mr-1" />
                  Start Review
                </Button>
              )}
            </div>
          )}

          {/* Top Recurring Hotspot or All-Clean Banner */}
          {topHotspot ? (
            <div className="p-3 rounded-lg border bg-rose-500/5 border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start sm:items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-500 shrink-0">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-foreground">
                      {topHotspot.topicName}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      Top Hotspot ({topHotspot.totalMistakes} errors)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Dominant cause:{' '}
                    <span className="font-medium text-foreground">
                      {MISTAKE_TYPE_CONFIG[topHotspot.dominantType]?.label ||
                        topHotspot.dominantType}
                    </span>
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 self-end sm:self-center">
                {topHotspot.unresolvedCount} Unresolved
              </span>
            </div>
          ) : metrics.unresolvedCount === 0 && metrics.totalMistakes > 0 ? (
            <div className="p-2.5 rounded-lg border bg-primary/5 border-primary/20 flex items-center gap-2 text-xs text-primary">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>All recorded mistakes have been resolved and mastered!</span>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="h-3.5 w-3.5 text-primary" />
                <span>No recurring error clusters detected across topics.</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
