import React from 'react';
import { BarChart2, RefreshCw, Sparkles } from 'lucide-react';
import { GraficosPanel } from '@/components/app/graficos/GraficosPanel';
import { ChatIA } from '@/components/app/graficos/ChatIA';

export const Graficos: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-2 relative min-h-full">

      {/* ── Cabecera ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-blue-600" />
            Estadísticas del Museo
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Datos en tiempo real · Auto-actualización cada 60 s
          </p>
        </div>

        {/* Badge auto-refresh */}
        <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full">
          <RefreshCw className="w-3 h-3 animate-spin [animation-duration:4s]" />
          Live
        </div>
      </div>

      {/* ── PARTE 1: Panel de gráficos automáticos ──────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2">
            Gráficos de seguimiento
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <GraficosPanel />
      </section>

      {/* ── PARTE 2: Chat con IA ─────────────────────────────────────────── */}
      <section className="sticky bottom-0 z-50 pt-4 pb-4">
        {/* Fondo semi-transparente para que no se superpongan visualmente los gráficos al scrollear por debajo */}
        <div className="absolute inset-0 bg-slate-50/95 backdrop-blur-md rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] -z-10" />
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Análisis con IA
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <ChatIA />
      </section>

    </div>
  );
};
