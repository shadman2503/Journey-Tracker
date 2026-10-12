import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from './Sidebar';

describe('Sidebar Component', () => {
  const renderSidebar = (isOpen = false, onClose = vi.fn(), initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Sidebar isOpen={isOpen} onClose={onClose} />
      </MemoryRouter>
    );
  };

  it('renders desktop sidebar with brand header, all 7 navigation links, and target status', () => {
    renderSidebar();

    const desktopSidebar = screen.getByTestId('desktop-sidebar');
    expect(desktopSidebar).toBeInTheDocument();

    // Brand header
    expect(desktopSidebar).toHaveTextContent('DUET 2027');
    expect(desktopSidebar).toHaveTextContent('Journey Tracker');

    // All 7 links in the specification
    const navItems = [
      'Dashboard',
      'Syllabus',
      'Study Log',
      'Mistakes',
      'Mock Tests',
      'Analytics',
      'Journey',
    ];

    navItems.forEach((name) => {
      expect(desktopSidebar).toHaveTextContent(name);
    });

    // Check specific hrefs
    expect(desktopSidebar.querySelector('a[href="/"]')).toBeInTheDocument();
    expect(desktopSidebar.querySelector('a[href="/syllabus"]')).toBeInTheDocument();
    expect(desktopSidebar.querySelector('a[href="/study-log"]')).toBeInTheDocument();
    expect(desktopSidebar.querySelector('a[href="/mistakes"]')).toBeInTheDocument();
    expect(desktopSidebar.querySelector('a[href="/mock-tests"]')).toBeInTheDocument();
    expect(desktopSidebar.querySelector('a[href="/analytics"]')).toBeInTheDocument();
    expect(desktopSidebar.querySelector('a[href="/journey"]')).toBeInTheDocument();

    // Footer target status
    expect(desktopSidebar).toHaveTextContent('Target: DUET 2027');
  });

  it('hides mobile sidebar drawer when isOpen is false', () => {
    renderSidebar(false);

    const drawer = screen.getByTestId('mobile-sidebar-drawer');
    const backdrop = screen.getByTestId('mobile-sidebar-backdrop');

    expect(drawer).toHaveClass('-translate-x-full');
    expect(drawer).toHaveClass('opacity-0');
    expect(backdrop).toHaveClass('opacity-0');
    expect(backdrop).toHaveClass('pointer-events-none');
  });

  it('shows mobile sidebar drawer and backdrop when isOpen is true', () => {
    renderSidebar(true);

    const drawer = screen.getByTestId('mobile-sidebar-drawer');
    const backdrop = screen.getByTestId('mobile-sidebar-backdrop');

    expect(drawer).toHaveClass('translate-x-0');
    expect(drawer).toHaveClass('opacity-100');
    expect(backdrop).toHaveClass('opacity-100');
    expect(backdrop).toHaveClass('pointer-events-auto');

    // Mobile drawer should also contain all 7 links
    expect(drawer).toHaveTextContent('Dashboard');
    expect(drawer).toHaveTextContent('Syllabus');
    expect(drawer).toHaveTextContent('Study Log');
    expect(drawer).toHaveTextContent('Mistakes');
    expect(drawer).toHaveTextContent('Mock Tests');
    expect(drawer).toHaveTextContent('Analytics');
    expect(drawer).toHaveTextContent('Journey');
  });

  it('calls onClose when close button in mobile drawer is clicked', () => {
    const onClose = vi.fn();
    renderSidebar(true, onClose);

    const closeBtn = screen.getByRole('button', { name: /Close navigation sidebar/i });
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    renderSidebar(true, onClose);

    const backdrop = screen.getByTestId('mobile-sidebar-backdrop');
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    renderSidebar(true, onClose);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when a navigation item in mobile drawer is clicked', () => {
    const onClose = vi.fn();
    renderSidebar(true, onClose);

    const drawer = screen.getByTestId('mobile-sidebar-drawer');
    const syllabusLink = drawer.querySelector('a[href="/syllabus"]');
    expect(syllabusLink).toBeInTheDocument();

    if (syllabusLink) {
      fireEvent.click(syllabusLink);
    }

    expect(onClose).toHaveBeenCalled();
  });

  it('renders developer acknowledgment credit linking to GitHub', () => {
    renderSidebar();

    const desktopSidebar = screen.getByTestId('desktop-sidebar');
    expect(desktopSidebar).toHaveTextContent('Developer');
    expect(desktopSidebar).toHaveTextContent('Shadman Shoumik');

    const devLink = desktopSidebar.querySelector('a[href="https://github.com/shadman2503"]');
    expect(devLink).toBeInTheDocument();
    expect(devLink).toHaveAttribute('target', '_blank');

    const devImg = devLink?.querySelector('img');
    expect(devImg).toHaveAttribute('src', 'https://github.com/shadman2503.png');
    expect(devImg).toHaveAttribute('alt', 'Shadman Shoumik');
  });
});
