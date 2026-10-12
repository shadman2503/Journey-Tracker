import React from 'react';
import { Flame, Trophy, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { StudyStreakSummary } from '@/domain/streak';
import { cn } from '@/lib/utils';

export interface StudyStreakCardProps {
  summary: StudyStreakSummary;
  className?: string;
  showRecentDays?: boolean;
}

export const StudyStreakCard: React.FC<StudyStreakCardProps> = ({
  summary,
  className,
  showRecentDays = true,
}) => {
  const { currentStreak, bestStreak, status, message, recentDays, totalActiveDays } = summary;

  // Status configuration
  const statusConfig = {
    active: {
      badgeText: 'Streak Active',
      badgeClass:
        'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      flameClass: 'text-orange-500 fill-orange-500/20',
      icon: CheckCircle2,
    },
    at_risk: {
      badgeText: 'Study Today!',
      badgeClass:
        'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800 animate-pulse',
      flameClass: 'text-amber-500 fill-amber-500/20',
      icon: AlertCircle,
    },
    inactive: {
      badgeText: 'Start Streak',
      badgeClass:
        'bg-muted text-muted-foreground border-border',
      flameClass: 'text-muted-foreground',
      icon: null,
    },
  }[status];

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-4 sm:p-5 shadow-sm flex flex-col justify-between transition-all',
        status === 'at_risk' && 'border-amber-500/30',
        status === 'active' && 'border-orange-500/20',
        className,
      )}
      data-testid="study-streak-card"
    >
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Current Streak
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded-full border inline-flex items-center gap-1',
                statusConfig.badgeClass,
              )}
            >
              {statusConfig.icon && (
                <statusConfig.icon className="h-2.5 w-2.5" />
              )}
              <span>{statusConfig.badgeText}</span>
            </span>
            <Flame className={cn('h-4 w-4', statusConfig.flameClass)} />
          </div>
        </div>

        {/* Hero Number & Best Streak Badge */}
        <div className="flex items-baseline justify-between gap-2 mt-1">
          <div className="text-2xl font-bold tracking-tight">
            {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
          </div>

          {bestStreak > 0 && (
            <div
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/50"
              title={`Historical best streak: ${bestStreak} days`}
            >
              <Trophy className="h-3 w-3 text-amber-500" />
              <span>Best: {bestStreak}d</span>
            </div>
          )}
        </div>

        {/* Dynamic Context Message */}
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
          {message}
        </p>
      </div>

      {/* 7-Day Consistency Glance */}
      {showRecentDays && recentDays && recentDays.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-border/50">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
            <span className="font-medium">7-Day Consistency</span>
            <span className="text-[10px]">{totalActiveDays} active {totalActiveDays === 1 ? 'day' : 'days'}</span>
          </div>

          <div className="grid grid-cols-7 gap-1" data-testid="recent-days-glance">
            {recentDays.map((day) => (
              <div
                key={day.date}
                className={cn(
                  'flex flex-col items-center justify-center py-1 rounded text-[10px] border transition-colors',
                  day.hasStudied
                    ? 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400 font-semibold'
                    : 'bg-muted/30 border-border/40 text-muted-foreground',
                  day.isToday && 'ring-1 ring-primary/50 border-primary/40',
                )}
                title={`${day.date}: ${day.hasStudied ? 'Studied' : 'No study logged'}${day.isToday ? ' (Today)' : ''}`}
                aria-label={`${day.dayLabel} ${day.date}: ${day.hasStudied ? 'Studied' : 'No study'}`}
              >
                <span className="text-[9px] uppercase tracking-wider font-mono">
                  {day.dayLabel.slice(0, 1)}
                </span>
                <div className="mt-0.5 flex items-center justify-center">
                  {day.hasStudied ? (
                    <Flame className="h-2.5 w-2.5 fill-orange-500 text-orange-500" />
                  ) : (
                    <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

