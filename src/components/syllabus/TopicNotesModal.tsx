import React, { useState, useEffect } from 'react';
import type { SyllabusTopic } from '@/domain/types';
import { X, Save, FileText } from 'lucide-react';

interface TopicNotesModalProps {
  topic: SyllabusTopic;
  initialNotes: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string) => Promise<void> | void;
}

export const TopicNotesModal: React.FC<TopicNotesModalProps> = ({
  topic,
  initialNotes,
  isOpen,
  onClose,
  onSave,
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, notes]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(notes);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='topic-notes-title'
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm'
    >
      <div className='relative w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl animate-in fade-in-0 zoom-in-95'>
        <div className='flex items-start justify-between gap-4 pb-4 border-b'>
          <div>
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <span className='px-1.5 py-0.5 rounded bg-muted font-medium'>
                {topic.section}
              </span>
              <span>&bull;</span>
              <span>{topic.chapter}</span>
            </div>
            <h3
              id='topic-notes-title'
              className='text-base font-semibold text-foreground mt-1'
            >
              Notes: {topic.name}
            </h3>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Close modal'
            className='p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        <div className='py-4 space-y-2'>
          <label
            htmlFor='topic-notes-textarea'
            className='text-xs font-medium text-muted-foreground flex items-center gap-1.5'
          >
            <FileText className='h-3.5 w-3.5' />
            Personal revision notes & key formulas
          </label>
          <textarea
            id='topic-notes-textarea'
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder='Record tricky formulas, common pitfalls, shortcut tricks, or problem numbers to re-solve...'
            className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y min-h-[120px]'
          />
          <p className='text-[11px] text-muted-foreground flex justify-between'>
            <span>Press Ctrl+Enter to save</span>
            <span>{notes.length} characters</span>
          </p>
        </div>

        <div className='flex items-center justify-end gap-2 pt-3 border-t'>
          <button
            type='button'
            onClick={onClose}
            className='px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleSave}
            disabled={isSaving}
            className='inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50'
          >
            <Save className='h-3.5 w-3.5' />
            {isSaving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>
    </div>
  );
};
