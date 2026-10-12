import React, { useState, useEffect } from 'react';
import type { Mistake, MistakeStatus } from '@/domain/types';
import {
  MISTAKE_TYPE_CONFIG,
  MISTAKE_STATUS_CONFIG,
  formatReviewDate,
} from '@/domain/mistake';
import { syllabusRepository } from '@/repositories/syllabusRepository';
import { useMistakeStore } from '@/stores/useMistakeStore';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BookOpen,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface MistakeCardProps {
  mistake: Mistake;
  onUpdateStatus?: (id: number, status: MistakeStatus) => void;
  onEdit?: (mistake: Mistake) => void;
  onDelete?: (id: number) => void;
}

const SUBJECT_NAMES = {
  math: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  english: 'English',
  cse: 'CSE',
};

export const MistakeCard: React.FC<MistakeCardProps> = ({
  mistake,
  onUpdateStatus,
  onEdit,
  onDelete,
}) => {
  const openEditModal = useMistakeStore((s) => s.openEditModal);
  const [topicName, setTopicName] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    syllabusRepository.getAllTopics().then((topics) => {
      if (!isMounted) return;
      const found = topics.find((t) => t.id === mistake.topicId);
      setTopicName(found ? found.name : mistake.topicId);
    });
    return () => {
      isMounted = false;
    };
  }, [mistake.topicId]);

  const typeConfig = MISTAKE_TYPE_CONFIG[mistake.type];
  const statusConfig = MISTAKE_STATUS_CONFIG[mistake.status];
  const reviewInfo = formatReviewDate(mistake.reviewDate);

  const handleStatusChange = (newStatus: MistakeStatus) => {
    if (mistake.id && onUpdateStatus) {
      onUpdateStatus(mistake.id, newStatus);
    }
  };

  const handleDelete = () => {
    if (mistake.id && onDelete) {
      onDelete(mistake.id);
    }
    setIsConfirmingDelete(false);
  };

  return (
    <div
      data-testid={`mistake-card-${mistake.id}`}
      className="rounded-2xl border bg-card p-5 shadow-xs space-y-4 transition-all duration-200 hover:shadow-sm"
    >
      {/* Top Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-foreground">
              {SUBJECT_NAMES[mistake.subjectId] || mistake.subjectId}
            </span>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1 truncate max-w-[200px] sm:max-w-[280px]">
              <BookOpen className="h-3 w-3 shrink-0" />
              <span className="truncate">{topicName || mistake.topicId}</span>
            </span>
          </div>
          <h4 className="text-sm font-bold text-foreground">
            {mistake.questionRef}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {/* Classification Badge */}
          <span
            className={cn(
              'px-2.5 py-0.5 rounded-full text-xs font-semibold border',
              typeConfig.badgeClass,
            )}
          >
            {typeConfig.label}
          </span>

          {/* Status Badge */}
          <span
            className={cn(
              'px-2.5 py-0.5 rounded-full text-xs font-semibold border',
              statusConfig.badgeClass,
            )}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Review Due Date indicator */}
      {mistake.reviewDate && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span
            className={cn(
              'font-medium',
              reviewInfo.isOverdue && 'text-rose-600 dark:text-rose-400 font-bold',
              reviewInfo.isToday && 'text-amber-600 dark:text-amber-400 font-bold',
            )}
          >
            {reviewInfo.label}
          </span>
        </div>
      )}

      {/* Reflection & Solution Comparison Box */}
      {isExpanded && (
        <div className="space-y-3 pt-1 border-t text-xs">
          {/* What went wrong */}
          <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-1">
            <span className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>What I Did Wrong:</span>
            </span>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {mistake.whatWentWrong}
            </p>
          </div>

          {/* Correct solution / concept */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 space-y-1">
            <span className="font-bold text-primary flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Correct Concept & Solution:</span>
            </span>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {mistake.correctSolution}
            </p>
          </div>
        </div>
      )}

      {/* Footer Row: Expand toggle, Status buttons, Delete action */}
      <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Toggle details */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              <span>Hide Details</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              <span>View Details</span>
            </>
          )}
        </button>

        {/* Status Actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          {mistake.status === 'unresolved' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('reviewing')}
                className="h-7 text-xs px-2.5"
              >
                Start Review
              </Button>
              <Button
                size="sm"
                onClick={() => handleStatusChange('fixed')}
                className="h-7 text-xs px-2.5 gap-1"
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>Mark Fixed</span>
              </Button>
            </>
          )}

          {mistake.status === 'reviewing' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('unresolved')}
                className="h-7 text-xs px-2.5 text-muted-foreground"
              >
                Unresolved
              </Button>
              <Button
                size="sm"
                onClick={() => handleStatusChange('fixed')}
                className="h-7 text-xs px-2.5 gap-1"
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>Mark Fixed</span>
              </Button>
            </>
          )}

          {mistake.status === 'fixed' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('unresolved')}
              className="h-7 text-xs px-2.5 gap-1 text-muted-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reopen</span>
            </Button>
          )}

          {/* Edit Action */}
          <button
            type="button"
            onClick={() => (onEdit ? onEdit(mistake) : openEditModal(mistake))}
            aria-label="Edit mistake"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-1"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          {/* Delete Action */}
          {isConfirmingDelete ? (
            <div className="flex items-center gap-1 pl-1">
              <span className="text-[11px] text-destructive font-semibold">Delete?</span>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                className="h-7 text-xs px-2"
              >
                Yes
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsConfirmingDelete(false)}
                className="h-7 text-xs px-2"
              >
                No
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              aria-label="Delete mistake"
              className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

