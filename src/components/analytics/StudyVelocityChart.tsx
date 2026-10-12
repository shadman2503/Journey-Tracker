import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { StudyVelocityPoint } from '@/domain/longTermAnalytics';
import { Gauge, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StudyVelocityChartProps {
  data: StudyVelocityPoint[];
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: StudyVelocityPoint }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-xl border bg-card p-3 shadow-lg text-xs space-y-1.5 min-w-[200px]">
      <div className="font-bold text-foreground border-b pb-1 flex items-center justify-between">
        <span>{item.periodKey}</span>
        <span className="text-[10px] text-muted-foreground font-normal">{item.label}</span>
      </div>
      <div className="text-muted-foreground flex justify-between pt-0.5">
        <span>Questions Solved:</span>
        <span className="font-bold text-primary">{item.questionsSolved}</span>
      </div>
      <div className="text-muted-foreground flex justify-between">
        <span>Hours Invested:</span>
        <span className="font-bold text-foreground">{item.hoursSpent} hrs</span>
      </div>
      <div className="text-muted-foreground flex justify-between">
        <span>Weekly Accuracy:</span>
        <span className="font-bold text-primary">
          {item.accuracy}%
        </span>
      </div>
      <div className="text-[11px] text-muted-foreground pt-1 border-t flex justify-between">
        <span>Sessions Logged:</span>
        <span>{item.sessionsCount} sessions</span>
      </div>
    </div>
  );
};

export const StudyVelocityChart: React.FC<StudyVelocityChartProps> = ({
  data,
  className,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        data-testid="study-velocity-empty"
        className={cn(
          'flex flex-col items-center justify-center h-[280px] rounded-xl border border-dashed bg-muted/20 text-center p-6 space-y-2',
          className,
        )}
      >
        <Gauge className="h-8 w-8 text-muted-foreground" />
        <h4 className="text-sm font-semibold text-foreground">No Pacing Velocity Data</h4>
        <p className="text-xs text-muted-foreground max-w-xs">
          Weekly question solving velocity and study hours will appear as you record sessions.
        </p>
      </div>
    );
  }

  // Calculate average weekly questions
  const totalQuestions = data.reduce((acc, curr) => acc + curr.questionsSolved, 0);
  const avgWeeklyQuestions = Math.round(totalQuestions / data.length);

  return (
    <div data-testid="study-velocity-chart" className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Weekly Question Velocity
            </span>
            <div className="text-sm font-bold text-foreground">
              Average {avgWeeklyQuestions} questions / week across {data.length} active periods
            </div>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={240}>
          <BarChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />

            <XAxis
              dataKey="periodKey"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-muted-foreground"
            />

            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-muted-foreground"
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-muted-foreground"
              unit="h"
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
            />

            <Bar
              yAxisId="left"
              dataKey="questionsSolved"
              name="Questions Solved"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />

            <Bar
              yAxisId="right"
              dataKey="hoursSpent"
              name="Hours Spent"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

