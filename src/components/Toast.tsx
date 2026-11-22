import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all transform translate-y-0 animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            t.type === 'success'
              ? 'bg-emerald-950/90 text-white border-emerald-500/40 shadow-emerald-900/20'
              : t.type === 'error'
              ? 'bg-rose-950/90 text-white border-rose-500/40 shadow-rose-900/20'
              : 'bg-slate-900/90 text-white border-slate-700 shadow-black/20'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
          </div>

          <div className="flex-1 min-w-0">
            {t.title && <h5 className="text-xs font-bold leading-tight">{t.title}</h5>}
            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{t.message}</p>
          </div>

          <button
            onClick={() => onDismiss(t.id)}
            className="shrink-0 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
