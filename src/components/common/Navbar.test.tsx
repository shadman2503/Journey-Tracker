import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useAppStore } from '@/stores/useAppStore';

describe('Navbar and Mobile Navigation Component', () => {
  beforeEach(() => {
    useAppStore.setState({ theme: 'dark' });
  });

  const renderNavbar = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Navbar />
      </MemoryRouter>
    );
  };

  it('renders brand title and desktop navigation elements', () => {
    renderNavbar();

    expect(screen.getAllByText('DUET 2027')[0]).toBeInTheDocument();
    expect(screen.getByLabelText('Backup and restore data')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-menu-toggle')).toBeInTheDocument();
  });

  it('toggles mobile navigation drawer when mobile menu toggle button is clicked', () => {
    renderNavbar();

    const toggleButton = screen.getByTestId('mobile-menu-toggle');
    const drawer = screen.getByTestId('mobile-menu-drawer');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(drawer).toHaveClass('translate-x-full');
    expect(drawer).toHaveClass('opacity-0');

    // Open menu
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(drawer).toHaveClass('translate-x-0');
    expect(drawer).toHaveClass('opacity-100');

    // Verify links in mobile drawer
    expect(drawer).toHaveTextContent('Mock Tests');
    expect(drawer).toHaveTextContent('Analytics');
    expect(drawer).toHaveTextContent('Journey');
    expect(drawer).toHaveTextContent('Backup & Restore Data');

    // Close menu
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(drawer).toHaveClass('translate-x-full');
    expect(drawer).toHaveClass('opacity-0');
  });

  it('closes mobile drawer when a navigation link inside the drawer is clicked', () => {
    renderNavbar();

    const toggleButton = screen.getByTestId('mobile-menu-toggle');
    fireEvent.click(toggleButton);
    const drawer = screen.getByTestId('mobile-menu-drawer');
    expect(drawer).toHaveClass('translate-x-0');

    const mockTestsLink = drawer.querySelector('a[href="/mock-tests"]');
    expect(mockTestsLink).toBeInTheDocument();

    if (mockTestsLink) {
      fireEvent.click(mockTestsLink);
    }

    expect(drawer).toHaveClass('translate-x-full');
  });

  it('closes mobile drawer when the Escape key is pressed', () => {
    renderNavbar();

    const toggleButton = screen.getByTestId('mobile-menu-toggle');
    fireEvent.click(toggleButton);
    const drawer = screen.getByTestId('mobile-menu-drawer');
    expect(drawer).toHaveClass('translate-x-0');

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(drawer).toHaveClass('translate-x-full');
  });

  it('toggles mobile menu when More/Menu button in MobileBottomBar is clicked', () => {
    renderNavbar();

    const bottomMoreButton = screen.getByRole('button', { name: /Open navigation menu/i });
    expect(bottomMoreButton).toBeInTheDocument();

    fireEvent.click(bottomMoreButton);
    const drawer = screen.getByTestId('mobile-menu-drawer');
    expect(drawer).toHaveClass('translate-x-0');

    const closeButton = screen.getByRole('button', { name: /Close navigation menu/i });
    fireEvent.click(closeButton);
    expect(drawer).toHaveClass('translate-x-full');
  });

  it('toggles app theme when theme button in mobile drawer is clicked', () => {
    renderNavbar();

    const toggleButton = screen.getByTestId('mobile-menu-toggle');
    fireEvent.click(toggleButton);

    const switchThemeButton = screen.getByText('Switch to Light Mode');
    fireEvent.click(switchThemeButton);

    expect(useAppStore.getState().theme).toBe('light');
  });

  it('opens backup modal from mobile drawer action button', () => {
    renderNavbar();

    const toggleButton = screen.getByTestId('mobile-menu-toggle');
    fireEvent.click(toggleButton);

    const backupButton = screen.getByRole('button', { name: /Backup & Restore Data/i });
    fireEvent.click(backupButton);

    // Modal dialog is opened
    expect(screen.getByRole('dialog', { name: /Data Backup & Portability/i })).toBeInTheDocument();
    // Drawer should have closed
    const drawer = screen.getByTestId('mobile-menu-drawer');
    expect(drawer).toHaveClass('translate-x-full');
  });

  it('closes mobile drawer when clicking the backdrop', () => {
    renderNavbar();

    const toggleButton = screen.getByTestId('mobile-menu-toggle');
    fireEvent.click(toggleButton);
    const drawer = screen.getByTestId('mobile-menu-drawer');
    expect(drawer).toHaveClass('translate-x-0');

    const backdrop = screen.getByTestId('mobile-menu-backdrop');
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop);
    expect(drawer).toHaveClass('translate-x-full');
  });

  it('renders exactly four primary navigation links plus menu in the mobile bottom bar', () => {
    renderNavbar();

    const bottomNav = screen.getByRole('navigation', { name: /Mobile Bottom Navigation/i });
    expect(bottomNav).toBeInTheDocument();
    expect(bottomNav).toHaveTextContent('Dashboard');
    expect(bottomNav).toHaveTextContent('Syllabus');
    expect(bottomNav).toHaveTextContent('Study Log');
    expect(bottomNav).toHaveTextContent('Mistakes');
    expect(bottomNav).toHaveTextContent('Menu');
    // Analytics and Journey are hidden from the bottom bar
    expect(bottomNav).not.toHaveTextContent('Analytics');
    expect(bottomNav).not.toHaveTextContent('Journey');
    expect(bottomNav).not.toHaveTextContent('Mock Tests');
  });

  it('shows Analytics, Journey, and Mock Tests when opening the mobile menu drawer', () => {
    renderNavbar();

    const menuButton = screen.getByRole('button', { name: /Open navigation menu/i });
    fireEvent.click(menuButton);

    const drawer = screen.getByTestId('mobile-menu-drawer');
    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveTextContent('Analytics');
    expect(drawer).toHaveTextContent('Journey');
    expect(drawer).toHaveTextContent('Mock Tests');
  });
});

