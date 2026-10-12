import React from 'react';
import {
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import type { PatternInsight } from '@/domain/recurringMistakes';
import { Button } from '@/components/ui/button';

interface MistakePatternInsightsProps {
  insights: PatternInsight[];
  onSelectTopic?: (topicId: string) => void;
}

const INSIGHT_STYLE_CONFIG = {
  warning: {
    border: 'border-rose-500/25 dark:border-rose-500/20',
    bg: 'bg-rose-500/5 dark:bg-rose-950/10',
    iconColor: 'text-rose-500',
    Icon: AlertTriangle,
  },
  info: {
    border: 'border-amber-500/25 dark:border-amber-500/20',
    bg: 'bg-amber-500/5 dark:bg-amber-950/10',
    iconColor: 'text-amber-500',
    Icon: Info,
  },
  positive: {
    border: 'border-primary/30',
    bg: 'bg-primary/5',
    iconColor: 'text-primary',
    Icon: CheckCircle2,
  },
};

export const MistakePatternInsights: React.FC<MistakePatternInsightsProps> = ({
  insights,
  onSelectTopic,
}) => {
  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4.5 w-4.5 text-amber-500" />
        <h3 className="text-base font-bold text-foreground">
          Diagnostic Pattern Insights
        </h3>
        <span className="text-xs text-muted-foreground">
          ({insights.length} {insights.length === 1 ? 'insight' : 'insights'})
        </span>
      </div>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
        {insights.map((insight) => {
          const style = INSIGHT_STYLE_CONFIG[insight.severity] || INSIGHT_STYLE_CONFIG.info;
          const { Icon } = style;

          return (
            <div
              key={insight.id}
              className={`flex flex-col justify-between p-4 rounded-xl border ${style.border} ${style.bg} transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-card/80 shrink-0 ${style.iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>

              {insight.topicId && onSelectTopic && (
                <div className="mt-3 pt-2.5 border-t border-border/20 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectTopic(insight.topicId!)}
                    className="h-7 text-xs text-primary hover:text-primary gap-1 px-2"
                  >
                    <span>View Topic Mistakes</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

