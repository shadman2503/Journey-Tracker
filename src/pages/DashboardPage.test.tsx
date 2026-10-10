import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import { useTopicProgressStore } from '@/stores/useTopicProgressStore';

vi.mock('@/repositories/dexie', () => ({
  topicProgressRepo: {
    getAll: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    useTopicProgressStore.setState({
      progressMap: {},
      loaded: true,
      isLoading: false,
    });
  });

  it('renders dashboard title and top metric cards', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText('DUET 2027 Journey Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Overall Completion')).toBeInTheDocument();
    expect(screen.getByText('Current Streak')).toBeInTheDocument();
    expect(screen.getByText('Questions Solved')).toBeInTheDocument();
    expect(screen.getByText('Study Time')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/161 topics/i)).toBeInTheDocument();
    });
  });

  it('renders syllabus progress overview section and all 5 subject cards', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Syllabus Progress Overview')).toBeInTheDocument();
    expect(screen.getByText('Overall Syllabus Mastery')).toBeInTheDocument();
    expect(screen.getByText('Subject-wise Mastery')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
      expect(screen.getByText('Physics')).toBeInTheDocument();
      expect(screen.getByText('Chemistry')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Computer Science & Engineering')).toBeInTheDocument();
    });
  });

  it('updates overall completion when topics have progress', async () => {
    useTopicProgressStore.setState({
      progressMap: {
        'math-alg-complex': {
          topicId: 'math-alg-complex',
          status: 'strong',
          updatedAt: '',
        },
      },
      loaded: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // 1 strong topic out of 161 total topics = ~1%
      expect(screen.getByText('1 of 161 topics mastered')).toBeInTheDocument();
    });
  });

  it('contains navigation links to syllabus subjects', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const mathLink = screen.getByRole('link', { name: /Mathematics/i });
      expect(mathLink).toHaveAttribute('href', '/syllabus?subject=math');

      const physicsLink = screen.getByRole('link', { name: /Physics/i });
      expect(physicsLink).toHaveAttribute('href', '/syllabus?subject=physics');
    });
  });
});
