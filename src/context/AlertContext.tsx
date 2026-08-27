import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { AlertDialog, type AlertType } from '../components/ui/AlertDialog';

interface AlertOptions {
  title: string;
  message: string;
  type?: AlertType;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ConfirmOptions extends AlertOptions {
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  showConfirm: (options: ConfirmOptions) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    type: AlertType;
    isConfirm: boolean;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  const showAlert = (options: AlertOptions) => {
    setAlertConfig({
      ...options,
      type: options.type || 'info',
      isConfirm: false,
      onConfirm: () => setIsOpen(false),
    });
    setIsOpen(true);
  };

  const showConfirm = (options: ConfirmOptions) => {
    setAlertConfig({
      ...options,
      type: options.type || 'warning',
      isConfirm: true,
      onConfirm: () => {
        setIsOpen(false);
        options.onConfirm();
      },
    });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {alertConfig && (
        <AlertDialog
          isOpen={isOpen}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          isConfirm={alertConfig.isConfirm}
          confirmLabel={alertConfig.confirmLabel}
          cancelLabel={alertConfig.cancelLabel}
          onConfirm={alertConfig.onConfirm}
          onCancel={handleClose}
        />
      )}
    </AlertContext.Provider>
  );
};
