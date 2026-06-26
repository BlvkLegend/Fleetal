import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../ui/Toast';
import { CommandPalette } from '../ui/CommandPalette';
import { useUIStore } from '../../store/ui';
import { cn } from '../../lib/utils';

const PAGE_TITLES = {
  '/':           'Dashboard',
  '/deliveries': 'Deliveries',
  '/drivers':    'Drivers',
  '/fleet':      'Fleet Management',
  '/customers':  'Customers',
  '/analytics':  'Analytics',
  '/settings':   'Settings',
};

export function AppLayout() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  const title = PAGE_TITLES[pathname]
    || PAGE_TITLES[Object.keys(PAGE_TITLES).find(k => k !== '/' && pathname.startsWith(k))]
    || 'Fleetal';

  return (
    <div className="flex h-screen overflow-hidden bg-warm-50 dark:bg-warm-950">
      {/* Desktop sidebar — always visible, collapsible */}
      <div className="hidden lg:flex flex-col relative">
        <Sidebar collapsed={collapsed} />
        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-full flex items-center justify-center text-warm-400 hover:text-warm-600 shadow-sm transition-colors z-10"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={cn('transition-transform', collapsed && 'rotate-180')}>
            <path d="M6.5 2L3.5 5L6.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Mobile sidebar overlay + panel */}
      {mobileOpen && (
        <>
          <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 h-full z-30 flex lg:hidden animate-slide-in-right">
            <Sidebar collapsed={false} onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
      <CommandPalette />
    </div>
  );
}
