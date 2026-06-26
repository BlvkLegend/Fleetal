import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export function Dropdown({ trigger, items, align = 'left', width = 'w-48' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div className={cn(
          'absolute top-full mt-1.5 z-30 bg-white dark:bg-warm-800',
          'border border-warm-200 dark:border-warm-700 rounded-xl shadow-xl',
          'animate-scale-in overflow-hidden py-1',
          width,
          align === 'right' ? 'right-0' : 'left-0'
        )}>
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="h-px bg-warm-100 dark:bg-warm-700 my-1" />
            ) : item.heading ? (
              <p key={i} className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-warm-400">{item.heading}</p>
            ) : (
              <button
                key={i}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors disabled:opacity-40',
                  item.danger
                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
                    : 'text-warm-700 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-700/60'
                )}
                onClick={() => { item.onClick?.(); setOpen(false); }}
                disabled={item.disabled}
              >
                {item.icon && <item.icon size={14} className="flex-shrink-0" />}
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">{item.badge}</span>}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
