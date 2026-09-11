import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

let toastListener: ((toast: ToastMessage) => void) | null = null;

export const showToast = (title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
  if (toastListener) {
    toastListener({ id: Math.random().toString(), title, description, type });
  }
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastListener = (newToast) => {
      setToasts(prev => [...prev, newToast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 4000);
    };
    return () => {
      toastListener = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`p-4 rounded-xl border shadow-2xl backdrop-blur-md pointer-events-auto flex items-start justify-between gap-3 animate-fadeIn ${
            t.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
              : t.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/30 text-rose-200'
              : 'bg-rose-950/90 border-rose-500/30 text-rose-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />}

            <div>
              <div className="text-xs font-bold">{t.title}</div>
              {t.description && <div className="text-[11px] opacity-80 mt-0.5">{t.description}</div>}
            </div>
          </div>

          <button
            onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
            className="opacity-60 hover:opacity-100 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
