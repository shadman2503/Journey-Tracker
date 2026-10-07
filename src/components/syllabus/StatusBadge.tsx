import React from 'react';
import type { TopicStatus } from '@/domain/types';
import { STATUS_CONFIG } from '@/domain/progress';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: TopicStatus;
  size?: 'xs' | 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
  showDot = true,
  className,
}) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_started;

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.2 gap-1',
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
  };

  const dotSizes = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-colors select-none',
        config.badgeClass,
        sizeClasses[size],
        className,
      )}
    >
      {showDot && (
        <span
          className={cn(
            'rounded-full flex-shrink-0',
            config.dotColorClass,
            dotSizes[size],
          )}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};
