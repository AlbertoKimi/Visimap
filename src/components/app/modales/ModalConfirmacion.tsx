import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { ModalConfirmacionProps } from '@/interfaces/components';

export const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  mensaje,
  tipo = 'danger'
}) => {
  const btnClass = tipo === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' :
    tipo === 'warning' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200' :
      'bg-blue-600 hover:bg-blue-700 shadow-blue-200';

  const footer = (
    <>
      <button
        onClick={onClose}
        className="flex-1 px-6 py-3 rounded-2xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all active:scale-[0.98]"
      >
        Cancelar
      </button>
      <button
        onClick={() => {
          onConfirm();
          onClose();
        }}
        className={`flex-1 px-6 py-3 rounded-2xl font-semibold text-white shadow-lg transition-all active:scale-[0.98] ${btnClass} dark:shadow-none`}
      >
        Confirmar
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titulo}
      footer={footer}
      size="md"
    >
      <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
        {mensaje}
      </p>
    </Modal>
  );
};
