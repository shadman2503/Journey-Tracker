import React from 'react';
import { Compass, Flame, BookCheck, Clock } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">DUET 2027 Journey Dashboard</h1>
        <p className="text-muted-foreground">
          Turn a huge syllabus into a visible journey. Every completed topic brings you closer.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Overall Completion</span>
            <Compass className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold">0%</div>
          <p className="text-xs text-muted-foreground mt-1">Across all 5 subjects</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Current Streak</span>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold">0 days</div>
          <p className="text-xs text-muted-foreground mt-1">Consistency is key</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Questions Solved</span>
            <BookCheck className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground mt-1">Practice problem count</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Study Time</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">0 hrs</div>
          <p className="text-xs text-muted-foreground mt-1">Total recorded sessions</p>
        </div>
      </div>
    </div>
  );
};

