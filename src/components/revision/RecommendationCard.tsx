import React from 'react';
import {
  Flame,
  RotateCcw,
  AlertCircle,
  Compass,
  Clock,
  BookOpen,
  ArrowRight,
  Target,
} from 'lucide-react';
import type {
  RevisionRecommendation,
  RecommendationType,
  RecommendationPriority,
} from '@/domain/revisionRecommendations';
import type { SubjectId } from '@/domain/types';
import { Button } from '@/components/ui/button';

interface RecommendationCardProps {
  item: RevisionRecommendation;
  onStartPractice?: (
    subjectId: SubjectId,
    topicId: string,
    suggestedDurationMinutes?: number
  ) => void;
  onViewMistakes?: (topicId: string) => void;
}

const TYPE_CONFIG: Record<
  RecommendationType,
  { label: string; badge: string; icon: typeof Flame }
> = {
  critical_drill: {
    label: 'Critical Drill',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    icon: Flame,
  },
  spaced_repetition: {
    label: 'Spaced Refresher',
    badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    icon: RotateCcw,
  },
  mistake_drill: {
    label: 'Mistake Drill',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: AlertCircle,
  },
  stagnant_topic: {
    label: 'Resume Topic',
    badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    icon: Compass,
  },
};

const PRIORITY_BADGES: Record<RecommendationPriority, string> = {
  urgent: 'bg-rose-500 text-white font-bold',
  high: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
  normal: 'bg-secondary text-secondary-foreground border border-border/50',
};

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  onStartPractice,
  onViewMistakes,
}) => {
  const typeConfig = TYPE_CONFIG[item.type] || TYPE_CONFIG.spaced_repetition;
  const TypeIcon = typeConfig.icon;
  const priorityBadgeClass = PRIORITY_BADGES[item.priority];

  return (
    <div className="group flex flex-col justify-between rounded-xl border bg-card p-4 sm:p-4.5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md space-y-3">
      <div className="space-y-3">
        {/* Top Badges & Duration */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border/50">
              {item.subjectId}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${typeConfig.badge}`}
            >
              <TypeIcon className="h-3 w-3" />
              <span>{typeConfig.label}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${priorityBadgeClass}`}
            >
              {item.priority}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md border border-border/40">
              <Clock className="h-3 w-3 text-primary" />
              <span>{item.suggestedDurationMinutes}m</span>
            </span>
          </div>
        </div>

        {/* Title & Hierarchy */}
        <div>
          <h4
            className="text-base font-bold text-foreground tracking-tight line-clamp-1"
            title={item.topicName}
          >
            {item.title}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {item.section} &bull; {item.chapter}
          </p>
        </div>

        {/* Rationale Note */}
        <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 text-xs text-foreground/90 font-medium">
          <span className="text-muted-foreground font-normal">Why: </span>
          {item.rationale}
        </div>

        {/* Diagnostic Metadata Grid */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-secondary/30 text-center text-xs">
          <div>
            <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Inactive</span>
            </div>
            <div className="text-sm font-bold text-foreground mt-0.5">
              {item.daysSinceLastStudied !== null
                ? `${item.daysSinceLastStudied}d`
                : '—'}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
              <Target className="h-3 w-3" />
              <span>Accuracy</span>
            </div>
            <div className="text-sm font-bold text-foreground mt-0.5">
              {item.accuracy !== null ? `${item.accuracy}%` : '—'}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
              <AlertCircle className="h-3 w-3 text-rose-500" />
              <span>Mistakes</span>
            </div>
            <div className="text-sm font-bold text-foreground mt-0.5">
              {item.unresolvedMistakes}
            </div>
          </div>
        </div>
      </div>

      {/* Action Triggers */}
      <div className="pt-2 border-t border-border/40 flex items-center gap-2">
        {onStartPractice && (
          <Button
            size="sm"
            onClick={() =>
              onStartPractice(
                item.subjectId,
                item.topicId,
                item.suggestedDurationMinutes
              )
            }
            className="flex-1 text-xs gap-1.5 shadow-xs h-8"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Start Practice ({item.suggestedDurationMinutes}m)</span>
          </Button>
        )}
        {onViewMistakes && item.unresolvedMistakes > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewMistakes(item.topicId)}
            className="text-xs gap-1 shadow-xs h-8 px-2.5"
            title="Inspect mistakes for this topic"
          >
            <span>Mistakes ({item.unresolvedMistakes})</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

