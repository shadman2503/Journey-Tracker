import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indicatorClassName?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => {
    const clampedValue = Math.min(max, Math.max(0, value ?? 0));
    const percentage = max > 0 ? (clampedValue / max) * 100 : 0;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          'relative h-2.5 w-full overflow-hidden rounded-full bg-secondary/60 dark:bg-secondary/40',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out',
            indicatorClassName
          )}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';

