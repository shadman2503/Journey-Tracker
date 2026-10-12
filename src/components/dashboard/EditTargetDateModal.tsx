import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, RotateCcw, Save } from 'lucide-react';
import { DEFAULT_EXAM_DATE, DEFAULT_EXAM_TITLE } from '@/domain/countdown';
import { useDialogAccessibility } from '@/hooks/useDialogAccessibility';

interface EditTargetDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTargetDate: string;
  currentExamTitle: string;
  onSave: (targetDate: string, examTitle: string) => void;
  onReset: () => void;
}

export const EditTargetDateModal: React.FC<EditTargetDateModalProps> = ({
  isOpen,
  onClose,
  currentTargetDate,
  currentExamTitle,
  onSave,
  onReset,
}) => {
  // Format ISO date string to YYYY-MM-DD for standard date input
  const getInitialDateValue = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toISOString().split('T')[0];
    } catch {
      return '2027-06-20';
    }
  };

  const [dateValue, setDateValue] = useState(() => getInitialDateValue(currentTargetDate));
  const [titleValue, setTitleValue] = useState(currentExamTitle);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogAccessibility({
    isOpen,
    onClose,
    containerRef: dialogRef,
  });

  useEffect(() => {
    setDateValue(getInitialDateValue(currentTargetDate));
    setTitleValue(currentExamTitle);
    setError(null);
  }, [currentTargetDate, currentExamTitle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateValue) {
      setError('Please select a valid date.');
      return;
    }

    // Set time to 09:00:00 (typical morning exam time)
    const isoString = `${dateValue}T09:00:00+06:00`;
    onSave(isoString, titleValue.trim() || DEFAULT_EXAM_TITLE);
    onClose();
  };

  const handleReset = () => {
    onReset();
    setDateValue(getInitialDateValue(DEFAULT_EXAM_DATE));
    setTitleValue(DEFAULT_EXAM_TITLE);
    onClose();
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-target-date-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md rounded-xl border bg-card p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-4 w-4" />
            </span>
            <h3 id="edit-target-date-title" className="text-base font-semibold text-foreground">
              Configure Target Exam Date
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1.5">
            <label htmlFor="exam-title-input" className="text-xs font-medium text-foreground">
              Event / Exam Title
            </label>
            <input
              id="exam-title-input"
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              placeholder="e.g. DUET Admission Test 2027"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="target-date-input" className="text-xs font-medium text-foreground">
              Target Admission Date
            </label>
            <input
              id="target-date-input"
              type="date"
              value={dateValue}
              onChange={(e) => {
                setDateValue(e.target.value);
                setError(null);
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="pt-2 flex items-center justify-between border-t gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Default
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                Save Date
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

