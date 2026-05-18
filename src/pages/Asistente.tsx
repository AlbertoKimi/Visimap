import React from 'react';
import { ChatIA } from '@/components/app/graficos/ChatIA';

/**
 * Vista de la página del Asistente Inteligente.
 * Renderiza el contenedor principal que aloja el componente `ChatIA`
 * permitiendo al administrador realizar consultas en lenguaje natural.
 * @returns Componente de la vista del asistente
 */
export const Asistente: React.FC = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)] w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-slate-100 dark:border-neutral-800 pb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Asistente Inteligente</h1>
          <p className="page-subtitle">
            Consulta datos, genera análisis y resuelve dudas sobre el museo
          </p>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col min-h-[650px] mb-4">
        <ChatIA />
      </div>
    </div>
  );
};

export default Asistente;
