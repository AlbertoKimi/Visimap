import { useState } from 'react';
import { ToastTipo } from '@/interfaces/ui';

export function useToast() {
  const [toast, setToast] = useState<{
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
