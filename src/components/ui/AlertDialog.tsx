import React from 'react';
import { Button } from './Button';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: AlertType;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isConfirm?: boolean;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  title,
  message,
  type = 'info',
  confirmLabel = 'OK',
  cancelLabel = 'Annulla',
  onConfirm,
  onCancel,
  isConfirm = false
}) => {
  if (!isOpen) return null;

  const headerColors = {
    success: 'bg-gradient-to-r from-emerald-500 to-green-600',
    error: 'bg-gradient-to-r from-red-600 to-rose-700',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-600',
    info: 'bg-gradient-to-r from-blue-600 to-cyan-700'
  };

  const buttonVariant = {
    success: 'primary',
    error: 'danger',
    warning: 'primary',
    info: 'primary'
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-black/10 overflow-hidden transform transition-all scale-100">
        <div className={`p-4 text-white font-bold uppercase tracking-wide flex justify-between items-center ${headerColors[type]}`}>
          <h3>{title}</h3>
          {isConfirm && onCancel && (
            <button 
              onClick={onCancel}
              className="text-white/80 hover:text-white font-bold text-lg font-mono leading-none focus:outline-none"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 font-sans text-sm whitespace-pre-wrap leading-relaxed">
            {message}
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-black/5">
          {isConfirm && onCancel && (
            <Button variant="secondary" onClick={onCancel} className="text-xs">
              {cancelLabel}
            </Button>
          )}
          <Button 
            variant={buttonVariant[type] as any} 
            onClick={onConfirm} 
            className="text-xs font-bold"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
