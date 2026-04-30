import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { TarjetaGraficoProps } from "@/interfaces/components";

export const TarjetaGrafico: React.FC<TarjetaGraficoProps> = ({
  titulo,
  subtitulo,
  icono,
  colorIcono = 'from-blue-500 to-purple-600',
  children,
  isLoading = false,
  onRefresh,
  altura = 'h-72',
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow duration-300">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icono && (
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorIcono} flex items-center justify-center text-white shadow-sm shrink-0`}>
              {icono}
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{titulo}</h3>
            {subtitulo && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitulo}</p>}
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Actualizar gráfico"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-150"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className={`${altura} w-full relative flex items-center justify-center`}>
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
            <span className="text-xs">Cargando datos...</span>
          </div>
        ) : (
          <div className="w-full h-full">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
