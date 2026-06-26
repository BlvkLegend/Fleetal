import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, UserCheck, Truck, Users, BarChart2,
  Settings, ChevronLeft, Zap, X
} from 'lucide-react';
import { useUIStore } from '../../store/ui';
import { cn } from '../../lib/utils';

const NAV_GROUPS = [
  {
    label: 'Operations',
    items: [
      { label: 'Dashboard',  icon: LayoutDashboard, path: '/' },
      { label: 'Deliveries', icon: Package,         path: '/deliveries' },
      { label: 'Drivers',    icon: UserCheck,       path: '/drivers' },
      { label: 'Fleet',      icon: Truck,           path: '/fleet' },
      { label: 'Customers',  icon: Users,           path: '/customers' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Analytics',  icon: BarChart2,       path: '/analytics' },
    ],
  },
];

// Items hidden from driver role
const DRIVER_HIDDEN = ['/drivers', '/fleet', '/customers', '/analytics'];

function NavItem({ label, icon: Icon, path, collapsed, role }) {
  const location = useLocation();
  const active = path === '/'
    ? location.pathname === '/'
    : location.pathname.startsWith(path);

  if (role === 'driver' && DRIVER_HIDDEN.includes(path)) return null;

  return (
    <NavLink
      to={path}
      title={collapsed ? label : undefined}
      className={cn('nav-link', active && 'active', collapsed && 'justify-center px-0 py-3')}
    >
      <Icon size={17} className="flex-shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && active && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
      )}
    </NavLink>
  );
}

export function Sidebar({ collapsed, onClose }) {
  const { role } = useUIStore();

  return (
    <>
      {/* Sidebar panel */}
      <aside className={cn(
        'flex flex-col bg-white dark:bg-warm-900 border-r border-warm-200 dark:border-warm-800 flex-shrink-0 h-full transition-all duration-300 z-30',
        collapsed ? 'w-16' : 'w-60',
      )}>
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 border-b border-warm-200 dark:border-warm-800 flex-shrink-0',
          collapsed ? 'justify-center px-0' : 'px-4 gap-3',
        )}>
          <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-teal-200 dark:shadow-teal-950">
            <Zap size={15} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-warm-900 dark:text-warm-100 leading-none tracking-tight">Fleetal</p>
              <p className="text-[10px] text-warm-400 mt-0.5 leading-none">Logistics Platform</p>
            </div>
          )}
          {/* Mobile close button */}
          {onClose && !collapsed && (
            <button onClick={onClose} className="ml-auto lg:hidden p-1 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-800 text-warm-400">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-warm-400">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavItem key={item.path} {...item} collapsed={collapsed} role={role} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Settings at bottom */}
        <div className="border-t border-warm-200 dark:border-warm-800 p-2">
          <NavItem label="Settings" icon={Settings} path="/settings" collapsed={collapsed} role={role} />
        </div>
      </aside>
    </>
  );
}
