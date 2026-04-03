import React from 'react';
import { BarChart3 } from 'lucide-react';

export const Graficos: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="bg-blue-50 p-6 rounded-3xl mb-6 shadow-sm border border-blue-100">
        <BarChart3 size={64} className="text-blue-600" />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">Gráficos Estadísticos</h2>
      <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
        Esta sección estará dedicada al análisis visual de datos de visitantes. Próximamente podrás ver gráficas interactivas y reportes detallados.
      </p>
    </div>
  );
};
