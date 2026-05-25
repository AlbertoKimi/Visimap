import React, { lazy, Suspense } from 'react';

const GraficosPanel = lazy(() =>
  import('@/components/app/graficos/GraficosPanel').then(m => ({ default: m.GraficosPanel }))
);

const GraficosLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="size-10 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

/**
 * Vista de la página de Estadísticas (Dashboard Analítico).
 * Muestra el panel de control con todos los gráficos estadísticos
 * en tiempo real sobre la afluencia de visitantes.
 * @returns Componente de la vista de gráficos
 */
export const Graficos: React.FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-7xl flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Estadísticas del Museo</h1>
          <p className="page-subtitle">
            Datos en tiempo real · Auto-actualización cada 30 min
          </p>
        </div>
      </div>

      {/*Panel de gráficos*/}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
            Gráficos de seguimiento
          </span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        <Suspense fallback={<GraficosLoader />}>
          <GraficosPanel />
        </Suspense>
      </section>

    </div>
  );
};
