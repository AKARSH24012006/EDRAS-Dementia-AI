// Small UI kit in the original EDRAS MedTech style (sky/cyan glass, Inter, rounded-3xl).
import { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

export function Button({ variant = 'primary', size = 'md', className = '', loading, children, ...props }) {
  const sizes = { sm: 'text-xs px-3 py-2', md: 'text-xs px-4 py-2.5', lg: 'text-sm px-5 py-3.5' };
  const variants = {
    primary: 'btn-soft-primary',
    soft: 'btn-soft-secondary',
    outline: 'btn-soft-secondary',
    ghost: 'text-slate-600 dark:text-slate-300 hover:bg-sky-100/70 dark:hover:bg-slate-800',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-extrabold rounded-2xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

export function PageHeader({ badge, badgeIcon: Icon, title, subtitle, actions }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        {badge && (
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-3 py-1 text-xs font-extrabold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 rounded-full flex items-center gap-1.5">
              {Icon && <Icon className="w-3.5 h-3.5" />} {badge}
            </span>
          </div>
        )}
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium max-w-3xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 no-print">{actions}</div>}
    </div>
  );
}

export function Empty({ icon: Icon, title, children }) {
  return (
    <div className="text-center py-10 px-6">
      {Icon && <Icon className="w-9 h-9 mx-auto text-slate-400 mb-3" />}
      <p className="font-extrabold text-slate-900 dark:text-white">{title}</p>
      {children && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">{children}</p>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, width = 'max-w-2xl' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${width} med-panel rounded-3xl p-6 max-h-[90vh] overflow-y-auto rise`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-sky-100/70 dark:hover:bg-slate-800 text-slate-500 cursor-pointer" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
