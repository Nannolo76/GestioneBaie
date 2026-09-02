import React from 'react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
  isAlert?: boolean;
  variant?: 'info' | 'warning' | 'danger' | 'success';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Conferma',
  cancelLabel = 'Annulla',
  onConfirm,
  onCancel,
  isDanger = false,
  isAlert = false,
  variant = 'info'
}) => {
  if (!isOpen) return null;

  const effectiveVariant = isDanger ? 'danger' : variant;

  let headerColor = 'bg-gradient-to-r from-blue-600 to-cyan-700';
  let buttonColor: any = 'primary';
  let icon = 'ℹ️';

  if (effectiveVariant === 'danger') {
    headerColor = 'bg-gradient-to-r from-red-600 to-rose-700';
    buttonColor = 'danger';
    icon = '🛑';
  } else if (effectiveVariant === 'warning') {
    headerColor = 'bg-gradient-to-r from-amber-500 to-orange-600';
    buttonColor = 'secondary';
    icon = '⚠️';
  } else if (effectiveVariant === 'success') {
    headerColor = 'bg-gradient-to-r from-green-600 to-emerald-700';
    buttonColor = 'primary';
    icon = '✅';
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-black/10 overflow-hidden transform transition-all scale-100">
        <div className={`p-4 text-white font-bold uppercase tracking-wide flex justify-between items-center ${headerColor}`}>
          <h3 className="flex items-center gap-2"><span>{icon}</span> {title}</h3>
          <button 
            onClick={onCancel}
            className="text-white/80 hover:text-white font-bold text-lg font-mono leading-none"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 font-sans text-sm whitespace-pre-wrap leading-relaxed">
            {message}
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-black/5">
          {!isAlert && (
            <Button variant="secondary" onClick={onCancel} className="text-xs">
              {cancelLabel}
            </Button>
          )}
          <Button 
            variant={buttonColor} 
            onClick={() => {
              onConfirm();
            }} 
            className="text-xs font-bold"
          >
            {isAlert ? 'OK' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
