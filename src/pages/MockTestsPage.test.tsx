import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockTestsPage } from './MockTestsPage';
import { useMockTestStore } from '@/stores/useMockTestStore';
import type { MockTest } from '@/domain/types';

// Mock repository
vi.mock('@/repositories/dexie', () => ({
  mockTestRepo: {
    getAll: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue(1),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

import { mockTestRepo } from '@/repositories/dexie';

describe('MockTestsPage', () => {
  const sampleTests: MockTest[] = [
    {
      id: 1,
      testName: 'DUET Full Model Test 1',
      date: '2026-10-01',
      subjectId: undefined, // Full Syllabus
      totalQuestions: 100,
      correctAnswers: 60,
      wrongAnswers: 20,
      score: 55,
      accuracy: 75,
      timeTakenMinutes: 120,
      notes: 'Initial baseline',
      createdAt: '',
    },
    {
      id: 2,
      testName: 'Math Sectional Test 1',
      date: '2026-10-05',
      subjectId: 'math',
      totalQuestions: 30,
      correctAnswers: 25,
      wrongAnswers: 4,
      score: 24,
      accuracy: 86.2,
      timeTakenMinutes: 45,
      notes: 'Calculus and Algebra',
      createdAt: '',
    },
    {
      id: 3,
      testName: 'Physics Sectional Test 1',
      date: '2026-10-08',
      subjectId: 'physics',
      totalQuestions: 30,
      correctAnswers: 20,
      wrongAnswers: 8,
      score: 18,
      accuracy: 71.4,
      timeTakenMinutes: 40,
      notes: 'Mechanics focus',
      createdAt: '',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useMockTestStore.setState({
      tests: [],
      loaded: true,
      isLoading: false,
      isRecordModalOpen: false,
    });
  });

  it('renders page header and empty state when no mock tests exist', () => {
    render(<MockTestsPage />);

    expect(screen.getByRole('heading', { name: /Mock Test History/i })).toBeInTheDocument();
    expect(screen.getByText(/No Mock Tests Recorded Yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Record Your First Mock Test/i })).toBeInTheDocument();
  });

  it('renders summary cards and test cards when tests are loaded', () => {
    useMockTestStore.setState({
      tests: sampleTests,
      loaded: true,
      isLoading: false,
    });

    render(<MockTestsPage />);

    expect(screen.getByText('DUET Full Model Test 1')).toBeInTheDocument();
    expect(screen.getByText('Math Sectional Test 1')).toBeInTheDocument();
    expect(screen.getByText('Physics Sectional Test 1')).toBeInTheDocument();

    // Summary cards
    expect(screen.getByText('Tests Taken')).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1); // total tests count in card and tab
    expect(screen.getByText('Average Score')).toBeInTheDocument();
    expect(screen.getByText('Average Accuracy')).toBeInTheDocument();
    expect(screen.getAllByText('Highest Score').length).toBeGreaterThanOrEqual(1);
  });

  it('filters tests by scope tabs', () => {
    useMockTestStore.setState({
      tests: sampleTests,
      loaded: true,
      isLoading: false,
    });

    render(<MockTestsPage />);

    const mathTab = screen.getByRole('button', { name: /Mathematics/i });
    fireEvent.click(mathTab);

    expect(screen.getByText('Math Sectional Test 1')).toBeInTheDocument();
    expect(screen.queryByText('DUET Full Model Test 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Physics Sectional Test 1')).not.toBeInTheDocument();
  });

  it('filters tests by search query keyword', () => {
    useMockTestStore.setState({
      tests: sampleTests,
      loaded: true,
      isLoading: false,
    });

    render(<MockTestsPage />);

    const searchInput = screen.getByPlaceholderText(/Search tests by title or notes/i);
    fireEvent.change(searchInput, { target: { value: 'mechanics' } });

    expect(screen.getByText('Physics Sectional Test 1')).toBeInTheDocument();
    expect(screen.queryByText('DUET Full Model Test 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Math Sectional Test 1')).not.toBeInTheDocument();
  });

  it('displays empty state when filter matches no tests and resets on button click', () => {
    useMockTestStore.setState({
      tests: sampleTests,
      loaded: true,
      isLoading: false,
    });

    render(<MockTestsPage />);

    const searchInput = screen.getByPlaceholderText(/Search tests by title or notes/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent keyword' } });

    expect(screen.getByText(/No Tests Match Your Filter/i)).toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: /Clear Filters/i });
    fireEvent.click(clearBtn);

    expect(screen.getByText('DUET Full Model Test 1')).toBeInTheDocument();
  });

  it('handles selecting 2 tests and opening comparison modal', () => {
    useMockTestStore.setState({
      tests: sampleTests,
      loaded: true,
      isLoading: false,
    });

    render(<MockTestsPage />);

    // Select first test to compare
    const compareButtons = screen.getAllByRole('button', { name: /^Compare/i });
    fireEvent.click(compareButtons[0]);

    expect(screen.getByText(/Select 1 more test to compare/i)).toBeInTheDocument();

    // Select second test
    fireEvent.click(compareButtons[1]);

    expect(screen.getByText(/Ready to compare/i)).toBeInTheDocument();

    // Click "Compare Tests" button
    const compareTestsBtn = screen.getByRole('button', { name: /Compare Tests/i });
    fireEvent.click(compareTestsBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Mock Test Comparison/i })).toBeInTheDocument();
  });

  it('confirms and deletes a mock test through store and repository', async () => {
    useMockTestStore.setState({
      tests: sampleTests,
      loaded: true,
      isLoading: false,
    });

    render(<MockTestsPage />);

    // Newest test is sorted first (sampleTests[2] with id 3 on 2026-10-08)
    const deleteButtons = screen.getAllByLabelText(/Delete mock test/i);
    fireEvent.click(deleteButtons[0]);

    const yesBtn = screen.getByRole('button', { name: /Yes/i });
    fireEvent.click(yesBtn);

    await waitFor(() => {
      expect(mockTestRepo.delete).toHaveBeenCalledWith(3);
    });
  });

  it('opens record mock test modal when Record Mock Test button is clicked', () => {
    render(<MockTestsPage />);

    const recordBtn = screen.getByRole('button', { name: /Record Mock Test/i });
    fireEvent.click(recordBtn);

    expect(useMockTestStore.getState().isRecordModalOpen).toBe(true);
  });
});

