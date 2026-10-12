import React, { useState, useRef } from 'react';
import { X, Flag, AlertCircle } from 'lucide-react';
import type { MilestoneCategory } from '@/domain/types';
import { Button } from '@/components/ui/button';
import { useDialogAccessibility } from '@/hooks/useDialogAccessibility';
import {
  createCustomMilestoneSchema,
  type CreateCustomMilestoneInput,
} from '@/domain/milestones';

interface AddMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateCustomMilestoneInput) => Promise<void | number>;
}

export const AddMilestoneModal: React.FC<AddMilestoneModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<MilestoneCategory>('custom');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogAccessibility({
    isOpen,
    onClose,
    containerRef: dialogRef,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validation = createCustomMilestoneSchema.safeParse({
      title,
      description,
      date,
      category,
    });

    if (!validation.success) {
      setErrorMessage(
        validation.error.errors[0]?.message || 'Please check your input',
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(validation.data);
      // Reset form
      setTitle('');
      setDescription('');
      setDate(new Date().toISOString().slice(0, 10));
      setCategory('custom');
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to save milestone';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={dialogRef}
      role='dialog'
      aria-modal='true'
      aria-label='Add Custom Milestone'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs'
    >
      <div className='relative w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95'>
        {/* Header */}
        <div className='flex items-center justify-between pb-4 border-b'>
          <div className='flex items-center gap-2.5'>
            <span className='p-2 rounded-xl bg-primary/10 text-primary'>
              <Flag className='h-5 w-5' />
            </span>
            <div>
              <h2 className='text-lg font-bold text-foreground'>
                Add Personal Milestone
              </h2>
              <p className='text-xs text-muted-foreground'>
                Mark key prep steps, goals achieved, or study events
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Close add milestone dialog'
            className='p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className='my-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2'>
            <AlertCircle className='h-4 w-4 shrink-0' />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-4 pt-4'>
          <div>
            <label
              htmlFor='milestone-title'
              className='block text-xs font-semibold text-foreground mb-1.5'
            >
              Milestone Title *
            </label>
            <input
              id='milestone-title'
              type='text'
              placeholder='e.g. Bought Previous 10 Years Question Bank'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className='w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50'
            />
          </div>

          <div>
            <label
              htmlFor='milestone-description'
              className='block text-xs font-semibold text-foreground mb-1.5'
            >
              Description *
            </label>
            <textarea
              id='milestone-description'
              rows={3}
              placeholder='Why this milestone is important for your DUET journey...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className='w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50 resize-none'
            />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='milestone-date'
                className='block text-xs font-semibold text-foreground mb-1.5'
              >
                Date Achieved *
              </label>
              <input
                id='milestone-date'
                type='date'
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className='w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50'
              />
            </div>

            <div>
              <label
                htmlFor='milestone-category'
                className='block text-xs font-semibold text-foreground mb-1.5'
              >
                Category
              </label>
              <select
                id='milestone-category'
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as MilestoneCategory)
                }
                className='w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50'
              >
                <option value='custom'>Personal Goal / Event</option>
                <option value='syllabus'>Syllabus Coverage</option>
                <option value='streak'>Study Streak</option>
                <option value='mock'>Mock Test Target</option>
                <option value='question_count'>Question Count Goal</option>
                <option value='study_time'>Study Hours Milestone</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className='flex items-center justify-end gap-3 pt-4 border-t'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              size='sm'
              disabled={isSubmitting}
              className='bg-primary text-primary-foreground hover:bg-primary/90'
            >
              {isSubmitting ? 'Saving...' : 'Save Milestone'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
