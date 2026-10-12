import React from 'react';
import { Flame, CheckCircle2, ArrowRight, AlertTriangle, Layers } from 'lucide-react';
import type { TopicMistakeHotspot, RecurrenceSeverity } from '@/domain/recurringMistakes';
import { MISTAKE_TYPE_CONFIG } from '@/domain/mistake';
import { Button } from '@/components/ui/button';

interface RecurringMistakesHotspotsProps {
  hotspots: TopicMistakeHotspot[];
  onSelectTopic?: (topicId: string) => void;
  minThreshold?: number;
}

const SEVERITY_CONFIG: Record<
  RecurrenceSeverity,
  { label: string; badgeClass: string; iconClass: string }
> = {
  high: {
    label: 'High Recurrence',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    iconClass: 'text-rose-500',
  },
  medium: {
    label: 'Medium Recurrence',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    iconClass: 'text-amber-500',
  },
  low: {
    label: 'Low Recurrence',
    badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    iconClass: 'text-slate-500',
  },
};

export const RecurringMistakesHotspots: React.FC<RecurringMistakesHotspotsProps> = ({
  hotspots,
  onSelectTopic,
  minThreshold = 2,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-rose-500" />
            <h3 className="text-lg font-bold text-foreground">
              Recurring Mistake Hotspots
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              {hotspots.length} {hotspots.length === 1 ? 'Topic' : 'Topics'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Syllabus topics with {minThreshold} or more recorded mistakes. Prioritize these areas to prevent repetitive score loss.
          </p>
        </div>
      </div>

      {/* Empty State */}
      {hotspots.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-2xl bg-card/50 border-dashed space-y-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h4 className="text-sm font-bold text-foreground">
              No Recurring Hotspots Detected
            </h4>
            <p className="text-xs text-muted-foreground">
              None of your topics have reached {minThreshold} repeated mistakes. Keep logging your errors during practice and mock tests to expose recurring patterns.
            </p>
          </div>
        </div>
      ) : (
        /* Hotspots Grid */
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {hotspots.map((hotspot) => {
            const sevConfig = SEVERITY_CONFIG[hotspot.severity];
            const dominantMeta = MISTAKE_TYPE_CONFIG[hotspot.dominantType];

            return (
              <div
                key={hotspot.topicId}
                className="group relative flex flex-col justify-between rounded-xl border bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border/50">
                      {hotspot.subjectId}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${sevConfig.badgeClass}`}
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {sevConfig.label}
                    </span>
                  </div>

                  {/* Topic Title */}
                  <div className="space-y-1">
                    <h4
                      className="text-base font-bold text-foreground tracking-tight line-clamp-2"
                      title={hotspot.topicName}
                    >
                      {hotspot.topicName}
                    </h4>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-secondary/30 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground">Total</div>
                      <div className="text-sm font-bold text-foreground">
                        {hotspot.totalMistakes}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Unresolved</div>
                      <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
                        {hotspot.unresolvedCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Mastered</div>
                      <div className="text-sm font-bold text-primary">
                        {hotspot.fixedCount}
                      </div>
                    </div>
                  </div>

                  {/* Dominant Mistake Type */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Primary Slip:</span>
                    <span
                      className={`font-semibold px-1.5 py-0.5 rounded-sm text-[11px] border ${dominantMeta.badgeClass}`}
                    >
                      {dominantMeta.label}
                    </span>
                  </div>
                </div>

                {/* Card Action Footer */}
                {onSelectTopic && (
                  <div className="mt-4 pt-3 border-t border-border/40">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectTopic(hotspot.topicId)}
                      className="w-full justify-between text-xs text-primary hover:text-primary hover:bg-primary/5 px-2 font-medium"
                    >
                      <span>Filter & Review Mistakes</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

