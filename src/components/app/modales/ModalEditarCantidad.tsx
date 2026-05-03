import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ModalEditarCantidadProps } from '@/interfaces/components';

export const ModalEditarCantidad: React.FC<ModalEditarCantidadProps> = ({
  isOpen,
  onClose,
  onSave,
  cantidadActual,
  titulo
}) => {
  const [cantidad, setCantidad] = useState(cantidadActual);

  useEffect(() => {
    setCantidad(cantidadActual);
  }, [cantidadActual]);

  const footer = (
    <>
      <button
        onClick={onClose}
        className="flex-1 px-6 py-3 rounded-2xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all active:scale-[0.98]"
      >
        Cerrar
      </button>
      <button
        onClick={() => onSave(cantidad)}
        className="flex-1 px-6 py-3 rounded-2xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        Guardar
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titulo}
      footer={footer}
      size="sm"
    >
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
        Modifica el número de visitantes registrados para este registro.
      </p>

      <div className="space-y-4">
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
          Nueva Cantidad
        </label>
        <div className="relative group">
          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all appearance-none"
            autoFocus
            min="0"
          />
        </div>
      </div>
    </Modal>
  );
};
