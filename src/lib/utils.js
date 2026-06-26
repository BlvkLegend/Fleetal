import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...args) { return twMerge(clsx(args)); }

export function fmtCurrency(n, compact = false) {
  if (compact && n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (compact && n >= 1_000) return `₦${(n / 1_000).toFixed(0)}k`;
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
}

export function fmtNumber(n) { return new Intl.NumberFormat('en').format(n); }

export function fmtRelTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export const STATUS_CONFIG = {
  delivered:   { label: 'Delivered',   color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' },
  'in-transit':{ label: 'In Transit',  color: 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400' },
  pending:     { label: 'Pending',     color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' },
  failed:      { label: 'Failed',      color: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' },
  returned:    { label: 'Returned',    color: 'bg-warm-100 text-warm-600 dark:bg-warm-800 dark:text-warm-300' },
  active:      { label: 'Active',      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' },
  inactive:    { label: 'Inactive',    color: 'bg-warm-100 text-warm-600 dark:bg-warm-800 dark:text-warm-300' },
  'on-leave':  { label: 'On Leave',    color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' },
  maintenance: { label: 'Maintenance', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400' },
  enterprise:  { label: 'Enterprise',  color: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400' },
  business:    { label: 'Business',    color: 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400' },
  starter:     { label: 'Starter',     color: 'bg-warm-100 text-warm-600 dark:bg-warm-800 dark:text-warm-300' },
  high:        { label: 'High',        color: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' },
  normal:      { label: 'Normal',      color: 'bg-warm-100 text-warm-600 dark:bg-warm-800 dark:text-warm-300' },
  low:         { label: 'Low',         color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' },
};

export function paginate(items, page, perPage) {
  const start = (page - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    total: items.length,
    pages: Math.max(1, Math.ceil(items.length / perPage)),
  };
}
