import React from 'react';
import { PencilLine } from 'lucide-react';

export const Notas: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="bg-amber-50 p-6 rounded-3xl mb-6 shadow-sm border border-amber-100">
        <PencilLine size={64} className="text-amber-600" />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">Notas y Tareas</h2>
      <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
        Sección de notas personales y del equipo. Podrás añadir recordatorios y gestionar tareas pendientes aquí.
      </p>
    </div>
  );
};
