import React from 'react';
import { ClipboardList } from 'lucide-react';

export const RegistroVisitante: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="bg-emerald-50 p-6 rounded-3xl mb-6 shadow-sm border border-emerald-100">
        <ClipboardList size={64} className="text-emerald-600" />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">Registro de Visitantes</h2>
      <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
        Aquí podrás gestionar el registro detallado de los visitantes. Esta sección permitirá un control exhaustivo de entradas y salidas.
      </p>
    </div>
  );
};
