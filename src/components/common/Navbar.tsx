import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Compass,
  BookOpen,
  Calendar,
  AlertCircle,
  FileCheck,
  BarChart3,
  Milestone as MilestoneIcon,
  Moon,
  Sun,
  Database,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/components/ui/button';
import { DataBackupModal } from '@/components/backup/DataBackupModal';
import { MobileBottomBar } from '@/components/common/MobileBottomBar';
import { cn } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useAppStore();
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Compass },
    { name: 'Syllabus', path: '/syllabus', icon: BookOpen },
    { name: 'Study Log', path: '/study-log', icon: Calendar },
    { name: 'Mistakes', path: '/mistakes', icon: AlertCircle },
    { name: 'Mock Tests', path: '/mock-tests', icon: FileCheck },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Journey', path: '/journey', icon: MilestoneIcon },
  ];

  // Additional pages not on the mobile 4-tab bottom bar
  const otherPages = [
    { name: 'Analytics', path: '/analytics', icon: BarChart3, desc: 'Preparation pace, time & velocity' },
    { name: 'Journey', path: '/journey', icon: MilestoneIcon, desc: 'Milestones & chronological timeline' },
    { name: 'Mock Tests', path: '/mock-tests', icon: FileCheck, desc: 'Test scores & accuracy tracking' },
  ];

  // Core pages on the bottom bar
  const corePages = [
    { name: 'Dashboard', path: '/', icon: Compass },
    { name: 'Syllabus', path: '/syllabus', icon: BookOpen },
    { name: 'Study Log', path: '/study-log', icon: Calendar },
    { name: 'Mistakes', path: '/mistakes', icon: AlertCircle },
  ];

  // Auto-close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle Escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <NavLink
              to="/"
              className="flex items-center gap-2 font-bold text-lg tracking-tight text-primary focus:outline-none"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Compass className="h-6 w-6" />
              <span>DUET 2027</span>
            </NavLink>

            {/* Desktop Navigation */}
            <nav
              role="navigation"
              aria-label="Desktop Navigation"
              className="hidden md:flex items-center gap-1 text-sm font-medium"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBackupModalOpen(true)}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Backup and restore data"
            >
              <Database className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Backup</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Mobile Hamburger Menu Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden text-muted-foreground hover:text-foreground"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              data-testid="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer & Backdrop - Right to Left slide transition with semi-transparent frosted glass */}
      {/* Backdrop scrim with fade transition */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-xs md:hidden transition-opacity duration-300 ease-in-out",
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
        data-testid="mobile-menu-backdrop"
        aria-hidden={!isMobileMenuOpen}
      />

      {/* Drawer Sheet sliding from right to left with smooth in/out transition & increased transparency */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        aria-hidden={!isMobileMenuOpen}
        inert={!isMobileMenuOpen}
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-72 sm:w-80 max-w-[85vw] border-l border-border/50 shadow-2xl overflow-y-auto md:hidden flex flex-col",
          "bg-card/50 backdrop-blur-xl supports-[backdrop-filter]:bg-card/40",
          "transition-all duration-300 ease-in-out",
          isMobileMenuOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-full opacity-0 pointer-events-none"
        )}
        data-testid="mobile-menu-drawer"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-border/40 shrink-0 bg-background/30">
          <div className="flex items-center gap-2 font-bold text-base tracking-tight text-primary">
            <Compass className="h-5 w-5" />
            <span>DUET 2027</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close drawer"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Content */}
        <div className="p-4 space-y-5 flex-1 overflow-y-auto">
          {/* Highlighted Other Pages: Analytics, Journey, Mock Tests */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
              Explore & Analyze
            </div>
            <div className="space-y-1.5">
              {otherPages.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between p-3 rounded-xl border transition-all min-h-[46px]',
                        isActive
                          ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                          : 'bg-background/40 hover:bg-accent/70 border-border/50 text-foreground'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'p-1.5 rounded-lg',
                              isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
                            )}
                          >
                            <Icon className="h-4.5 w-4.5 shrink-0" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-semibold">{item.name}</div>
                            <div
                              className={cn(
                                'text-[10px] leading-tight',
                                isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                              )}
                            >
                              {item.desc}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={cn('h-4 w-4 shrink-0 opacity-60', isActive && 'text-primary-foreground')} />
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Core Pages Section */}
          <div className="space-y-1.5 pt-3 border-t border-border/40">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
              Core Pages
            </div>
            <div className="space-y-1">
              {corePages.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[40px]',
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Tools & Settings Section */}
          <div className="pt-3 border-t border-border/40 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
              Settings & Data
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsBackupModalOpen(true);
              }}
              className="w-full justify-start gap-2.5 min-h-[42px] text-xs sm:text-sm bg-background/40 hover:bg-accent"
            >
              <Database className="h-4 w-4 text-primary shrink-0" />
              <span>Backup & Restore Data</span>
            </Button>

            <Button
              variant="ghost"
              onClick={toggleTheme}
              className="w-full justify-start gap-2.5 min-h-[42px] text-xs sm:text-sm text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Switch to Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-slate-700 shrink-0" />
                  <span>Switch to Dark Mode</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar - exactly 4 pages + Menu button */}
      <MobileBottomBar
        onToggleMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMenuOpen={isMobileMenuOpen}
      />

      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </>
  );
};
