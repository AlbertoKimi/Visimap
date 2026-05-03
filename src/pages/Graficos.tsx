import { GraficosPanel } from '@/components/app/graficos/GraficosPanel';


export const Graficos: React.FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-7xl flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-100 dark:border-neutral-800 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Estadísticas del Museo</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 uppercase tracking-widest font-semibold opacity-70">
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

        <GraficosPanel />
      </section>

    </div>
  );
};
