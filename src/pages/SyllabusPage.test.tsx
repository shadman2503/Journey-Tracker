import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SyllabusPage } from './SyllabusPage';
import { useTopicProgressStore } from '@/stores/useTopicProgressStore';

vi.mock('@/repositories/dexie', () => ({
  topicProgressRepo: {
    getAll: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('SyllabusPage', () => {
  beforeEach(() => {
    useTopicProgressStore.setState({
      progressMap: {},
      loaded: true,
      isLoading: false,
    });
  });

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
      expect(screen.queryByText('Loading syllabus...')).not.toBeInTheDocument();
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
      expect(screen.queryByText('Loading syllabus...')).not.toBeInTheDocument();
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
      expect(screen.queryByText('Loading syllabus...')).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by topic/i);
    fireEvent.change(searchInput, {
      target: { value: 'nonexistent-query-zzz' },
    });

    await waitFor(() => {
      expect(screen.getByText('No matching topics found')).toBeInTheDocument();
    });

    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(
        screen.queryByText('No matching topics found'),
      ).not.toBeInTheDocument();
    });
  });

  it('displays status breakdown counts and updates topic status', async () => {
    render(
      <MemoryRouter>
        <SyllabusPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading syllabus...')).not.toBeInTheDocument();
      expect(screen.getByText(/All \(38\)/i)).toBeInTheDocument();
      expect(screen.getByText(/0 Strong/i)).toBeInTheDocument();
    });

    // Find first status dropdown button on a topic card (exact name "Not Started", not "Not Started (38)")
    const topicStatusButtons = screen.getAllByRole('button', {
      name: /^Not Started$/i,
    });
    expect(topicStatusButtons.length).toBeGreaterThan(0);

    // Open dropdown for the first topic
    fireEvent.click(topicStatusButtons[0]);

    // Click "Strong" option in the listbox
    const strongOption = await screen.findByRole('option', { name: /Strong/i });
    fireEvent.click(strongOption);

    // Verify status updated in the store and header counter
    await waitFor(() => {
      expect(screen.getByText(/1 Strong/i)).toBeInTheDocument();
    });
  });

  it('filters topics by status filter pill and shows empty status view if none exist', async () => {
    render(
      <MemoryRouter>
        <SyllabusPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading syllabus...')).not.toBeInTheDocument();
      expect(screen.getByText(/0 Strong/i)).toBeInTheDocument();
    });

    // Click Strong filter pill
    const strongFilter = screen.getByRole('button', {
      name: /Strong\s*\(0\)/i,
    });
    fireEvent.click(strongFilter);

    // Should display empty filter state
    await waitFor(() => {
      expect(
        screen.getByText(/No topics with status “Strong”/i),
      ).toBeInTheDocument();
    });

    // Reset filter
    const showAllBtn = screen.getByRole('button', { name: /Show All Topics/i });
    fireEvent.click(showAllBtn);

    await waitFor(() => {
      expect(
        screen.queryByText(/No topics with status “Strong”/i),
      ).not.toBeInTheDocument();
    });
  });
});
