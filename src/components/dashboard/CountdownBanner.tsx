import React, { useState, useEffect, useMemo } from 'react';
import { useCountdownStore } from '@/stores/useCountdownStore';
import {
  calculateCountdown,
  formatDigit,
  URGENCY_MESSAGES,
  type UrgencyLevel,
} from '@/domain/countdown';
import { Progress } from '@/components/ui/progress';
import { EditTargetDateModal } from './EditTargetDateModal';
import { Calendar, Clock, Edit2, AlertCircle, CheckCircle2, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const URGENCY_BADGE_CONFIG: Record<
  UrgencyLevel,
  { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  relaxed: {
    label: 'Early Preparation',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: Clock,
  },
  moderate: {
    label: 'Core Prep Phase',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: Flame,
  },
  high: {
    label: 'Intensive Phase',
    badgeClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    icon: AlertCircle,
  },
  critical: {
    label: 'Final Sprint',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse',
    icon: AlertCircle,
  },
  completed: {
    label: 'Exam Day Reached',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
  },
};

export const CountdownBanner: React.FC = () => {
  const { targetDate, examTitle, setTargetDate, setExamTitle, resetToDefault } =
    useCountdownStore();

  const [now, setNow] = useState(() => new Date());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Update ticker every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const countdown = useMemo(() => {
    return calculateCountdown(targetDate, now);
  }, [targetDate, now]);

  const formattedTargetDate = useMemo(() => {
    try {
      const d = new Date(targetDate);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return targetDate;
    }
  }, [targetDate]);

  const urgencyConfig = URGENCY_BADGE_CONFIG[countdown.urgencyLevel];
  const UrgencyIcon = urgencyConfig.icon;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-primary/5 p-4 sm:p-5 shadow-sm space-y-3.5">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border',
                  urgencyConfig.badgeClass
                )}
              >
                <UrgencyIcon className="h-3 w-3" />
                <span>{urgencyConfig.label}</span>
              </span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Target: {formattedTargetDate}</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {examTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            aria-label="Edit target exam date"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-background/80 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors self-start sm:self-center shadow-xs h-8"
          >
            <Edit2 className="h-3 w-3" />
            <span>Change Target Date</span>
          </button>
        </div>

        {/* Compact Digit Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          {/* Days */}
          <div className="flex flex-col items-center justify-center py-2 px-3 rounded-lg border border-border/60 bg-card/60 shadow-xs">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-mono">
              {countdown.days}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase mt-0.5">
              Days
            </span>
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center justify-center py-2 px-3 rounded-lg border border-border/60 bg-card/60 shadow-xs">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-mono">
              {formatDigit(countdown.hours)}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase mt-0.5">
              Hours
            </span>
          </div>

          {/* Minutes */}
          <div className="flex flex-col items-center justify-center py-2 px-3 rounded-lg border border-border/60 bg-card/60 shadow-xs">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-mono">
              {formatDigit(countdown.minutes)}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase mt-0.5">
              Minutes
            </span>
          </div>

          {/* Seconds */}
          <div className="flex flex-col items-center justify-center py-2 px-3 rounded-lg border border-border/60 bg-card/60 shadow-xs">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-primary font-mono">
              {formatDigit(countdown.seconds)}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase mt-0.5">
              Seconds
            </span>
          </div>
        </div>

        {/* Preparation Timeline Progress & Motivation Message */}
        <div className="space-y-1.5 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Preparation Journey Timeline</span>
            <span className="font-semibold text-foreground">
              {countdown.timelineProgress}% Elapsed
            </span>
          </div>
          <Progress value={countdown.timelineProgress} className="h-1.5" />
          <p className="text-[11px] text-muted-foreground pt-0.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
            <span>{URGENCY_MESSAGES[countdown.urgencyLevel]}</span>
          </p>
        </div>
      </div>

      <EditTargetDateModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentTargetDate={targetDate}
        currentExamTitle={examTitle}
        onSave={(newDate, newTitle) => {
          setTargetDate(newDate);
          setExamTitle(newTitle);
        }}
        onReset={resetToDefault}
      />
    </>
  );
};

