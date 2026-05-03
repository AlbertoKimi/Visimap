import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/utils';
import { ModalProps } from '@/interfaces/ui';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  'full': 'max-w-[95vw] md:max-w-[90vw] lg:max-w-[80vw]',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Cuando el modal está abierta
      const openModals = parseInt(document.body.getAttribute('data-modal-open') || '0', 10);
      document.body.setAttribute('data-modal-open', (openModals + 1).toString());

      return () => {
        const remainingModals = parseInt(document.body.getAttribute('data-modal-open') || '1', 10) - 1;
        document.body.setAttribute('data-modal-open', remainingModals.toString());

        if (remainingModals <= 0) {
          document.body.style.overflow = originalOverflow || 'unset';
          document.body.removeAttribute('data-modal-open');
        }
      };
    }
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]",
              sizeClasses[size]
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                {title ? (
                  typeof title === 'string' ? (
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                      {title}
                    </h3>
                  ) : title
                ) : <div />}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 active:scale-90"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Cuerpo */}
            <div className="p-6 pt-2 overflow-y-auto flex-1 custom-scrollbar">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-center gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
