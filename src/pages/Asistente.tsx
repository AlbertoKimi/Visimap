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
    <div className="container mx-auto p-3 sm:p-8 max-w-7xl flex flex-col h-[calc(100vh-5rem)] md:h-auto md:min-h-[calc(100vh-6rem)] w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="page-header !mb-4 md:!mb-6 !gap-2 !pb-4 md:!pb-6 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Asistente Inteligente</h1>
          <p className="page-subtitle text-xs md:text-sm">
            Consulta datos, genera análisis y resuelve dudas sobre el museo
          </p>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col min-h-0 mb-2">
        <ChatIA />
      </div>
    </div>
  );
};

export default Asistente;
