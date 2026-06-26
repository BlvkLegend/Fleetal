import { cn, STATUS_CONFIG } from '../../lib/utils';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function Badge({ status, className, children }) {
  const cfg = STATUS_CONFIG[status] || {};
  return (
    <span className={cn('badge', cfg.color, className)}>
      {cfg.label || children}
    </span>
  );
}

export function Spinner({ size = 16, className }) {
  return <Loader2 size={size} className={cn('animate-spin text-teal-500', className)} />;
}

export function Avatar({ src, name, size = 32 }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';
  if (src) return <img src={src} alt={name} width={size} height={size} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return (
    <div
      className="rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-semibold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

export function Empty({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3 px-4">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-warm-100 dark:bg-warm-800 flex items-center justify-center mb-1">
          <Icon size={24} className="text-warm-400" />
        </div>
      )}
      <p className="font-semibold text-warm-800 dark:text-warm-200 text-base">{title}</p>
      {description && <p className="text-sm text-warm-500 max-w-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} />;
}

export function StatCard({ label, value, sub, icon: Icon, trend, color = 'teal', onClick }) {
  const iconColors = {
    teal:  'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400',
    green: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',
    red:   'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400',
    warm:  'bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-400',
  };

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : trend < 0 ? 'text-red-500' : 'text-warm-400';

  return (
    <div
      className={cn('stat-card flex flex-col gap-3 min-w-0', onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-150')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase tracking-wider leading-tight">{label}</p>
        {Icon && (
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', iconColors[color])}>
            <Icon size={17} />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-warm-900 dark:text-warm-100 leading-none truncate">{value}</p>
        {sub && <p className="text-xs text-warm-500 dark:text-warm-400 mt-1.5 leading-snug">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
          <TrendIcon size={12} />
          {trend > 0 ? '+' : ''}{trend}% vs last month
        </div>
      )}
    </div>
  );
}

export function ProgressBar({ value, max = 100, color = 'teal', className }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = {
    teal:  'bg-teal-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red:   'bg-red-500',
  };
  return (
    <div className={cn('h-1.5 bg-warm-200 dark:bg-warm-700 rounded-full overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', colors[color])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Tooltip({ children, label }) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-warm-900 dark:bg-warm-100 text-white dark:text-warm-900 text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
        {label}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-warm-900 dark:border-t-warm-100" />
      </div>
    </div>
  );
}

export function RoleBadge({ role }) {
  const cfg = {
    admin:      'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400',
    dispatcher: 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400',
    driver:     'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
    viewer:     'bg-warm-100 text-warm-600 dark:bg-warm-800 dark:text-warm-300',
  };
  return (
    <span className={cn('badge capitalize', cfg[role] || cfg.viewer)}>{role}</span>
  );
}
