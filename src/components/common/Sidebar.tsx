import React, { useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Compass,
  Trophy,
  BookOpen,
  Calendar,
  AlertCircle,
  FileCheck,
  BarChart3,
  Milestone as MilestoneIcon,
  X,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useDialogAccessibility } from '@/hooks/useDialogAccessibility';

export interface NavItem {
  name: string;
  path: string;
  icon: React.FC<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: Compass },
  { name: 'Syllabus', path: '/syllabus', icon: BookOpen },
  { name: 'Study Log', path: '/study-log', icon: Calendar },
  { name: 'Mistakes', path: '/mistakes', icon: AlertCircle },
  { name: 'Mock Tests', path: '/mock-tests', icon: FileCheck },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Journey', path: '/journey', icon: MilestoneIcon },
];

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose = () => {},
}) => {
  const location = useLocation();
  const mobileDrawerRef = useRef<HTMLDivElement>(null);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  const isFirstRender = useRef(true);
  // Auto-close mobile drawer on route navigation
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onCloseRef.current();
  }, [location.pathname]);

  // Hook for mobile drawer focus trap & escape dismissal
  useDialogAccessibility({
    isOpen,
    onClose,
    containerRef: mobileDrawerRef,
  });

  const renderNavLinks = (isMobile = false) => (
    <nav
      role="navigation"
      aria-label={isMobile ? 'Mobile Navigation' : 'Sidebar Navigation'}
      className="p-3 space-y-1 flex-1 overflow-y-auto"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => isMobile && onClose()}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group min-h-[42px]',
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    'h-4.5 w-4.5 shrink-0 transition-colors',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
                  )}
                />
                <span className="truncate">{item.name}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Left-Side Vertical Sidebar (Hidden on Mobile) */}
      <aside
        className="hidden md:flex flex-col w-64 shrink-0 border-r border-border/50 bg-card/60 backdrop-blur-xl h-screen sticky top-0 z-40 select-none"
        aria-label="Application Sidebar"
        data-testid="desktop-sidebar"
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-border/40 shrink-0">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 shadow-xs">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-foreground leading-tight">
              DUET 2027
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Journey Tracker
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        {renderNavLinks(false)}

        {/* Footer: Developer Credit & Target Status */}
        <div className="p-3 border-t border-border/40 shrink-0 space-y-2">
          <a
            href="https://github.com/shadman2503"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-card/60 hover:bg-muted/50 border border-border/40 hover:border-primary/30 transition-all group shadow-2xs"
            title="Developed by Shadman Shoumik on GitHub"
          >
            <img
              src="https://github.com/shadman2503.png"
              alt="Shadman Shoumik"
              className="h-9 w-9 rounded-full border border-primary/40 object-cover ring-2 ring-primary/20 shrink-0 shadow-xs"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-muted-foreground leading-none">Developer</span>
              <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                Shadman Shoumik
              </span>
            </div>
            <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          <div className="px-3.5 py-1.5 rounded-xl bg-primary/5 border border-primary/15 text-[11px] text-muted-foreground flex items-center justify-between">
            <span className="font-medium">Target: DUET 2027</span>
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop Scrim */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50 backdrop-blur-xs md:hidden transition-opacity duration-300 ease-in-out',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        data-testid="mobile-sidebar-backdrop"
        aria-hidden={!isOpen}
      />

      {/* Mobile Responsive Left-Side Drawer */}
      <div
        ref={mobileDrawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Sidebar"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-border/50 shadow-2xl overflow-y-auto md:hidden flex flex-col',
          'bg-card/90 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80',
          'transition-all duration-300 ease-in-out',
          isOpen
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : '-translate-x-full opacity-0 pointer-events-none'
        )}
        data-testid="mobile-sidebar-drawer"
      >
        {/* Mobile Drawer Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-border/40 shrink-0 bg-background/40">
          <div className="flex items-center gap-2.5 font-bold text-base tracking-tight text-primary">
            <Trophy className="h-5 w-5" />
            <span>DUET 2027</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close navigation sidebar"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Navigation Content */}
        {renderNavLinks(true)}

        {/* Mobile Footer: Developer Credit & Target Status */}
        <div className="p-4 border-t border-border/40 shrink-0 bg-background/20 space-y-2.5">
          <a
            href="https://github.com/shadman2503"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-card/60 hover:bg-muted/50 border border-border/40 hover:border-primary/30 transition-all group shadow-2xs"
            title="Developed by Shadman Shoumik on GitHub"
          >
            <img
              src="https://github.com/shadman2503.png"
              alt="Shadman Shoumik"
              className="h-9 w-9 rounded-full border border-primary/40 object-cover ring-2 ring-primary/20 shrink-0 shadow-xs"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-muted-foreground leading-none">Developer</span>
              <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                Shadman Shoumik
              </span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          <div className="px-3.5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium flex items-center justify-between">
            <span>Target: DUET 2027</span>
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </div>
    </>
  );
};
