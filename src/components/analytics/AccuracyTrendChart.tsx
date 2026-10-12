import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type {
  MockTrendPoint,
  PracticeTrendPoint,
} from '@/domain/performanceAnalytics';
import { Target } from 'lucide-react';

export interface AccuracyTrendChartProps {
  practiceData?: PracticeTrendPoint[];
  mockData?: MockTrendPoint[];
  benchmarkAccuracy?: number;
}

interface MergedAccuracyPoint {
  date: string;
  formattedDate: string;
  practiceAccuracy: number | null;
  mockAccuracy: number | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | null;
    color: string;
    payload: MergedAccuracyPoint;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;

  return (
    <div className='rounded-xl border bg-card p-3 shadow-lg text-xs space-y-1.5 min-w-[170px]'>
      <div className='font-bold text-foreground border-b pb-1'>
        {item.formattedDate}
      </div>
      {item.practiceAccuracy !== null && (
        <div className='flex justify-between items-center text-blue-500 dark:text-blue-400'>
          <span>Practice:</span>
          <span className='font-bold'>{item.practiceAccuracy}%</span>
        </div>
      )}
      {item.mockAccuracy !== null && (
        <div className='flex justify-between items-center text-primary'>
          <span>Mock Test:</span>
          <span className='font-bold'>{item.mockAccuracy}%</span>
        </div>
      )}
      {item.practiceAccuracy === null && item.mockAccuracy === null && (
        <div className='text-muted-foreground'>No accuracy recorded</div>
      )}
    </div>
  );
};

export const AccuracyTrendChart: React.FC<AccuracyTrendChartProps> = ({
  practiceData = [],
  mockData = [],
  benchmarkAccuracy = 75,
}) => {
  const mergedData = useMemo<MergedAccuracyPoint[]>(() => {
    const datesMap = new Map<
      string,
      {
        formattedDate: string;
        practiceAccuracy: number | null;
        mockAccSum: number;
        mockAccCount: number;
      }
    >();

    // Process practice trend
    for (const p of practiceData) {
      datesMap.set(p.date, {
        formattedDate: p.formattedDate,
        practiceAccuracy: p.accuracy,
        mockAccSum: 0,
        mockAccCount: 0,
      });
    }

    // Process mock trend
    for (const m of mockData) {
      const existing = datesMap.get(m.date);
      if (existing) {
        existing.mockAccSum += m.accuracy;
        existing.mockAccCount += 1;
      } else {
        datesMap.set(m.date, {
          formattedDate: m.formattedDate,
          practiceAccuracy: null,
          mockAccSum: m.accuracy,
          mockAccCount: 1,
        });
      }
    }

    // Sort chronologically
    const sortedDates = Array.from(datesMap.keys()).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );

    return sortedDates.map((date) => {
      const item = datesMap.get(date)!;
      return {
        date,
        formattedDate: item.formattedDate,
        practiceAccuracy: item.practiceAccuracy,
        mockAccuracy:
          item.mockAccCount > 0
            ? Math.round((item.mockAccSum / item.mockAccCount) * 10) / 10
            : null,
      };
    });
  }, [practiceData, mockData]);

  if (mergedData.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-[280px] rounded-xl border border-dashed bg-muted/20 text-center p-6 space-y-2'>
        <Target className='h-8 w-8 text-muted-foreground' />
        <h4 className='text-sm font-semibold text-foreground'>
          No Accuracy Data
        </h4>
        <p className='text-xs text-muted-foreground max-w-xs'>
          Log practice questions or mock tests to monitor your accuracy trends
          over time.
        </p>
      </div>
    );
  }

  return (
    <div className='w-full space-y-2' data-testid='accuracy-trend-chart'>
      <div className='flex items-center justify-between text-xs px-1'>
        <span className='text-muted-foreground font-medium'>
          Accuracy Comparison
        </span>
        <span className='flex items-center gap-1.5 font-medium text-primary'>
          Target: {benchmarkAccuracy}%
        </span>
      </div>

      <div className='h-[280px] w-full'>
        <ResponsiveContainer
          width='100%'
          height='100%'
          minWidth={100}
          minHeight={200}
        >
          <LineChart
            data={mergedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray='3 3'
              vertical={false}
              stroke='hsl(var(--border))'
              opacity={0.6}
            />
            <XAxis
              dataKey='formattedDate'
              stroke='hsl(var(--muted-foreground))'
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              domain={[0, 100]}
              stroke='hsl(var(--muted-foreground))'
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign='top'
              align='right'
              iconType='circle'
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
            />
            <ReferenceLine
              y={benchmarkAccuracy}
              stroke='hsl(var(--primary))'
              strokeDasharray='4 4'
              strokeWidth={1.5}
            />
            <Line
              type='monotone'
              dataKey='practiceAccuracy'
              name='Practice Accuracy'
              stroke='#3b82f6'
              strokeWidth={2}
              connectNulls={true}
              dot={{ r: 3, fill: '#3b82f6' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type='monotone'
              dataKey='mockAccuracy'
              name='Mock Accuracy'
              stroke='hsl(var(--primary))'
              strokeWidth={2}
              connectNulls={true}
              dot={{ r: 3, fill: 'hsl(var(--primary))' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
