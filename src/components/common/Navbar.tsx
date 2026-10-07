import React from 'react';
import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/components/ui/button';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useAppStore();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Compass },
    { name: 'Syllabus', path: '/syllabus', icon: BookOpen },
    { name: 'Study Log', path: '/study-log', icon: Calendar },
    { name: 'Mistakes', path: '/mistakes', icon: AlertCircle },
    { name: 'Mock Tests', path: '/mock-tests', icon: FileCheck },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Journey', path: '/journey', icon: MilestoneIcon },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-primary">
            <Compass className="h-6 w-6" />
            <span>DUET 2027</span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`
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
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

