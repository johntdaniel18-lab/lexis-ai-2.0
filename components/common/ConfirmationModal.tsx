import React from 'react';
import Button from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'danger';
  isConfirming: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  isConfirming,
}) => {
  if (!isOpen) return null;

  // Use a self-contained spinner to avoid dependency issues and allow for color changes
  const spinner = <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        <h3 id="confirmation-modal-title" className="text-2xl font-extrabold text-slate-900">{title}</h3>
        <div className="text-slate-600 mt-4 mb-8 leading-relaxed">
          {children}
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isConfirming}>
            Cancel
          </Button>
          <Button type="button" variant={confirmVariant} onClick={onConfirm} disabled={isConfirming} className="flex items-center gap-2 min-w-[170px] justify-center">
            {isConfirming ? spinner : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
