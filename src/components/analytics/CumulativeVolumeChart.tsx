import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { CumulativeVolumePoint } from '@/domain/longTermAnalytics';
import { TrendingUp, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CumulativeVolumeChartProps {
  data: CumulativeVolumePoint[];
  className?: string;
}

type MetricView = 'both' | 'hours' | 'questions';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: CumulativeVolumePoint }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-xl border bg-card p-3 shadow-lg text-xs space-y-1.5 min-w-[200px]">
      <div className="font-bold text-foreground border-b pb-1 flex items-center justify-between">
        <span>{item.formattedDate}</span>
        <span className="text-[10px] text-muted-foreground font-normal">{item.date}</span>
      </div>
      <div className="text-muted-foreground flex justify-between pt-0.5">
        <span>Cumulative Prep:</span>
        <span className="font-bold text-primary">{item.cumulativeHours} hrs</span>
      </div>
      <div className="text-muted-foreground flex justify-between">
        <span>Cumulative Questions:</span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {item.cumulativeQuestions}
        </span>
      </div>
      <div className="text-[11px] text-muted-foreground pt-1 border-t flex justify-between">
        <span>Daily Activity:</span>
        <span>
          {item.dailyHours} hrs · {item.dailyQuestions} q
        </span>
      </div>
    </div>
  );
};

export const CumulativeVolumeChart: React.FC<CumulativeVolumeChartProps> = ({
  data,
  className,
}) => {
  const [metricView, setMetricView] = useState<MetricView>('both');

  if (!data || data.length === 0) {
    return (
      <div
        data-testid="cumulative-volume-empty"
        className={cn(
          'flex flex-col items-center justify-center h-[280px] rounded-xl border border-dashed bg-muted/20 text-center p-6 space-y-2',
          className,
        )}
      >
        <Layers className="h-8 w-8 text-muted-foreground" />
        <h4 className="text-sm font-semibold text-foreground">No Cumulative Prep Data</h4>
        <p className="text-xs text-muted-foreground max-w-xs">
          Log study sessions and mock tests to track cumulative preparation hours and question volume growth.
        </p>
      </div>
    );
  }

  const latestPoint = data[data.length - 1];

  return (
    <div data-testid="cumulative-volume-chart" className={cn('space-y-4', className)}>
      {/* Chart Top Controls & Latest Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Preparation Growth
            </span>
            <div className="text-sm font-bold text-foreground">
              {latestPoint.cumulativeHours} hrs · {latestPoint.cumulativeQuestions} questions solved
            </div>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border text-xs">
          <button
            type="button"
            onClick={() => setMetricView('both')}
            className={cn(
              'px-2.5 py-1 rounded-md font-medium transition-colors',
              metricView === 'both'
                ? 'bg-card text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Both
          </button>
          <button
            type="button"
            onClick={() => setMetricView('hours')}
            className={cn(
              'px-2.5 py-1 rounded-md font-medium transition-colors',
              metricView === 'hours'
                ? 'bg-card text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Hours
          </button>
          <button
            type="button"
            onClick={() => setMetricView('questions')}
            className={cn(
              'px-2.5 py-1 rounded-md font-medium transition-colors',
              metricView === 'questions'
                ? 'bg-card text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Questions
          </button>
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={240}>
          <AreaChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="questionsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />

            <XAxis
              dataKey="formattedDate"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-muted-foreground"
            />

            {(metricView === 'both' || metricView === 'hours') && (
              <YAxis
                yAxisId="hoursAxis"
                orientation="left"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground"
                unit="h"
              />
            )}

            {(metricView === 'both' || metricView === 'questions') && (
              <YAxis
                yAxisId="questionsAxis"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground"
              />
            )}

            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
            />

            {(metricView === 'both' || metricView === 'hours') && (
              <Area
                yAxisId="hoursAxis"
                type="monotone"
                dataKey="cumulativeHours"
                name="Cumulative Hours"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#hoursGrad)"
              />
            )}

            {(metricView === 'both' || metricView === 'questions') && (
              <Area
                yAxisId="questionsAxis"
                type="monotone"
                dataKey="cumulativeQuestions"
                name="Questions Solved"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#questionsGrad)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

