import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';
import { useAppStore } from '@/stores/useAppStore';

describe('Header Component', () => {
  beforeEach(() => {
    useAppStore.setState({ theme: 'dark' });
  });

  const renderHeader = (
    initialRoute = '/',
    onToggleMobileSidebar = vi.fn(),
    isMobileSidebarOpen = false
  ) => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Header
          onToggleMobileSidebar={onToggleMobileSidebar}
          isMobileSidebarOpen={isMobileSidebarOpen}
        />
      </MemoryRouter>
    );
  };

  it('renders desktop page title matching the active route', () => {
    renderHeader('/syllabus');

    expect(screen.getByText('Syllabus Explorer')).toBeInTheDocument();
  });

  it('renders top-right Backup button and opens DataBackupModal when clicked', () => {
    renderHeader();

    const backupBtn = screen.getByTestId('header-backup-btn');
    expect(backupBtn).toBeInTheDocument();
    expect(backupBtn).toHaveTextContent('Backup');

    fireEvent.click(backupBtn);

    // Modal opens
    expect(screen.getByRole('dialog', { name: /Data Backup & Portability/i })).toBeInTheDocument();
  });

  it('renders top-right Theme toggle button and toggles theme state when clicked', () => {
    renderHeader();

    const themeToggle = screen.getByTestId('header-theme-toggle');
    expect(themeToggle).toBeInTheDocument();
    expect(useAppStore.getState().theme).toBe('dark');

    fireEvent.click(themeToggle);
    expect(useAppStore.getState().theme).toBe('light');

    fireEvent.click(themeToggle);
    expect(useAppStore.getState().theme).toBe('dark');
  });

  it('renders mobile menu toggle button and invokes onToggleMobileSidebar on click', () => {
    const onToggle = vi.fn();
    renderHeader('/', onToggle, false);

    const toggleBtn = screen.getByTestId('mobile-sidebar-toggle');
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggleBtn);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});

