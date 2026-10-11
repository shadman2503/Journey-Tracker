import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { SubjectPerformanceBreakdown } from '@/domain/performanceAnalytics';
import { BarChart3, HelpCircle } from 'lucide-react';

export interface SubjectBreakdownChartProps {
  data: SubjectPerformanceBreakdown[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border bg-card p-3 shadow-lg text-xs space-y-1.5 min-w-[170px]">
      <div className="font-bold text-foreground border-b pb-1">{label}</div>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex justify-between items-center" style={{ color: entry.color }}>
          <span className="capitalize">{entry.name}:</span>
          <span className="font-bold">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
};

export const SubjectBreakdownChart: React.FC<SubjectBreakdownChartProps> = ({ data }) => {
  const hasAnyActivity = data && data.some(
    (d) => d.practiceQuestions > 0 || d.mockTestsCount > 0,
  );

  if (!hasAnyActivity) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] rounded-xl border border-dashed bg-muted/20 text-center p-6 space-y-2">
        <BarChart3 className="h-8 w-8 text-muted-foreground" />
        <h4 className="text-sm font-semibold text-foreground">No Subject Performance Data</h4>
        <p className="text-xs text-muted-foreground max-w-xs">
          Study sessions or subject-specific mock tests will display comparative accuracy metrics here.
        </p>
      </div>
    );
  }

  // Format data for Recharts BarChart
  const chartData = data.map((d) => ({
    name: d.subjectName.replace('Computer Science', 'CSE'),
    fullName: d.subjectName,
    practiceAccuracy: d.practiceAccuracy,
    mockAccuracy: d.mockAverageAccuracy,
    practiceQuestions: d.practiceQuestions,
    mockTestsCount: d.mockTestsCount,
  }));

  return (
    <div className="w-full space-y-4" data-testid="subject-breakdown-chart">
      <div className="flex items-center justify-between text-xs px-1">
        <span className="text-muted-foreground font-medium">Subject Accuracy Comparison</span>
        <span className="text-muted-foreground flex items-center gap-1">
          <HelpCircle className="h-3.5 w-3.5" />
          Practice vs Mock Tests
        </span>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
            />
            <Bar
              dataKey="practiceAccuracy"
              name="Practice Accuracy"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
            <Bar
              dataKey="mockAccuracy"
              name="Mock Accuracy"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Metric Cards Per Subject */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-2 border-t">
        {data.map((item) => (
          <div
            key={item.subjectId}
            className="rounded-lg border bg-card/60 p-2.5 text-xs space-y-1.5"
            data-testid={`subject-stat-${item.subjectId}`}
          >
            <div className="font-semibold text-foreground truncate">{item.subjectName}</div>
            <div className="text-[11px] text-muted-foreground space-y-0.5">
              <div className="flex justify-between">
                <span>Practice:</span>
                <span className="font-medium text-foreground">{item.practiceQuestions} Qs</span>
              </div>
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {item.practiceAccuracy}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mock Tests:</span>
                <span className="font-medium text-foreground">{item.mockTestsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Score:</span>
                <span className="font-medium text-primary">{item.mockAverageScore}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

