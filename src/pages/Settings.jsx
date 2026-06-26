import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUIStore, DRIVER_SESSION } from '../store/ui';
import { useNotify } from '../hooks';
import { seedStorage, clearStorage } from '../data/seed';
import { Shield, Moon, Bell, Database, RefreshCw, Palette, User, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-warm-100 dark:border-warm-800 bg-warm-50/60 dark:bg-warm-800/40">
        <Icon size={14} className="text-warm-500" />
        <h3 className="text-sm font-semibold text-warm-800 dark:text-warm-200">{title}</h3>
      </div>
      <div className="divide-y divide-warm-100 dark:divide-warm-800">{children}</div>
    </div>
  );
}

function Row({ label, description, control }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-warm-800 dark:text-warm-200">{label}</p>
        {description && <p className="text-xs text-warm-400 mt-0.5 leading-snug">{description}</p>}
      </div>
      <div className="flex-shrink-0">{control}</div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-10 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2',
        checked ? 'bg-teal-600' : 'bg-warm-300 dark:bg-warm-600'
      )}
      style={{ height: 22 }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(0)' }}
      />
    </button>
  );
}

export function Settings() {
  const { theme, toggleTheme, role, setRole, setWorkspaceMode } = useUIStore();
  const notify = useNotify();
  const qc = useQueryClient();
  const [notifs, setNotifs] = useState({ deliveries: true, drivers: true, system: false });

  function resetToSeed() {
    clearStorage();
    seedStorage();
    setWorkspaceMode('seeded');
    qc.invalidateQueries();
    notify('success', 'Data reset', 'Demo data has been regenerated.');
  }

  function clearAll() {
    clearStorage();
    setWorkspaceMode('empty');
    qc.invalidateQueries();
    notify('info', 'Workspace cleared', 'All data has been removed.');
  }

  const roles = [
    { id: 'admin',      label: 'Admin',      desc: 'Full access: create, edit, delete all records' },
    { id: 'dispatcher', label: 'Dispatcher', desc: 'Can edit deliveries and drivers, cannot delete' },
    { id: 'driver',     label: 'Driver',     desc: `Scoped to ${DRIVER_SESSION.driverName}'s deliveries only` },
    { id: 'viewer',     label: 'Viewer',     desc: 'Read-only access, no mutations' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-2xl">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-warm-900 dark:text-warm-100">Settings</h2>
        <p className="text-xs sm:text-sm text-warm-500 mt-0.5">Configure your Fleetal workspace</p>
      </div>

      <Section title="Appearance" icon={Palette}>
        <Row
          label="Dark mode"
          description="Toggle between light and dark interface"
          control={<Toggle checked={theme === 'dark'} onChange={() => toggleTheme()} />}
        />
      </Section>

      <Section title="Role simulation" icon={Shield}>
        <div className="p-5">
          <p className="text-xs text-warm-400 mb-4">
            Simulate different access levels to see how the UI adapts. In production, this would come from authentication.
          </p>
          <div className="space-y-2">
            {roles.map(r => (
              <button
                key={r.id}
                onClick={() => { setRole(r.id); notify('info', 'Role changed', `Viewing as ${r.label}.`); }}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-xl border transition-all',
                  role === r.id
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40'
                    : 'border-warm-200 dark:border-warm-700 hover:border-warm-300 dark:hover:border-warm-600'
                )}
              >
                <div className="flex items-center justify-between">
                  <p className={cn('text-sm font-semibold', role === r.id ? 'text-teal-700 dark:text-teal-300' : 'text-warm-800 dark:text-warm-200')}>
                    {r.label}
                  </p>
                  {role === r.id && (
                    <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/60 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-warm-400 mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Notifications" icon={Bell}>
        <Row label="Delivery updates" description="Alert when status changes" control={<Toggle checked={notifs.deliveries} onChange={v => setNotifs(n => ({ ...n, deliveries: v }))} />} />
        <Row label="Driver alerts" description="License expiry, off-duty status" control={<Toggle checked={notifs.drivers} onChange={v => setNotifs(n => ({ ...n, drivers: v }))} />} />
        <Row label="System alerts" description="Maintenance reminders, health" control={<Toggle checked={notifs.system} onChange={v => setNotifs(n => ({ ...n, system: v }))} />} />
      </Section>

      <Section title="Data management" icon={Database}>
        <Row
          label="Reset to demo data"
          description="Repopulate with realistic Lagos logistics seed data."
          control={
            <button onClick={resetToSeed} className="btn-secondary text-xs gap-1.5">
              <RefreshCw size={12} />Reset demo
            </button>
          }
        />
        <Row
          label="Clear all data"
          description="Remove everything and start with an empty workspace."
          control={
            <button onClick={clearAll} className="btn-secondary text-xs gap-1.5 text-red-600 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30">
              <Database size={12} />Clear all
            </button>
          }
        />
      </Section>

      <div className="flex items-center justify-center gap-2 pt-2 text-xs text-warm-400">
        <Zap size={11} className="text-teal-500" />
        Fleetal v1.0.0 — Built by Aloba Iyunadeoluwa
      </div>
    </div>
  );
}
