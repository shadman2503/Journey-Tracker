import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MistakeFilterBar } from './MistakeFilterBar';
import type { MistakeFilterOptions } from '@/domain/mistakeFilter';

describe('MistakeFilterBar', () => {
  const defaultFilters: MistakeFilterOptions = {
    searchQuery: '',
    subjectId: 'all',
    type: 'all',
    status: 'all',
    urgency: 'all',
    sortBy: 'newest',
  };

  it('renders search input, filter selects, and results count', () => {
    const onFilterChange = vi.fn();
    const onResetFilters = vi.fn();

    render(
      <MistakeFilterBar
        filters={defaultFilters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        totalCount={10}
        filteredCount={10}
      />,
    );

    expect(screen.getByPlaceholderText(/Search by topic, question reference/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Subjects')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Classifications')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Statuses')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Review Timelines')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Newest First')).toBeInTheDocument();
    expect(screen.getByText(/Showing/i)).toHaveTextContent('Showing 10 of 10');
  });

  it('calls onFilterChange when search query is typed', () => {
    const onFilterChange = vi.fn();
    const onResetFilters = vi.fn();

    render(
      <MistakeFilterBar
        filters={defaultFilters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        totalCount={10}
        filteredCount={10}
      />,
    );

    const input = screen.getByPlaceholderText(/Search by topic, question reference/i);
    fireEvent.change(input, { target: { value: 'integration' } });

    expect(onFilterChange).toHaveBeenCalledWith({
      ...defaultFilters,
      searchQuery: 'integration',
    });
  });

  it('shows clear search button when query is populated and clears query on click', () => {
    const onFilterChange = vi.fn();
    const onResetFilters = vi.fn();

    render(
      <MistakeFilterBar
        filters={{ ...defaultFilters, searchQuery: 'integration' }}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        totalCount={10}
        filteredCount={3}
      />,
    );

    const clearSearchBtn = screen.getByRole('button', { name: /Clear search query/i });
    fireEvent.click(clearSearchBtn);

    expect(onFilterChange).toHaveBeenCalledWith({
      ...defaultFilters,
      searchQuery: '',
    });
  });

  it('calls onFilterChange when a filter dropdown is selected', () => {
    const onFilterChange = vi.fn();
    const onResetFilters = vi.fn();

    render(
      <MistakeFilterBar
        filters={defaultFilters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        totalCount={10}
        filteredCount={10}
      />,
    );

    const subjectSelect = screen.getByDisplayValue('All Subjects');
    fireEvent.change(subjectSelect, { target: { value: 'math' } });

    expect(onFilterChange).toHaveBeenCalledWith({
      ...defaultFilters,
      subjectId: 'math',
    });
  });

  it('shows reset button when filters are active and triggers onResetFilters', () => {
    const onFilterChange = vi.fn();
    const onResetFilters = vi.fn();

    render(
      <MistakeFilterBar
        filters={{ ...defaultFilters, subjectId: 'math' }}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        totalCount={10}
        filteredCount={4}
      />,
    );

    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(onResetFilters).toHaveBeenCalledTimes(1);
  });
});
