import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubjectTabs } from './SubjectTabs';
import type { SubjectMeta } from '@/domain/types';

describe('SubjectTabs accessibility and keyboard navigation', () => {
  const mockSubjects: SubjectMeta[] = [
    { id: 'math', name: 'Mathematics', nameBn: 'গণিত', description: 'Math', iconName: 'Calculator', totalTopics: 20, totalChapters: 5 },
    { id: 'physics', name: 'Physics', nameBn: 'পদার্থ', description: 'Physics', iconName: 'Atom', totalTopics: 18, totalChapters: 4 },
    { id: 'chemistry', name: 'Chemistry', nameBn: 'রসায়ন', description: 'Chemistry', iconName: 'FlaskConical', totalTopics: 15, totalChapters: 3 },
  ];

  it('renders tablist role with tabs having aria-selected and roving tabindex', () => {
    const onSelect = vi.fn();
    render(
      <SubjectTabs
        subjects={mockSubjects}
        selectedSubjectId="math"
        onSelectSubject={onSelect}
      />
    );

    const tablist = screen.getByRole('tablist', { name: /Syllabus Subjects/i });
    expect(tablist).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);

    // First tab is selected with tabIndex 0
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('tabIndex', '0');

    // Second tab is unselected with tabIndex -1
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[1]).toHaveAttribute('tabIndex', '-1');
  });

  it('navigates to next tab on ArrowRight keydown', () => {
    const onSelect = vi.fn();
    render(
      <SubjectTabs
        subjects={mockSubjects}
        selectedSubjectId="math"
        onSelectSubject={onSelect}
      />
    );

    const firstTab = screen.getAllByRole('tab')[0];
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });

    expect(onSelect).toHaveBeenCalledWith('physics');
  });

  it('navigates to previous tab on ArrowLeft keydown (wrapping to end)', () => {
    const onSelect = vi.fn();
    render(
      <SubjectTabs
        subjects={mockSubjects}
        selectedSubjectId="math"
        onSelectSubject={onSelect}
      />
    );

    const firstTab = screen.getAllByRole('tab')[0];
    fireEvent.keyDown(firstTab, { key: 'ArrowLeft' });

    expect(onSelect).toHaveBeenCalledWith('chemistry');
  });
});

