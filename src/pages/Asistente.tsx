import React from 'react';
import { ChatIA } from '@/components/app/graficos/ChatIA';

export const Asistente: React.FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-7xl flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-100 dark:border-neutral-800 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Asistente Inteligente</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 uppercase tracking-widest font-semibold opacity-70">
            Consulta datos, genera análisis y resuelve dudas sobre el museo
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden min-h-[600px]">
        <ChatIA />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-1">Análisis de Datos</h3>
          <p className="text-xs text-blue-600 dark:text-blue-400">Pregunta sobre tendencias de visitantes o picos de actividad.</p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
          <h3 className="font-semibold text-purple-800 dark:text-purple-300 text-sm mb-1">Consultas Geográficas</h3>
          <p className="text-xs text-purple-600 dark:text-purple-400">Compara la procedencia de los visitantes entre distintos meses.</p>
        </div>
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
          <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm mb-1">Predicciones</h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Solicita proyecciones basadas en los datos actuales.</p>
        </div>
      </div>
    </div>
  );
};

export default Asistente;
