import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  strokeColor?: string;
  trackColor?: string;
  showLabel?: boolean;
  labelClassName?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 64,
  strokeWidth = 6,
  strokeColor = 'text-primary',
  trackColor = 'text-muted/20 dark:text-muted/30',
  showLabel = true,
  labelClassName,
  className,
}) => {
  const clampedPercentage = Math.min(100, Math.max(0, Math.round(percentage)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className={cn(trackColor)}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className={cn(strokeColor, 'transition-all duration-500 ease-out')}
        />
      </svg>
      {showLabel && (
        <span
          className={cn(
            'absolute font-bold text-xs tracking-tight text-foreground select-none',
            labelClassName
          )}
        >
          {clampedPercentage}%
        </span>
      )}
    </div>
  );
};

