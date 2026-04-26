import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalEditarCantidadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nuevaCantidad: number) => void;
  cantidadActual: number;
  titulo: string;
}

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden transform animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
        <div className="p-8">
          <div className="flex justify-end items-start mb-2">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X size={20} />
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{titulo}</h3>
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
        </div>
        
        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 flex gap-3 border-t border-slate-100 dark:border-slate-800">
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
        </div>
      </div>
    </div>
  );
};
