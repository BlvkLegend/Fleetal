import { useUIStore } from '../store/ui';
import { seedStorage, clearStorage } from '../data/seed';
import { useQueryClient } from '@tanstack/react-query';
import { Database, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { useNotify } from '../hooks';

export function WorkspaceBanner() {
  const { workspaceMode, setWorkspaceMode } = useUIStore();
  const [dismissed, setDismissed] = useState(false);
  const qc = useQueryClient();
  const notify = useNotify();

  if (dismissed) return null;

  function switchToEmpty() {
    clearStorage();
    setWorkspaceMode('empty');
    qc.invalidateQueries();
    notify('info', 'Empty workspace', 'All data cleared. Start adding your own records.');
  }

  function switchToSeeded() {
    clearStorage();
    seedStorage();
    setWorkspaceMode('seeded');
    qc.invalidateQueries();
    notify('success', 'Demo data restored', 'Seeded with realistic Lagos logistics data.');
  }

  return (
    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 px-4 py-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl text-sm">
      <div className="flex items-center gap-2.5 min-w-0">
        {workspaceMode === 'seeded'
          ? <Database size={15} className="text-teal-600 dark:text-teal-400 flex-shrink-0" />
          : <Sparkles size={15} className="text-teal-600 dark:text-teal-400 flex-shrink-0" />
        }
        <span className="text-teal-800 dark:text-teal-300 font-medium truncate">
          {workspaceMode === 'seeded'
            ? 'Demo mode — pre-loaded with sample Lagos logistics data'
            : 'Empty workspace — add your own data to get started'}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {workspaceMode === 'seeded' ? (
          <button
            onClick={switchToEmpty}
            className="text-xs font-semibold text-teal-700 dark:text-teal-300 hover:text-teal-900 dark:hover:text-teal-100 underline underline-offset-2 transition-colors whitespace-nowrap"
          >
            Switch to empty
          </button>
        ) : (
          <button
            onClick={switchToSeeded}
            className="text-xs font-semibold text-teal-700 dark:text-teal-300 hover:text-teal-900 dark:hover:text-teal-100 underline underline-offset-2 transition-colors whitespace-nowrap"
          >
            Load demo data
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="text-teal-500 hover:text-teal-700 dark:hover:text-teal-300 transition-colors p-0.5"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
