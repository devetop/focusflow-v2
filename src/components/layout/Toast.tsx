import React, { useEffect } from 'react';
import type { ToastMessage } from '../../types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      onDismiss(toasts[0].id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between p-4 bg-white/95 backdrop-blur-md border border-[#F0EDE8] rounded-2xl shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#7CD4B0] flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#ba1a1a] flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-[#7657D9] flex-shrink-0" />}
            <p className="text-sm font-medium text-[#2A2538]">{toast.message}</p>
          </div>

          <div className="flex items-center gap-2 ml-3">
            {toast.actionLabel && toast.onAction && (
              <button
                onClick={() => {
                  toast.onAction?.();
                  onDismiss(toast.id);
                }}
                className="text-xs font-bold text-[#7657D9] hover:underline px-2 py-1 rounded-lg hover:bg-[#EFEBFC]"
              >
                {toast.actionLabel}
              </button>
            )}
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#9E98AB] hover:text-[#2A2538] p-1 rounded-lg"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
