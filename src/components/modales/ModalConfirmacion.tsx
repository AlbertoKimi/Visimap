import { X } from 'lucide-react';

interface ModalConfirmacionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo: string;
  mensaje: string;
  tipo?: 'danger' | 'warning' | 'info';
}

export const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  mensaje,
  tipo = 'danger'
}) => {
  if (!isOpen) return null;

  
  const btnClass = tipo === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 
                   tipo === 'warning' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200' : 
                   'bg-blue-600 hover:bg-blue-700 shadow-blue-200';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="p-8">
          <div className="flex justify-end items-start mb-2">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 mb-2">{titulo}</h3>
          <p className="text-slate-500 leading-relaxed">
            {mensaje}
          </p>
        </div>
        
        <div className="p-6 bg-slate-50/50 flex flex-col sm:flex-row gap-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-2xl font-semibold text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all active:scale-[0.98]"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-6 py-3 rounded-2xl font-semibold text-white shadow-lg transition-all active:scale-[0.98] ${btnClass}`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
