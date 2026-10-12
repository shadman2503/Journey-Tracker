import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  BookOpen,
  Calendar,
  AlertCircle,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MobileBottomBarProps {
  onToggleMenu: () => void;
  isMenuOpen: boolean;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  onToggleMenu,
  isMenuOpen,
}) => {
  // Only four primary pages visible in the bottom navbar
  const primaryTabs = [
    { name: 'Dashboard', path: '/', icon: Compass },
    { name: 'Syllabus', path: '/syllabus', icon: BookOpen },
    { name: 'Study Log', path: '/study-log', icon: Calendar },
    { name: 'Mistakes', path: '/mistakes', icon: AlertCircle },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden shadow-lg"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {primaryTabs.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors select-none',
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'p-1 rounded-full transition-colors',
                      isActive ? 'bg-primary/10' : 'bg-transparent'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="mt-0.5 tracking-tight">{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* Menu Trigger */}
        <button
          type="button"
          onClick={onToggleMenu}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          className={cn(
            'flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors select-none',
            isMenuOpen
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <div
            className={cn(
              'p-1 rounded-full transition-colors',
              isMenuOpen ? 'bg-primary/10' : 'bg-transparent'
            )}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </div>
          <span className="mt-0.5 tracking-tight">{isMenuOpen ? 'Close' : 'Menu'}</span>
        </button>
      </div>
    </nav>
  );
};
