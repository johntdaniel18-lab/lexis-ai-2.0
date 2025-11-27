import React, { useState, useEffect } from 'react';
import Button from './common/Button';

interface AdminKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminKeyModal: React.FC<AdminKeyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setKey('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key === "Trung1122") {
      onSuccess();
    } else {
      setError('Invalid admin key. Please try again.');
      setKey('');
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h3 id="admin-modal-title" className="text-lg font-semibold text-slate-800">Admin Access</h3>
        <p className="text-sm text-slate-500 mt-1 mb-4">Please enter the key to access the admin portal.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-key" className="sr-only">Admin Key</label>
          <input
            id="admin-key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-slate-300'} bg-slate-50 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-slate-900`}
            placeholder="Enter admin key"
            autoFocus
          />
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminKeyModal;