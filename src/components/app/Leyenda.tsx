import React from 'react';
import { datosLeyenda } from "@/utils/ProvinciasColores";

export const LeyendaColores: React.FC = () => {
  return (
    <div className="absolute -left-36 top-1/2 -translate-y-1/2 z-30 pointer-events-none select-none transition-all duration-500">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-4 rounded-2xl border border-white/60 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <h4 className="text-[10px] font-black text-gray-600 dark:text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-gray-200/50 dark:border-slate-800">
          Comunidades
        </h4>

        <div className="flex flex-col gap-1.5">
          {datosLeyenda && datosLeyenda.map((item) => (
            <div key={item.nombre} className="flex items-center gap-2">
              <svg width="10" height="10" viewBox="0 0 12 12" className="flex-shrink-0 drop-shadow-sm">
                <circle cx="6" cy="6" r="6" className={`${item.color} stroke-gray-400 dark:stroke-slate-600 stroke-[0.3]`} />
              </svg>
              <span className="text-xs text-gray-600 dark:text-slate-400 font-semibold truncate leading-tight">
                {item.nombre}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
