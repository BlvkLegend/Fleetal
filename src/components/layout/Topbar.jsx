import { Bell, Moon, Sun, Search, Command, ChevronDown, Menu } from 'lucide-react';
import { useUIStore, DRIVER_SESSION } from '../../store/ui';
import { Dropdown } from '../ui/Dropdown';
import { Avatar, RoleBadge } from '../ui/primitives';
import { fmtRelTime } from '../../lib/utils';

const ROLE_LABELS = {
  admin:      { name: 'Aloba I.', sub: 'Admin' },
  dispatcher: { name: 'Aloba I.', sub: 'Dispatcher' },
  driver:     { name: DRIVER_SESSION.driverName, sub: 'Driver' },
  viewer:     { name: 'Aloba I.', sub: 'Viewer' },
};

export function Topbar({ title, onMenuClick }) {
  const { theme, toggleTheme, setCommandOpen, notifications, markAllRead, role, setRole } = useUIStore();
  const unread = notifications.filter(n => !n.read).length;
  const user = ROLE_LABELS[role] || ROLE_LABELS.admin;

  const notifItems = notifications.length > 0
    ? [
        { heading: 'Recent' },
        ...notifications.slice(0, 4).map(n => ({
          label: n.title || n.message || 'Notification',
          onClick: () => {},
        })),
        { divider: true },
        { label: 'Mark all read', onClick: markAllRead },
      ]
    : [{ label: 'No notifications', onClick: () => {}, disabled: true }];

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-warm-900 border-b border-warm-200 dark:border-warm-800 flex-shrink-0 gap-3">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuClick}
          className="lg:hidden btn-ghost p-2 flex-shrink-0"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-sm sm:text-base font-semibold text-warm-900 dark:text-warm-100 truncate">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Command palette trigger (desktop) */}
        <button
          onClick={() => setCommandOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-warm-100 dark:bg-warm-800 hover:bg-warm-200 dark:hover:bg-warm-700 rounded-lg text-xs text-warm-500 dark:text-warm-400 transition-colors"
        >
          <Search size={12} />
          <span className="hidden lg:block">Quick search</span>
          <kbd className="hidden lg:flex items-center gap-0.5 text-[10px] bg-white dark:bg-warm-700 rounded px-1 border border-warm-200 dark:border-warm-600 font-mono">
            <Command size={9} />K
          </kbd>
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme} className="btn-ghost p-2">
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Notifications */}
        <Dropdown
          align="right"
          width="w-56"
          trigger={
            <button className="btn-ghost p-2 relative">
              <Bell size={16} />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full animate-pulse-dot" />
              )}
            </button>
          }
          items={notifItems}
        />

        {/* User / role switcher */}
        <Dropdown
          align="right"
          width="w-52"
          trigger={
            <button className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors">
              <Avatar name={user.name} size={28} />
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-xs font-semibold text-warm-800 dark:text-warm-200 leading-none truncate">{user.name}</p>
                <p className="text-[10px] text-warm-400 mt-0.5 capitalize">{user.sub}</p>
              </div>
              <ChevronDown size={12} className="text-warm-400 hidden sm:block" />
            </button>
          }
          items={[
            { heading: 'Switch Role' },
            { label: 'Admin',      onClick: () => setRole('admin'),      badge: role === 'admin'      ? '✓' : null },
            { label: 'Dispatcher', onClick: () => setRole('dispatcher'), badge: role === 'dispatcher' ? '✓' : null },
            { label: 'Driver',     onClick: () => setRole('driver'),     badge: role === 'driver'     ? '✓' : null },
            { label: 'Viewer',     onClick: () => setRole('viewer'),     badge: role === 'viewer'     ? '✓' : null },
            { divider: true },
            { label: 'Sign out', onClick: () => {}, danger: true },
          ]}
        />
      </div>
    </header>
  );
}
