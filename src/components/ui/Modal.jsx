import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Modal({ open, onClose, title, subtitle, children, size = 'md', footer }) {
  const ref = useRef();

  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        ref={ref}
        className={cn(
          'relative w-full bg-white dark:bg-warm-900 sm:rounded-2xl shadow-2xl',
          'border-0 sm:border border-warm-200 dark:border-warm-700',
          'animate-slide-in-up flex flex-col max-h-[95vh] sm:max-h-[88vh]',
          'rounded-t-2xl sm:rounded-2xl',
          sizes[size]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-warm-100 dark:border-warm-800 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-warm-900 dark:text-warm-100">{title}</h2>
            {subtitle && <p className="text-xs text-warm-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-4 w-8 h-8 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-800 flex items-center justify-center text-warm-400 hover:text-warm-600 transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-5 pt-4 border-t border-warm-100 dark:border-warm-800 flex items-center justify-end gap-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Field({ label, error, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className={`label ${required ? "after:content-['*'] after:text-red-400 after:ml-0.5" : ''}`}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-warm-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn('input', className)} {...props}>
      {children}
    </select>
  );
}

export function ConfirmDialog({ open, message, onConfirm, onCancel, dangerous = true }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-warm-900 rounded-2xl shadow-2xl border border-warm-200 dark:border-warm-700 p-6 max-w-sm w-full animate-scale-in">
        <h3 className="font-semibold text-warm-900 dark:text-warm-100 mb-2">Confirm action</h3>
        <p className="text-sm text-warm-500 mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={dangerous ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
