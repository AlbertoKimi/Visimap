import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { ModalConfirmacionProps } from '@/interfaces/components';

/**
 * Modal genérico de confirmación de acciones destructivas o críticas.
 * Unifica el diseño de los diálogos de confirmación en toda la aplicación
 * (eliminaciones, cambios de estado, etc) utilizando estilos condicionales basados
 * en la severidad (danger, success, info, warning).
 * @param props.isOpen - Visibilidad del modal
 * @param props.titulo - Título principal
 * @param props.mensaje - Texto de confirmación
 * @param props.tipo - Temática de color según impacto de la acción
 * @param props.onConfirm - Función ejecutada al aceptar
 * @param props.onClose - Función ejecutada al cancelar
 */
export const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  mensaje,
  tipo = 'danger'
}) => {
  const btnClass = tipo === 'danger' ? 'bg-red-600 hover:bg-red-700' :
    tipo === 'warning' ? 'bg-orange-600 hover:bg-orange-700' :
    tipo === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' :
      'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90';

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="flex-1 px-6 py-3 rounded-2xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all active:scale-[0.98]"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={() => {
          onConfirm();
          onClose();
        }}
        className={`flex-1 px-6 py-3 rounded-2xl font-semibold text-white shadow-md transition-all active:scale-[0.98] ${btnClass}`}
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
