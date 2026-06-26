import { useState, useEffect, useRef } from 'react';
import { Search, Package, Users, Truck, BarChart2, Settings, LayoutDashboard, UserCheck, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/ui';
import { cn } from '../../lib/utils';

const COMMANDS = [
  { label: 'Dashboard',       icon: LayoutDashboard, path: '/',           group: 'Navigate' },
  { label: 'Deliveries',      icon: Package,         path: '/deliveries', group: 'Navigate' },
  { label: 'Drivers',         icon: UserCheck,       path: '/drivers',    group: 'Navigate' },
  { label: 'Fleet',           icon: Truck,           path: '/fleet',      group: 'Navigate' },
  { label: 'Customers',       icon: Users,           path: '/customers',  group: 'Navigate' },
  { label: 'Analytics',       icon: BarChart2,       path: '/analytics',  group: 'Navigate' },
  { label: 'Settings',        icon: Settings,        path: '/settings',   group: 'Navigate' },
  { label: 'New delivery',    icon: Plus,            path: '/deliveries?new=1', group: 'Actions' },
  { label: 'Add driver',      icon: Plus,            path: '/drivers?new=1',    group: 'Actions' },
  { label: 'Add customer',    icon: Plus,            path: '/customers?new=1',  group: 'Actions' },
];

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useUIStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCommandOpen]);

  useEffect(() => {
    if (commandOpen) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandOpen]);

  const filtered = query
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS;

  function go(cmd) {
    navigate(cmd.path);
    setCommandOpen(false);
  }

  function handleKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && filtered[selected]) go(filtered[selected]);
    if (e.key === 'Escape') setCommandOpen(false);
  }

  if (!commandOpen) return null;

  const groups = [...new Set(filtered.map(c => c.group))];

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 sm:pt-24 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setCommandOpen(false)} />
      <div className="relative w-full max-w-lg bg-white dark:bg-warm-900 rounded-2xl shadow-2xl border border-warm-200 dark:border-warm-700 overflow-hidden animate-scale-in">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-warm-200 dark:border-warm-700">
          <Search size={15} className="text-warm-400 flex-shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-sm text-warm-900 dark:text-warm-100 placeholder:text-warm-400 outline-none"
            placeholder="Search commands and pages..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKey}
          />
          <kbd className="hidden sm:block text-xs text-warm-400 bg-warm-100 dark:bg-warm-700 rounded px-1.5 py-0.5 font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2">
          {groups.map(group => {
            const cmds = filtered.filter(c => c.group === group);
            const startIdx = filtered.indexOf(cmds[0]);
            return (
              <div key={group}>
                <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-warm-400 uppercase tracking-wider">{group}</p>
                {cmds.map((cmd, i) => {
                  const idx = startIdx + i;
                  return (
                    <button
                      key={cmd.path}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors',
                        idx === selected
                          ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                          : 'text-warm-700 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-700/50'
                      )}
                      onClick={() => go(cmd)}
                      onMouseEnter={() => setSelected(idx)}
                    >
                      <cmd.icon size={15} className="flex-shrink-0" />
                      {cmd.label}
                    </button>
                  );
                })}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center py-8 text-sm text-warm-400">No results for "{query}"</p>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-warm-100 dark:border-warm-800 px-4 py-2 flex items-center gap-4 text-xs text-warm-400">
          <span><kbd className="bg-warm-100 dark:bg-warm-700 rounded px-1 font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="bg-warm-100 dark:bg-warm-700 rounded px-1 font-mono">↵</kbd> select</span>
          <span className="ml-auto"><kbd className="bg-warm-100 dark:bg-warm-700 rounded px-1 font-mono">⌘K</kbd> open</span>
        </div>
      </div>
    </div>
  );
}
