import { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../store/ui';

const CONFIGS = {
  success: { icon: CheckCircle2, color: 'text-emerald-500', bar: 'bg-emerald-500' },
  error:   { icon: XCircle,      color: 'text-red-500',     bar: 'bg-red-500' },
  info:    { icon: Info,         color: 'text-teal-500',    bar: 'bg-teal-500' },
  warning: { icon: AlertTriangle,color: 'text-amber-500',   bar: 'bg-amber-500' },
};

function Toast({ notif }) {
  const dismiss = useUIStore(s => s.dismissNotification);
  const cfg = CONFIGS[notif.type] || CONFIGS.info;
  const Icon = cfg.icon;

  useEffect(() => {
    const t = setTimeout(() => dismiss(notif.id), 4500);
    return () => clearTimeout(t);
  }, [notif.id, dismiss]);

  return (
    <div className="relative overflow-hidden flex items-start gap-3 p-4 bg-white dark:bg-warm-800 rounded-xl border border-warm-200 dark:border-warm-700 shadow-lg min-w-[300px] max-w-sm animate-slide-in-up">
      {/* Progress bar */}
      <div className={cn('absolute bottom-0 left-0 h-0.5 animate-[shrink_4.5s_linear_forwards]', cfg.bar)} style={{ width: '100%', transformOrigin: 'left' }} />
      <Icon size={16} className={cn('flex-shrink-0 mt-0.5', cfg.color)} />
      <div className="flex-1 min-w-0">
        {notif.title && <p className="text-sm font-semibold text-warm-900 dark:text-warm-100 leading-snug">{notif.title}</p>}
        {notif.message && <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5 leading-snug">{notif.message}</p>}
      </div>
      <button
        onClick={() => dismiss(notif.id)}
        className="text-warm-400 hover:text-warm-600 transition-colors flex-shrink-0 mt-0.5"
      >
        <X size={13} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const notifications = useUIStore(s => s.notifications);
  const toasts = notifications.filter(n => !n.read && n.toast);
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.slice(0, 3).map(n => (
        <div key={n.id} className="pointer-events-auto">
          <Toast notif={n} />
        </div>
      ))}
    </div>
  );
}
