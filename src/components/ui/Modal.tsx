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

      // Bloquear scroll en el contenedor principal del dashboard si existe
      const scrollContainer = document.getElementById('dashboard-scroll-container');
      let originalScrollContainerOverflow = '';
      if (scrollContainer) {
        originalScrollContainerOverflow = scrollContainer.style.overflow;
        scrollContainer.style.overflow = 'hidden';
      }

      // Evitar que el gesto de arrastrar (touchmove) en iOS haga scroll en el fondo
      const handleTouchMove = (e: TouchEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.modal-scroll-content')) {
          if (e.cancelable) e.preventDefault();
        }
      };
      document.addEventListener('touchmove', handleTouchMove, { passive: false });

      const openModals = parseInt(document.body.getAttribute('data-modal-open') || '0', 10);
      document.body.setAttribute('data-modal-open', (openModals + 1).toString());

      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        const remainingModals = parseInt(document.body.getAttribute('data-modal-open') || '1', 10) - 1;
        document.body.setAttribute('data-modal-open', remainingModals.toString());

        if (remainingModals <= 0) {
          document.body.style.overflow = originalOverflow || '';
          if (scrollContainer) {
            scrollContainer.style.overflow = originalScrollContainerOverflow || 'auto';
          }
          document.body.removeAttribute('data-modal-open');

          // CLAVE: hacer blur() ANTES de que React desmonte el input.
          // Si no, Safari nunca dispara focusout y el viewport queda desplazado.
          const activeEl = document.activeElement as HTMLElement | null;
          if (activeEl && typeof activeEl.blur === 'function') {
            activeEl.blur();
          }

          // Reset del visual viewport de iOS con la API nativa (la única fiable con position:fixed en body)
          const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
            ((navigator as any).platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
          if (isIOS) {
            // Intentar inmediatamente y a los 300ms (cuando el teclado se ha cerrado del todo)
            const doReset = () => {
              if (window.visualViewport) {
                const vv = window.visualViewport;
                if (vv.offsetTop !== 0 || vv.pageTop !== 0) {
                  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
                }
              } else {
                window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
              }
            };
            doReset();
            setTimeout(doReset, 150);
            setTimeout(doReset, 350);
          }
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
              <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-1 shrink-0">
                {title ? (
                  typeof title === 'string' ? (
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white tracking-tight">
                      {title}
                    </h3>
                  ) : title
                ) : <div />}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 active:scale-90"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Cuerpo */}
            <div className="modal-scroll-content px-4 sm:px-6 pb-5 pt-1 overflow-y-auto flex-1 custom-scrollbar">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-center gap-3">
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
