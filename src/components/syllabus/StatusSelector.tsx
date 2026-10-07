import React, { useState, useRef, useEffect } from 'react';
import type { TopicStatus } from '@/domain/types';
import { STATUS_CONFIG, STATUS_ORDER } from '@/domain/progress';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

interface StatusSelectorProps {
  status: TopicStatus;
  onSelectStatus: (status: TopicStatus) => void;
  className?: string;
}

export const StatusSelector: React.FC<StatusSelectorProps> = ({
  status,
  onSelectStatus,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_started;

  // Determine whether to open upward or downward based on viewport space
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Dropdown menu height is ~230px
      if (spaceBelow < 240 && rect.top > 240) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div
      className={cn(
        'relative inline-block text-left',
        isOpen ? 'z-50' : 'z-auto',
        className,
      )}
      ref={containerRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          activeConfig.badgeClass
        )}
      >
        <span
          className={cn('h-2 w-2 rounded-full flex-shrink-0', activeConfig.dotColorClass)}
        />
        <span>{activeConfig.label}</span>
        <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select topic status"
          className={cn(
            'absolute right-0 w-48 rounded-xl border bg-popover text-popover-foreground shadow-xl z-50 p-1.5 focus:outline-none animate-in fade-in-0 zoom-in-95',
            openUpward ? 'bottom-full mb-1.5 origin-bottom-right' : 'top-full mt-1.5 origin-top-right'
          )}
        >
          {STATUS_ORDER.map((itemStatus) => {
            const itemConfig = STATUS_CONFIG[itemStatus];
            const isSelected = itemStatus === status;

            return (
              <button
                key={itemStatus}
                role="option"
                aria-selected={isSelected}
                type="button"
                onClick={() => {
                  onSelectStatus(itemStatus);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left',
                  isSelected
                    ? 'bg-accent text-accent-foreground font-semibold'
                    : 'hover:bg-muted text-foreground'
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn('h-2 w-2 rounded-full flex-shrink-0', itemConfig.dotColorClass)}
                  />
                  <span>{itemConfig.label}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

