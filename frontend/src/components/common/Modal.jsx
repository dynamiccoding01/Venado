import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) {
  // Prevent scrolling on the body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div 
        className={clsx(
          "relative w-full bg-white dark:bg-dark-card rounded-2xl shadow-2xl flex flex-col max-h-full overflow-hidden transform transition-all border border-slate-200 dark:border-dark-border",
          maxWidth
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-gray-border dark:border-dark-border bg-slate-50/50 dark:bg-slate-800/30">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
