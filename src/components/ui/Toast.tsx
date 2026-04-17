import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastTipo = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  open: boolean;
  mensaje: string;
  tipo?: ToastTipo;
  duracion?: number;
  onClose: () => void;
}

const CONFIG: Record<ToastTipo, {
  icono: React.ReactNode;
  clases: string;
}> = {
  success: {
    icono: <CheckCircle size={20} className="shrink-0" />,
    clases: 'bg-green-600 text-white shadow-green-200',
  },
  error: {
    icono: <XCircle size={20} className="shrink-0" />,
    clases: 'bg-red-600 text-white shadow-red-200',
  },
  warning: {
    icono: <AlertTriangle size={20} className="shrink-0" />,
    clases: 'bg-orange-500 text-white shadow-orange-200',
  },
  info: {
    icono: <Info size={20} className="shrink-0" />,
    clases: 'bg-blue-600 text-white shadow-blue-200',
  },
};

export function Toast({ open, mensaje, tipo = 'info', duracion = 4000, onClose }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, duracion);
    return () => clearTimeout(timer);
  }, [open, duracion, onClose]);

  if (!open) return null;

  const { icono, clases } = CONFIG[tipo];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl min-w-[280px] max-w-[480px] ${clases}`}
      >
        {icono}
        <span className="text-sm font-semibold flex-1 leading-snug">{mensaje}</span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors shrink-0"
          aria-label="Cerrar notificación"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}


export function useToast() {
  const [toast, setToast] = React.useState<{
    open: boolean;
    mensaje: string;
    tipo: ToastTipo;
  }>({ open: false, mensaje: '', tipo: 'info' });

  const mostrar = (mensaje: string, tipo: ToastTipo = 'info') => {
    setToast({ open: true, mensaje, tipo });
  };

  const cerrar = () => setToast(prev => ({ ...prev, open: false }));

  return { toast, mostrar, cerrar };
}
