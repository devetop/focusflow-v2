import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A2538]/30 backdrop-blur-xs p-4">
      <div
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#F0EDE8] transition-all animate-in zoom-in-95"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${danger ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#EFEBFC] text-[#7657D9]'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 id="confirm-dialog-title" className="text-lg font-bold text-[#2A2538]">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-xl text-[#9E98AB] hover:text-[#2A2538] hover:bg-[#F5F2EE]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-4 text-sm text-[#6D677D] leading-relaxed">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#6D677D] hover:bg-[#F5F2EE] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all shadow-md active:scale-95 ${
              danger
                ? 'bg-[#ba1a1a] hover:bg-[#93000a]'
                : 'bg-[#7657D9] hover:bg-[#6645C8]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
