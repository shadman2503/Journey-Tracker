import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { MockTrendPoint } from '@/domain/performanceAnalytics';
import { Award, FileText } from 'lucide-react';

export interface MockScoreTrendChartProps {
  data: MockTrendPoint[];
  targetBenchmark?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: MockTrendPoint }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  const penalty = Math.round(item.wrongAnswers * 0.25 * 100) / 100;

  return (
    <div className="rounded-xl border bg-card p-3 shadow-lg text-xs space-y-1.5 min-w-[180px]">
      <div className="font-bold text-foreground border-b pb-1">
        {item.testName}
      </div>
      <div className="text-muted-foreground flex justify-between">
        <span>Date:</span>
        <span className="font-medium text-foreground">{item.date}</span>
      </div>
      <div className="text-muted-foreground flex justify-between">
        <span>Scope:</span>
        <span className="font-medium text-foreground">{item.subjectName}</span>
      </div>
      <div className="text-muted-foreground flex justify-between pt-1 border-t">
        <span>Net Score:</span>
        <span className="font-black text-sm text-primary">{item.score.toFixed(2)}</span>
      </div>
      <div className="text-muted-foreground flex justify-between">
        <span>Accuracy:</span>
        <span className="font-bold text-foreground">{item.accuracy}%</span>
      </div>
      <div className="text-[11px] text-muted-foreground pt-1 flex justify-between">
        <span className="text-emerald-600 dark:text-emerald-400">+{item.correctAnswers}</span>
        <span className="text-rose-600 dark:text-rose-400">-{penalty.toFixed(2)} penalty</span>
      </div>
    </div>
  );
};

export const MockScoreTrendChart: React.FC<MockScoreTrendChartProps> = ({
  data,
  targetBenchmark = 70,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] rounded-xl border border-dashed bg-muted/20 text-center p-6 space-y-2">
        <FileText className="h-8 w-8 text-muted-foreground" />
        <h4 className="text-sm font-semibold text-foreground">No Mock Score Data</h4>
        <p className="text-xs text-muted-foreground max-w-xs">
          Record mock tests to unlock your historical score progression curve and target trajectory.
        </p>
      </div>
    );
  }

  // Calculate suitable Y-axis bounds
  const scores = data.map((d) => d.score);
  const minScore = Math.max(0, Math.floor(Math.min(...scores, targetBenchmark) / 10) * 10 - 10);
  const maxScore = Math.min(100, Math.ceil(Math.max(...scores, targetBenchmark) / 10) * 10 + 10);

  return (
    <div className="w-full space-y-2" data-testid="mock-score-trend-chart">
      <div className="flex items-center justify-between text-xs px-1">
        <span className="text-muted-foreground font-medium">Score Progression</span>
        <span className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
          <Award className="h-3.5 w-3.5" />
          Target Benchmark: {targetBenchmark}
        </span>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
            <XAxis
              dataKey="formattedDate"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              domain={[minScore, maxScore]}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={targetBenchmark}
              stroke="hsl(38 92% 50%)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="score"
              name="Net Score"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#scoreGradient)"
              activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

