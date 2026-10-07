import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SyllabusPage } from './SyllabusPage';

describe('SyllabusPage', () => {
  it('renders syllabus explorer title and subject tabs', async () => {
    render(
      <MemoryRouter>
        <SyllabusPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Syllabus Explorer')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole('tab', { name: /Mathematics/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Physics/i })).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /Chemistry/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /English/i })).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /Computer Science/i }),
      ).toBeInTheDocument();
    });
  });

  it('switches subject tab and displays relevant topics', async () => {
    render(
      <MemoryRouter>
        <SyllabusPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Physics/i })).toBeInTheDocument();
    });

    const physicsTab = screen.getByRole('tab', { name: /Physics/i });
    fireEvent.click(physicsTab);

    await waitFor(() => {
      expect(screen.getByText(/Mechanics/i)).toBeInTheDocument();
    });
  });

  it('filters topics by search query', async () => {
    render(
      <MemoryRouter>
        <SyllabusPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/Search by topic/i),
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by topic/i);
    fireEvent.change(searchInput, { target: { value: 'Complex' } });

    await waitFor(() => {
      expect(screen.getByText(/জটিল রাশিমালা/i)).toBeInTheDocument();
    });
  });

  it('displays empty state when search finds no results and can reset', async () => {
    render(
      <MemoryRouter>
        <SyllabusPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/Search by topic/i),
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by topic/i);
    fireEvent.change(searchInput, {
      target: { value: 'nonexistent-query-zzz' },
    });

    await waitFor(() => {
      expect(screen.getByText('No matching topics found')).toBeInTheDocument();
    });

    const resetBtn = screen.getByRole('button', { name: /Reset Search/i });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(
        screen.queryByText('No matching topics found'),
      ).not.toBeInTheDocument();
    });
  });
});
