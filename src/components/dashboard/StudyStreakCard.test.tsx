import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StudyStreakCard } from './StudyStreakCard';
import type { StudyStreakSummary } from '@/domain/streak';

describe('StudyStreakCard', () => {
  const baseSummary: StudyStreakSummary = {
    currentStreak: 0,
    bestStreak: 0,
    status: 'inactive',
    lastStudiedDate: null,
    totalActiveDays: 0,
    recentDays: [
      { date: '2026-10-04', dayLabel: 'Sun', isToday: false, hasStudied: false },
      { date: '2026-10-05', dayLabel: 'Mon', isToday: false, hasStudied: false },
      { date: '2026-10-06', dayLabel: 'Tue', isToday: false, hasStudied: false },
      { date: '2026-10-07', dayLabel: 'Wed', isToday: false, hasStudied: false },
      { date: '2026-10-08', dayLabel: 'Thu', isToday: false, hasStudied: false },
      { date: '2026-10-09', dayLabel: 'Fri', isToday: false, hasStudied: false },
      { date: '2026-10-10', dayLabel: 'Sat', isToday: true, hasStudied: false },
    ],
    message: 'Start your study streak today. Consistency is key!',
  };

  it('renders inactive streak state correctly', () => {
    render(<StudyStreakCard summary={baseSummary} />);

    expect(screen.getByText('Current Streak')).toBeInTheDocument();
    expect(screen.getByText('0 days')).toBeInTheDocument();
    expect(screen.getByText('Start Streak')).toBeInTheDocument();
    expect(screen.getByText('Start your study streak today. Consistency is key!')).toBeInTheDocument();
    expect(screen.queryByText(/Best:/)).not.toBeInTheDocument();
  });

  it('renders active streak state with hero count and best badge', () => {
    const activeSummary: StudyStreakSummary = {
      ...baseSummary,
      currentStreak: 5,
      bestStreak: 7,
      status: 'active',
      totalActiveDays: 12,
      message: '5-day streak! Keep the flame burning 🔥',
    };

    render(<StudyStreakCard summary={activeSummary} />);

    expect(screen.getByText('5 days')).toBeInTheDocument();
    expect(screen.getByText('Streak Active')).toBeInTheDocument();
    expect(screen.getByText('Best: 7d')).toBeInTheDocument();
    expect(screen.getByText('5-day streak! Keep the flame burning 🔥')).toBeInTheDocument();
    expect(screen.getByText('12 active days')).toBeInTheDocument();
  });

  it('renders at-risk state with urgent badge', () => {
    const atRiskSummary: StudyStreakSummary = {
      ...baseSummary,
      currentStreak: 3,
      bestStreak: 3,
      status: 'at_risk',
      message: '3-day streak at risk! Study today to keep the flame alive ⏳',
    };

    render(<StudyStreakCard summary={atRiskSummary} />);

    expect(screen.getByText('3 days')).toBeInTheDocument();
    expect(screen.getByText('Study Today!')).toBeInTheDocument();
    expect(screen.getByText('3-day streak at risk! Study today to keep the flame alive ⏳')).toBeInTheDocument();
  });

  it('renders 7-day consistency glance with studied indicators', () => {
    const summaryWithActivity: StudyStreakSummary = {
      ...baseSummary,
      currentStreak: 1,
      bestStreak: 1,
      status: 'active',
      recentDays: [
        { date: '2026-10-04', dayLabel: 'Sun', isToday: false, hasStudied: false },
        { date: '2026-10-05', dayLabel: 'Mon', isToday: false, hasStudied: false },
        { date: '2026-10-06', dayLabel: 'Tue', isToday: false, hasStudied: true },
        { date: '2026-10-07', dayLabel: 'Wed', isToday: false, hasStudied: false },
        { date: '2026-10-08', dayLabel: 'Thu', isToday: false, hasStudied: true },
        { date: '2026-10-09', dayLabel: 'Fri', isToday: false, hasStudied: false },
        { date: '2026-10-10', dayLabel: 'Sat', isToday: true, hasStudied: true },
      ],
    };

    render(<StudyStreakCard summary={summaryWithActivity} />);

    expect(screen.getByTestId('recent-days-glance')).toBeInTheDocument();
    expect(screen.getByLabelText('Sat 2026-10-10: Studied')).toBeInTheDocument();
    expect(screen.getByLabelText('Fri 2026-10-09: No study')).toBeInTheDocument();
  });

  it('hides recent days glance when showRecentDays is false', () => {
    render(<StudyStreakCard summary={baseSummary} showRecentDays={false} />);

    expect(screen.queryByTestId('recent-days-glance')).not.toBeInTheDocument();
  });
});

