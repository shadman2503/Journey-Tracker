import { describe, it, expect } from 'vitest';
import {
  aggregateDailyActivity,
  calculateIntensity,
  generateHeatmapGrid,
  formatHeatmapHours,
} from './activityHeatmap';
import type { StudySession } from './types';

describe('aggregateDailyActivity', () => {
  it('returns empty object when no sessions exist', () => {
    expect(aggregateDailyActivity([])).toEqual({});
  });

  it('aggregates multiple sessions on the same date', () => {
    const sessions: StudySession[] = [
      {
        id: 1,
        date: '2026-10-10',
        subjectId: 'math',
        topicId: 't1',
        durationMinutes: 45,
        questionsSolved: 20,
        correctAnswers: 18,
        createdAt: '',
      },
      {
        id: 2,
        date: '2026-10-10T15:30:00Z',
        subjectId: 'physics',
        topicId: 't2',
        durationMinutes: 30,
        questionsSolved: 15,
        correctAnswers: 12,
        createdAt: '',
      },
      {
        id: 3,
        date: '2026-10-09',
        subjectId: 'chemistry',
        topicId: 't3',
        durationMinutes: 60,
        questionsSolved: 25,
        correctAnswers: 20,
        createdAt: '',
      },
    ];

    const result = aggregateDailyActivity(sessions);

    expect(result['2026-10-10']).toEqual({
      date: '2026-10-10',
      sessionCount: 2,
      totalMinutes: 75,
      totalQuestions: 35,
      totalCorrect: 30,
      subjects: ['math', 'physics'],
    });

    expect(result['2026-10-09']).toEqual({
      date: '2026-10-09',
      sessionCount: 1,
      totalMinutes: 60,
      totalQuestions: 25,
      totalCorrect: 20,
      subjects: ['chemistry'],
    });
  });
});

describe('calculateIntensity', () => {
  it('returns 0 for null or empty activity', () => {
    expect(calculateIntensity(null, 'duration')).toBe(0);
    expect(calculateIntensity(null, 'questions')).toBe(0);
  });

  it('calculates duration intensity across thresholds', () => {
    const makeAct = (mins: number) => ({
      date: '2026-10-10',
      sessionCount: 1,
      totalMinutes: mins,
      totalQuestions: 0,
      totalCorrect: 0,
      subjects: [],
    });

    expect(calculateIntensity(makeAct(0), 'duration')).toBe(0);
    expect(calculateIntensity(makeAct(15), 'duration')).toBe(1);
    expect(calculateIntensity(makeAct(30), 'duration')).toBe(1);
    expect(calculateIntensity(makeAct(45), 'duration')).toBe(2);
    expect(calculateIntensity(makeAct(60), 'duration')).toBe(2);
    expect(calculateIntensity(makeAct(90), 'duration')).toBe(3);
    expect(calculateIntensity(makeAct(120), 'duration')).toBe(3);
    expect(calculateIntensity(makeAct(150), 'duration')).toBe(4);
  });

  it('calculates questions intensity across thresholds', () => {
    const makeAct = (q: number) => ({
      date: '2026-10-10',
      sessionCount: 1,
      totalMinutes: 0,
      totalQuestions: q,
      totalCorrect: 0,
      subjects: [],
    });

    expect(calculateIntensity(makeAct(0), 'questions')).toBe(0);
    expect(calculateIntensity(makeAct(10), 'questions')).toBe(1);
    expect(calculateIntensity(makeAct(15), 'questions')).toBe(1);
    expect(calculateIntensity(makeAct(20), 'questions')).toBe(2);
    expect(calculateIntensity(makeAct(30), 'questions')).toBe(2);
    expect(calculateIntensity(makeAct(45), 'questions')).toBe(3);
    expect(calculateIntensity(makeAct(60), 'questions')).toBe(3);
    expect(calculateIntensity(makeAct(75), 'questions')).toBe(4);
  });
});

describe('formatHeatmapHours', () => {
  it('formats whole hours cleanly', () => {
    expect(formatHeatmapHours(120)).toBe('2 hrs');
  });

  it('formats decimal hours cleanly', () => {
    expect(formatHeatmapHours(90)).toBe('1.5 hrs');
  });

  it('formats zero hours', () => {
    expect(formatHeatmapHours(0)).toBe('0 hrs');
  });
});

describe('generateHeatmapGrid', () => {
  const refDate = '2026-10-10'; // Saturday

  it('generates grid with expected week count and cell properties', () => {
    const grid = generateHeatmapGrid([], {
      weeksCount: 12,
      referenceDate: refDate,
      weekStartsOn: 0,
    });

    expect(grid.weeks).toHaveLength(12);
    expect(grid.weeks[0]).toHaveLength(7);
    expect(grid.monthLabels.length).toBeGreaterThan(0);

    // Find the cell corresponding to refDate
    const todayCell = grid.weeks.flat().find((c) => c.date === refDate);
    expect(todayCell).toBeDefined();
    expect(todayCell?.isToday).toBe(true);
    expect(todayCell?.isFuture).toBe(false);

    // Summary for empty sessions
    expect(grid.summary.totalActiveDays).toBe(0);
    expect(grid.summary.totalMinutes).toBe(0);
    expect(grid.summary.totalQuestions).toBe(0);
  });

  it('computes correct intensity and summary statistics with sessions', () => {
    const sessions: StudySession[] = [
      {
        id: 1,
        date: '2026-10-08',
        subjectId: 'math',
        topicId: 't1',
        durationMinutes: 90,
        questionsSolved: 30,
        correctAnswers: 25,
        createdAt: '',
      },
      {
        id: 2,
        date: '2026-10-10',
        subjectId: 'physics',
        topicId: 't2',
        durationMinutes: 45,
        questionsSolved: 15,
        correctAnswers: 14,
        createdAt: '',
      },
    ];

    const grid = generateHeatmapGrid(sessions, {
      weeksCount: 4,
      referenceDate: refDate,
      metric: 'duration',
    });

    expect(grid.summary.totalActiveDays).toBe(2);
    expect(grid.summary.totalMinutes).toBe(135);
    expect(grid.summary.totalHoursFormatted).toBe('2.3 hrs');
    expect(grid.summary.totalQuestions).toBe(45);
    expect(grid.summary.averageMinutesPerActiveDay).toBe(68);
    expect(grid.summary.maxMinutesInDay).toBe(90);
    expect(grid.summary.maxQuestionsInDay).toBe(30);

    const oct8Cell = grid.weeks.flat().find((c) => c.date === '2026-10-08');
    expect(oct8Cell?.intensity).toBe(3); // 90 mins -> intensity 3
    expect(oct8Cell?.activity?.totalMinutes).toBe(90);

    const oct10Cell = grid.weeks.flat().find((c) => c.date === '2026-10-10');
    expect(oct10Cell?.intensity).toBe(2); // 45 mins -> intensity 2
  });

  it('marks future dates with intensity 0 and isFuture flag', () => {
    const grid = generateHeatmapGrid([], {
      weeksCount: 2,
      referenceDate: '2026-10-08', // Thursday
    });

    const cells = grid.weeks.flat();
    const oct9 = cells.find((c) => c.date === '2026-10-09');
    expect(oct9?.isFuture).toBe(true);
    expect(oct9?.intensity).toBe(0);
  });
});

