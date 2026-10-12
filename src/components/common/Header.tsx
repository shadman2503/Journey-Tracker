import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Compass,
  Database,
  Moon,
  Sun,
  Menu,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/components/ui/button';
import { DataBackupModal } from '@/components/backup/DataBackupModal';

export interface HeaderProps {
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen?: boolean;
}

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Dashboard Overview',
  '/syllabus': 'Syllabus Explorer',
  '/study-log': 'Study Log & Sessions',
  '/mistakes': 'Mistake Notebook',
  '/mock-tests': 'Mock Tests & Scores',
  '/analytics': 'Performance Analytics',
  '/journey': 'Journey Timeline & Milestones',
};

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  isMobileSidebarOpen = false,
}) => {
  const { theme, toggleTheme } = useAppStore();
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const location = useLocation();

  const currentTitle = ROUTE_TITLES[location.pathname] || 'DUET 2027 Tracker';

  return (
    <>
      <header
        className="sticky top-0 z-30 w-full h-16 border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
        data-testid="top-header"
      >
        <div className="flex h-full items-center justify-between px-4 sm:px-6">
          {/* Left section: Mobile hamburger + brand / Desktop page title */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleMobileSidebar}
              className="md:hidden text-muted-foreground hover:text-foreground"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileSidebarOpen}
              data-testid="mobile-sidebar-toggle"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Mobile Brand Title */}
            <div className="flex items-center gap-2 md:hidden font-bold text-base tracking-tight text-primary">
              <Compass className="h-5 w-5" />
              <span>DUET 2027</span>
            </div>

            {/* Desktop Current Page Title */}
            <h1 className="hidden md:block text-base font-semibold tracking-tight text-foreground">
              {currentTitle}
            </h1>
          </div>

          {/* Right section: Backup and Theme toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBackupModalOpen(true)}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-9 px-3"
              aria-label="Backup and restore data"
              data-testid="header-backup-btn"
            >
              <Database className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline font-medium">Backup</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
              data-testid="header-theme-toggle"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </>
  );
};

