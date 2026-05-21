import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ModalEditarCantidadProps } from '@/interfaces/components';

/**
 * Modal específico para la edición rápida in-line.
 * Se utiliza para corregir la afluencia registrada o añadir observaciones a posteriori
 * a un registro ya guardado sin tener que reconstruir todo el objeto original.
 * @param props.cantidadActual - Valor numérico previo
 * @param props.observacionesActuales - Texto previo
 * @param props.onSave - Lógica de actualización a invocar
 */
export const ModalEditarCantidad: React.FC<ModalEditarCantidadProps> = ({
  isOpen,
  onClose,
  onSave,
  cantidadActual,
  observacionesActuales,
  titulo
}) => {
  const [cantidad, setCantidad] = useState(cantidadActual);
  const [observaciones, setObservaciones] = useState(observacionesActuales || '');

  useEffect(() => {
    setCantidad(cantidadActual);
    setObservaciones(observacionesActuales || '');
  }, [cantidadActual, observacionesActuales]);

  const footer = (
    <>
      <button
        onClick={onClose}
        className="flex-1 px-6 py-3 rounded-2xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all active:scale-[0.98]"
      >
        Cerrar
      </button>
      <button
        onClick={() => onSave(cantidad, observaciones)}
        className="flex-1 px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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
        Modifica el número de visitantes y/o las observaciones para este registro.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2">
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

        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2">
            Observaciones (Opcional)
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all resize-none min-h-[100px]"
            placeholder="Añade o modifica las observaciones..."
          />
        </div>
      </div>
    </Modal>
  );
};
